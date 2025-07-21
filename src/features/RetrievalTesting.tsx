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
import { Send, Paperclip, Mic, X, Sparkles, Plus } from 'lucide-react';

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

  const handleSendMessage = async (message: string, files: any[]) => {
    if (!message.trim()) return;
    const userMessage: MessageWithError = {
      id: generateUniqueId(),
      content: message,
      role: 'user'
    };
    const assistantMessage: MessageWithError = {
      id: generateUniqueId(),
      content: '',
      role: 'assistant',
      mermaidRendered: false
    };
    const prevMessages = [...messages];
    setMessages([...prevMessages, userMessage, assistantMessage]);
    shouldFollowScrollRef.current = true;
    isReceivingResponseRef.current = true;
    setIsLoading(true);
    const updateAssistantMessage = (chunk: string, isError?: boolean) => {
      assistantMessage.content += chunk;
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = assistantMessage.content;
          lastMessage.isError = isError;
          lastMessage.mermaidRendered = assistantMessage.mermaidRendered;
        }
        return newMessages;
      });
      if (shouldFollowScrollRef.current) {
        setTimeout(() => {
          scrollToBottom();
        }, 30);
      }
    };
    const state = useSettingsStore.getState();
    const queryParams = {
      ...state.querySettings,
      query: message,
      conversation_history: prevMessages
        .filter((m) => m.isError !== true)
        .slice(-(state.querySettings.history_turns || 0) * 2)
        .map((m) => ({ role: m.role, content: m.content })),
      use_llm: useLLM
    };
    try {
      if (state.querySettings.stream) {
        let errorMessage = '';
        await queryTextStream(queryParams, updateAssistantMessage, (error) => {
          errorMessage += error;
        });
        if (errorMessage) {
          if (assistantMessage.content) {
            errorMessage = assistantMessage.content + '\n' + errorMessage;
          }
          updateAssistantMessage(errorMessage, true);
        }
      } else {
        const response = await queryText(queryParams);
        updateAssistantMessage(response.response);
      }
    } catch (err) {
      updateAssistantMessage(`${t('retrievePanel.retrieval.error')}\n${errorMessage(err)}`, true);
    } finally {
      setIsLoading(false);
      isReceivingResponseRef.current = false;
      useSettingsStore.getState().setRetrievalHistory([...prevMessages, userMessage, assistantMessage]);
    }
  };

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
            <AIInputField onSend={handleSendMessage} />
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

const AIInputField = ({ onSend }: { onSend: (message: string, files: any[]) => void }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: number) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i)) + sizes[i];
  };

  const handleSubmit = () => {
    if (message.trim() || uploadedFiles.length > 0) {
      onSend(message, uploadedFiles);
      setMessage('');
      setUploadedFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      {/* Main Input Container */}
      <div className={`relative transition-all duration-500 ease-out ${
        isFocused || message || uploadedFiles.length > 0 
          ? 'transform scale-105' 
          : ''
      }`}>
        {/* Glow Effect */}
        <div className={`absolute inset-0 rounded-3xl transition-all duration-500 ${
          isFocused 
            ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl scale-110' 
            : 'bg-gradient-to-r from-zinc-900/50 via-zinc-800/50 to-zinc-900/50 blur-lg'
        }`}></div>
        {/* Input Container */}
        <div className={`relative backdrop-blur-xl bg-black/80 border-2 rounded-3xl transition-all duration-300 ${
          isFocused 
            ? 'border-blue-400/50 shadow-2xl shadow-blue-500/25' 
            : 'border-zinc-800 shadow-xl shadow-black/25'
        } hover:shadow-2xl hover:shadow-zinc-900/30`}>
          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="p-4 border-b border-zinc-700/30">
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="group flex items-center gap-2 bg-gradient-to-r from-zinc-800/80 to-black/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    <span className="text-zinc-200 font-medium text-sm truncate max-w-32">{file.name}</span>
                    <span className="text-zinc-400 text-xs">({formatFileSize(file.size)})</span>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all duration-200 hover:scale-110"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Main Input Area */}
          <div className="flex items-end p-6 gap-4">
            {/* Left Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group relative p-3 rounded-2xl bg-gradient-to-br from-zinc-900/80 to-black/80 hover:from-blue-900/80 hover:to-purple-900/80 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                title="Upload files"
              >
                <Paperclip className="w-5 h-5 text-zinc-400 group-hover:text-blue-400 transition-colors duration-300" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/20 group-hover:to-purple-400/20 transition-all duration-300"></div>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="hidden"
                accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.csv,.json"
              />
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`group relative p-3 rounded-2xl transition-all duration-300 hover:scale-110 ${
                  isRecording 
                    ? 'bg-gradient-to-br from-red-900/80 to-pink-900/80 animate-pulse shadow-lg shadow-red-900/50' 
                    : 'bg-gradient-to-br from-zinc-900/80 to-black/80 hover:from-green-900/80 hover:to-emerald-900/80 hover:shadow-lg'
                }`}
                title={isRecording ? "Stop recording" : "Voice input"}
              >
                <Mic className={`w-5 h-5 transition-colors duration-300 ${
                  isRecording 
                    ? 'text-red-400' 
                    : 'text-zinc-400 group-hover:text-green-400'
                }`} />
                <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                  isRecording 
                    ? 'bg-gradient-to-br from-red-400/20 to-pink-400/20' 
                    : 'bg-gradient-to-br from-green-400/0 to-emerald-400/0 group-hover:from-green-400/20 group-hover:to-emerald-400/20'
                }`}></div>
              </button>
            </div>
            {/* Text Input - No Background */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Ask me anything... ✨"
                className="w-full resize-none border-none outline-none text-zinc-200 placeholder-zinc-500 text-lg leading-relaxed min-h-[32px] max-h-32 bg-transparent font-medium selection:bg-blue-200/50"
                rows={1}
                style={{ background: 'transparent' }}
              />
              {/* Cursor Animation */}
              {isFocused && !message && (
                <div className="absolute top-1 left-0 w-0.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500 animate-pulse rounded-full"></div>
              )}
            </div>
            {/* Send Button */}
            <button
              onClick={handleSubmit}
              disabled={!message.trim() && uploadedFiles.length === 0}
              className={`group relative p-4 rounded-2xl font-medium transition-all duration-300 ${
                message.trim() || uploadedFiles.length > 0
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl shadow-blue-500/40 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transform-gpu'
                  : 'bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 text-zinc-500 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <Send className="w-6 h-6" />
              {(message.trim() || uploadedFiles.length > 0) && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </button>
          </div>
          {/* Magic Sparkles */}
          {isFocused && (
            <div className="absolute -top-2 -left-2 w-6 h-6">
              <Sparkles className="w-4 h-4 text-blue-400 animate-bounce" />
            </div>
          )}
          {isFocused && (
            <div className="absolute -top-1 -right-3 w-6 h-6">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
            </div>
          )}
          {isFocused && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6">
              <Plus className="w-3 h-3 text-pink-400 animate-pulse" />
            </div>
          )}
        </div>
        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-3 bg-gradient-to-r from-red-500/90 to-pink-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-2xl shadow-2xl shadow-red-500/50">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="font-medium">Listening...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
