import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { throttle } from '@/lib/utils'
import { queryText, queryTextStream } from '@/api/lightrag'
import { errorMessage } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settings'
import { useDebounce } from '@/hooks/useDebounce'
import QuerySettings from '@/components/retrieval/QuerySettings'
import { ChatMessage, MessageWithError } from '@/components/retrieval/ChatMessage'
import { EraserIcon, SendIcon, PaperclipIcon, MicIcon, MicOffIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { QueryMode } from '@/api/lightrag'

// Helper function to generate unique IDs with browser compatibility
const generateUniqueId = () => {
  // Use crypto.randomUUID() if available
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback to timestamp + random string for browsers without crypto.randomUUID
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export default function RetrievalTesting() {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<MessageWithError[]>(() => {
    try {
      const history = useSettingsStore.getState().retrievalHistory || []
      // Ensure each message from history has a unique ID and mermaidRendered status
      return history.map((msg, index) => {
        try {
          const msgWithError = msg as MessageWithError // Cast to access potential properties
          return {
            ...msg,
            id: msgWithError.id || `hist-${Date.now()}-${index}`, // Add ID if missing
            mermaidRendered: msgWithError.mermaidRendered ?? true // Assume historical mermaid is rendered
          }
        } catch (error) {
          console.error('Error processing message:', error)
          // Return a default message if there's an error
          return {
            role: 'system',
            content: 'Error loading message',
            id: `error-${Date.now()}-${index}`,
            isError: true,
            mermaidRendered: true
          }
        }
      })
    } catch (error) {
      console.error('Error loading history:', error)
      return [] // Return an empty array if there's an error
    }
  })
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [inputError, setInputError] = useState('') // Error message for input
  const [searchQuery, setSearchQuery] = useState('') // Search query for chat history
  const [pinnedChats, setPinnedChats] = useState<Set<string>>(new Set()) // Track pinned chats
  const [attachments, setAttachments] = useState<File[]>([]) // Track file attachments
  const [isRecording, setIsRecording] = useState(false) // Track voice recording state
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null) // Media recorder for voice
  const [useLLM, setUseLLM] = useState(true) // Toggle for LLM usage
  // Reference to track if we should follow scroll during streaming (using ref for synchronous updates)
  const shouldFollowScrollRef = useRef(true)
  // Reference to track if user interaction is from the form area
  const isFormInteractionRef = useRef(false)
  // Reference to track if scroll was triggered programmatically
  const programmaticScrollRef = useRef(false)
  // Reference to track if we're currently receiving a streaming response
  const isReceivingResponseRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const retrievalHistory = useSettingsStore((state) => state.retrievalHistory)
  const setRetrievalHistory = useSettingsStore.use.setRetrievalHistory()

  // Group messages into conversations
  const conversations = useMemo(() => {
    const groups: { id: string; messages: MessageWithError[]; timestamp: number; preview: string }[] = [];
    let currentGroup: MessageWithError[] = [];
    
    retrievalHistory.forEach((msg) => {
      if (msg.role === 'user') {
        if (currentGroup.length > 0) {
          groups.push({
            id: currentGroup[0]?.id || generateUniqueId(),
            messages: currentGroup,
            timestamp: Date.now(), // You might want to store actual timestamps
            preview: currentGroup[0]?.content || ''
          });
        }
        currentGroup = [msg];
      } else {
        currentGroup.push(msg);
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push({
        id: currentGroup[0]?.id || generateUniqueId(),
        messages: currentGroup,
        timestamp: Date.now(),
        preview: currentGroup[0]?.content || ''
      });
    }
    
    return groups;
  }, [retrievalHistory]);

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    return conversations.filter(conv => 
      conv.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [conversations, searchQuery]);

  // Load a conversation into the chat
  const loadConversation = useCallback((conversation: typeof conversations[0]) => {
    setMessages(conversation.messages);
  }, []);

  // Toggle pin status of a conversation
  const togglePin = useCallback((conversationId: string) => {
    setPinnedChats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
  }, []);

  // Export answer to various formats
  const exportAnswer = useCallback((message: MessageWithError) => {
    const content = message.content;
    const timestamp = new Date().toISOString();
    const filename = `audit-answer-${timestamp}.txt`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Escalate answer for review
  const escalateAnswer = useCallback((message: MessageWithError) => {
    // This would typically send to a review queue or notification system
    console.log('Escalating answer for review:', message.content);
    // For now, just show an alert
    alert('Answer escalated for review. This would typically notify supervisors or trigger a review workflow.');
  }, []);

  // Scroll to bottom function - restored smooth scrolling with better handling
  const scrollToBottom = useCallback(() => {
    // Set flag to indicate this is a programmatic scroll
    programmaticScrollRef.current = true
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        // Use smooth scrolling for better user experience
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' })
      }
    })
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!inputValue.trim() || isLoading) return

      // Parse query mode prefix
      const allowedModes: QueryMode[] = ['naive', 'local', 'global', 'hybrid', 'mix', 'bypass']
      const prefixMatch = inputValue.match(/^\/(\w+)\s+(.+)/)
      let modeOverride: QueryMode | undefined = undefined
      let actualQuery = inputValue

      // If input starts with a slash, but does not match the valid prefix pattern, treat as error
      if (/^\/\S+/.test(inputValue) && !prefixMatch) {
        setInputError(t('retrievePanel.retrieval.queryModePrefixInvalid'))
        return
      }

      if (prefixMatch) {
        const mode = prefixMatch[1] as QueryMode
        const query = prefixMatch[2]
        if (!allowedModes.includes(mode)) {
          setInputError(
            t('retrievePanel.retrieval.queryModeError', {
              modes: 'naive, local, global, hybrid, mix, bypass',
            })
          )
          return
        }
        modeOverride = mode
        actualQuery = query
      }

      // Clear error message
      setInputError('')

      // Create messages
      // Save the original input (with prefix if any) in userMessage.content for display
      const userMessage: MessageWithError = {
        id: generateUniqueId(), // Use browser-compatible ID generation
        content: inputValue,
        role: 'user'
      }

      const assistantMessage: MessageWithError = {
        id: generateUniqueId(), // Use browser-compatible ID generation
        content: '',
        role: 'assistant',
        mermaidRendered: false
      }

      const prevMessages = [...messages]

      // Add messages to chatbox
      setMessages([...prevMessages, userMessage, assistantMessage])

      // Reset scroll following state for new query
      shouldFollowScrollRef.current = true
      // Set flag to indicate we're receiving a response
      isReceivingResponseRef.current = true

      // Force scroll to bottom after messages are rendered
      setTimeout(() => {
        scrollToBottom()
      }, 0)

      // Clear input and set loading
      setInputValue('')
      setIsLoading(true)

      // Create a function to update the assistant's message
      const updateAssistantMessage = (chunk: string, isError?: boolean) => {
        assistantMessage.content += chunk

        // Detect if the assistant message contains a complete mermaid code block
        // Simple heuristic: look for ```mermaid ... ```
        const mermaidBlockRegex = /```mermaid\s+([\s\S]+?)```/g
        let mermaidRendered = false
        let match
        while ((match = mermaidBlockRegex.exec(assistantMessage.content)) !== null) {
          // If the block is not too short, consider it complete
          if (match[1] && match[1].trim().length > 10) {
            mermaidRendered = true
            break
          }
        }
        assistantMessage.mermaidRendered = mermaidRendered

        setMessages((prev) => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage.role === 'assistant') {
            lastMessage.content = assistantMessage.content
            lastMessage.isError = isError
            lastMessage.mermaidRendered = assistantMessage.mermaidRendered
          }
          return newMessages
        })

        // After updating content, scroll to bottom if auto-scroll is enabled
        // Use a longer delay to ensure DOM has updated
        if (shouldFollowScrollRef.current) {
          setTimeout(() => {
            scrollToBottom()
          }, 30)
        }
      }

      // Prepare query parameters
      const state = useSettingsStore.getState()
      const queryParams = {
        ...state.querySettings,
        query: actualQuery,
        conversation_history: prevMessages
          .filter((m) => m.isError !== true)
          .slice(-(state.querySettings.history_turns || 0) * 2)
          .map((m) => ({ role: m.role, content: m.content })),
        ...(modeOverride ? { mode: modeOverride } : {}),
        // Add LLM toggle to query parameters
        use_llm: useLLM
      }

      try {
        // Run query
        if (state.querySettings.stream) {
          let errorMessage = ''
          await queryTextStream(queryParams, updateAssistantMessage, (error) => {
            errorMessage += error
          })
          if (errorMessage) {
            if (assistantMessage.content) {
              errorMessage = assistantMessage.content + '\n' + errorMessage
            }
            updateAssistantMessage(errorMessage, true)
          }
        } else {
          const response = await queryText(queryParams)
          updateAssistantMessage(response.response)
        }
      } catch (err) {
        // Handle error
        updateAssistantMessage(`${t('retrievePanel.retrieval.error')}\n${errorMessage(err)}`, true)
      } finally {
        // Clear loading and add messages to state
        setIsLoading(false)
        isReceivingResponseRef.current = false
        useSettingsStore
          .getState()
          .setRetrievalHistory([...prevMessages, userMessage, assistantMessage])
      }
    },
    [inputValue, isLoading, messages, setMessages, t, scrollToBottom, useLLM]
  )

  // Add event listeners to detect when user manually interacts with the container
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Handle significant mouse wheel events - only disable auto-scroll for deliberate scrolling
    const handleWheel = (e: WheelEvent) => {
      // Only consider significant wheel movements (more than 10px)
      if (Math.abs(e.deltaY) > 10 && !isFormInteractionRef.current) {
        shouldFollowScrollRef.current = false;
      }
    };

    // Handle scroll events - only disable auto-scroll if not programmatically triggered
    // and if it's a significant scroll
    const handleScroll = throttle(() => {
      // If this is a programmatic scroll, don't disable auto-scroll
      if (programmaticScrollRef.current) {
        programmaticScrollRef.current = false;
        return;
      }

      // Check if scrolled to bottom or very close to bottom
      const container = messagesContainerRef.current;
      if (container) {
        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 20;

        // If at bottom, enable auto-scroll, otherwise disable it
        if (isAtBottom) {
          shouldFollowScrollRef.current = true;
        } else if (!isFormInteractionRef.current && !isReceivingResponseRef.current) {
          shouldFollowScrollRef.current = false;
        }
      }
    }, 30);

    // Add event listeners - only listen for wheel and scroll events
    container.addEventListener('wheel', handleWheel as EventListener);
    container.addEventListener('scroll', handleScroll as EventListener);

    return () => {
      container.removeEventListener('wheel', handleWheel as EventListener);
      container.removeEventListener('scroll', handleScroll as EventListener);
    };
  }, []);

  // Add event listeners to the form area to prevent disabling auto-scroll when interacting with form
  useEffect(() => {
    const form = document.querySelector('form');
    if (!form) return;

    const handleFormMouseDown = () => {
      // Set flag to indicate form interaction
      isFormInteractionRef.current = true;

      // Reset the flag after a short delay
      setTimeout(() => {
        isFormInteractionRef.current = false;
      }, 500); // Give enough time for the form interaction to complete
    };

    form.addEventListener('mousedown', handleFormMouseDown);

    return () => {
      form.removeEventListener('mousedown', handleFormMouseDown);
    };
  }, []);

  // Use a longer debounce time for better performance with large message updates
  const debouncedMessages = useDebounce(messages, 150)
  useEffect(() => {
    // Only auto-scroll if enabled
    if (shouldFollowScrollRef.current) {
      // Force scroll to bottom when messages change
      scrollToBottom()
    }
  }, [debouncedMessages, scrollToBottom])


  const clearMessages = useCallback(() => {
    setMessages([])
    useSettingsStore.getState().setRetrievalHistory([])
  }, [setMessages])

  // Handle file attachment
  const handleFileAttachment = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setAttachments(prev => [...prev, ...files]);
    }
  }, []);

  // Remove attachment
  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Start voice recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        // For now, just show a message. In a real app, you'd send this to a speech-to-text service
        setInputValue(prev => prev + ' [Voice message recorded - would be transcribed here]');
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  }, []);

  // Stop voice recording
  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  }, [mediaRecorder, isRecording]);

  // Quick suggestions for onboarding and fast actions
  const quickSuggestions = [
    'List all transactions over $10,000',
    'Show me recent audit exceptions',
    'Summarize last quarter\'s consolidation entries',
    'What are the top 5 risks this month?',
    'Find unusual journal entries',
    'Compare current vs previous period',
    'Identify related party transactions',
    'Check for duplicate payments'
  ];

  // Focus input on mount and after sending
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);
  useEffect(() => {
    if (!isLoading && inputRef.current) inputRef.current.focus();
  }, [isLoading]);

  return (
    <div className="main-content-below-navbar flex h-full w-full">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col pt-12">
        <div className="flex size-full gap-2 px-2 pb-12 overflow-hidden">
          <div className="flex grow flex-col gap-4">
            <div className="relative grow">
              <div
                ref={messagesContainerRef}
                className="bg-primary-foreground/60 absolute inset-0 flex flex-col overflow-auto rounded-lg border p-2"
                onClick={() => {
                  if (shouldFollowScrollRef.current) {
                    shouldFollowScrollRef.current = false;
                  }
                }}
              >
                <div className="flex min-h-0 flex-1 flex-col gap-2">
                  {messages.length === 0 ? (
                    <div className="flex flex-col h-full items-center justify-center text-center gap-6">
                      <div className="text-2xl font-bold text-primary">Welcome to the Audit Query Assistant</div>
                      <div className="text-muted-foreground text-lg">Start by typing your question below or try a quick suggestion:</div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {quickSuggestions.map((s, i) => (
                          <button
                            key={i}
                            className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium transition-colors"
                            onClick={() => setInputValue(s)}
                            tabIndex={0}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {<ChatMessage 
                          message={message} 
                          onExport={exportAnswer}
                          onEscalate={escalateAnswer}
                        />}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} className="pb-1" />
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
              {/* LLM Toggle */}
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Knowledge Scope</span>
                  <span className="text-xs text-muted-foreground">
                    {useLLM ? 'Include External Knowledge' : 'Internal Knowledge only'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useLLM}
                    onChange={(e) => setUseLLM(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex-1 relative">
                <label htmlFor="query-input" className="sr-only">
                  {t('retrievePanel.retrieval.placeholder')}
                </label>
                <div className="flex gap-2">
                  <Input
                    id="query-input"
                    ref={inputRef}
                    className="flex-1"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value)
                      if (inputError) setInputError('')
                    }}
                    placeholder={useLLM 
                      ? t('retrievePanel.retrieval.placeholder')
                      : 'Enter your query for basic retrieval...'
                    }
                    disabled={isLoading}
                    autoFocus
                  />
                  {/* File attachment button */}
                  <label htmlFor="file-attachment" className="cursor-pointer">
                    <input
                      id="file-attachment"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileAttachment}
                      accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      className="h-10 w-10 p-0"
                    >
                      <PaperclipIcon className="w-4 h-4" />
                    </Button>
                  </label>
                  {/* Voice recording button */}
                  <Button
                    type="button"
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isLoading}
                    className="h-10 w-10 p-0"
                  >
                    {isRecording ? (
                      <MicOffIcon className="w-4 h-4" />
                    ) : (
                      <MicIcon className="w-4 h-4" />
                    )}
                  </Button>
                  {/* Send button */}
                  <Button 
                    type="submit" 
                    variant="default" 
                    disabled={isLoading || !inputValue.trim()} 
                    size="sm" 
                    className="h-10 w-10 p-0"
                  >
                    <SendIcon className="w-4 h-4" />
                  </Button>
                </div>
                {/* Error message below input */}
                {inputError && (
                  <div className="mt-1 text-xs text-red-500">{inputError}</div>
                )}
              </div>
              
              {/* Attachments display */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-lg">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-background px-2 py-1 rounded text-xs"
                    >
                      <span className="truncate max-w-32">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Quick suggestions */}
              {messages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.slice(0, 4).map((suggestion, i) => (
                    <button
                      key={i}
                      type="button"
                      className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium transition-colors border border-primary/20"
                      onClick={() => setInputValue(suggestion)}
                      disabled={isLoading}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              
            </form>
          </div>
        </div>
      </div>
      {/* Chat History Sidebar */}
      <aside className="w-80 bg-black/80 border-l border-zinc-800 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4 text-white">Chat History</h2>
        
        {/* Search input */}
        <div className="mb-4">
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border-zinc-700 text-white placeholder-gray-400"
          />
        </div>

        {filteredConversations.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            {searchQuery ? 'No conversations found.' : 'No previous chats.'}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Pinned conversations */}
            {filteredConversations.filter(conv => pinnedChats.has(conv.id)).length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Pinned</h3>
                {filteredConversations
                  .filter(conv => pinnedChats.has(conv.id))
                  .map((conversation) => (
                    <div
                      key={conversation.id}
                      className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-3 mb-2 cursor-pointer hover:bg-zinc-900 transition-colors"
                      onClick={() => loadConversation(conversation)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{conversation.preview}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            {conversation.messages.length} messages
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePin(conversation.id);
                          }}
                          className="text-yellow-400 hover:text-yellow-300 ml-2"
                        >
                          📌
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Regular conversations */}
            <div>
              {pinnedChats.size > 0 && (
                <h3 className="text-sm font-medium text-gray-400 mb-2">Recent</h3>
              )}
              {filteredConversations
                .filter(conv => !pinnedChats.has(conv.id))
                .map((conversation) => (
                  <div
                    key={conversation.id}
                    className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 mb-2 cursor-pointer hover:bg-zinc-800 transition-colors"
                    onClick={() => loadConversation(conversation)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{conversation.preview}</p>
                        <p className="text-gray-400 text-xs mt-1">
                          {conversation.messages.length} messages
                        </p>
                      </div>
                      {pinnedChats.has(conversation.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePin(conversation.id);
                          }}
                          className="text-yellow-400 hover:text-yellow-300 ml-2"
                        >
                          📌
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
