import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { throttle } from '@/lib/utils'
import { queryText, queryTextStream } from '@/api/lightrag'
import { errorMessage } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settings'
import { useDebounce } from '@/hooks/useDebounce'
import { ChatMessage, MessageWithError } from '@/components/retrieval/ChatMessage'
import { Search, MoreHorizontal, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { QueryMode } from '@/api/lightrag'
import { Send, Paperclip, X, Sparkles } from 'lucide-react';
import { isToday, isYesterday, subDays, isAfter } from 'date-fns';

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
      return history.map((msg: any, index: number) => {
        return {
          ...msg,
          id: msg.id || `hist-${Date.now()}-${index}`,
          mermaidRendered: (msg as any).mermaidRendered ?? true
        } as MessageWithError;
      })
    } catch (error) {
      console.error('Error loading history:', error)
      return []
    }
  })
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('') // Search query for chat history
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null) // Track current conversation
  // Removed unused isRecording, setIsRecording, mediaRecorder, setMediaRecorder
  const [useLLM] = useState(true) // Toggle for LLM usage
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

  // Load a conversation into the chat
  const loadConversation = useCallback((conversation: typeof conversations[0]) => {
    setMessages(conversation.messages);
    setCurrentConversationId(conversation.id);
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

  // Create a new chat session
  const createNewChat = useCallback(() => {
    // Clear current messages
    setMessages([]);
    // Clear input
    setInputValue('');
    // Reset loading state
    setIsLoading(false);
    // Scroll to top
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    setCurrentConversationId(null);
  }, []);

  // Delete a specific conversation
  const deleteConversation = useCallback((chatId: string) => {
    // Find the conversation to delete
    const conversationToDelete = conversations.find(conv => conv.id === chatId);
    if (!conversationToDelete) return;

    // Remove messages from the conversation from retrievalHistory
    const messageIdsToRemove = conversationToDelete.messages.map(msg => msg.id);
    const updatedHistory = useSettingsStore.getState().retrievalHistory.filter(
      msg => !messageIdsToRemove.includes(msg.id)
    );
    
    // Update the settings store
    useSettingsStore.getState().setRetrievalHistory(updatedHistory);
    
    // If this was the currently loaded conversation, clear the current chat
    if (currentConversationId === chatId) {
      createNewChat();
    }
  }, [currentConversationId, createNewChat, conversations]);

  // Clear all conversations
  const clearAllConversations = useCallback(() => {
    // Clear all retrieval history
    useSettingsStore.getState().setRetrievalHistory([]);
    // Clear current chat
    createNewChat();
  }, [createNewChat]);

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
        // setInputError(t('retrievePanel.retrieval.queryModePrefixInvalid')) // Removed unused variable
        return
      }

      if (prefixMatch) {
        const mode = prefixMatch[1] as QueryMode
        const query = prefixMatch[2]
        if (!allowedModes.includes(mode)) {
          // setInputError( // Removed unused variable
          //   t('retrievePanel.retrieval.queryModeError', {
          //     modes: 'naive, local, global, hybrid, mix, bypass',
          //   })
          // )
          return
        }
        modeOverride = mode
        actualQuery = query
      }

      // Clear error message // Removed unused variable
      // setInputError('')

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


  // Quick suggestions for onboarding and fast actions
  const quickSuggestions = [
    'Show inventory in-transit at year-end',
    'Identify payments to members outside of the Value Payment',
    'List all foreign exchange hedge contracts',
    'Show all journal entries posted by the sales team',
    'Generate a tariff summary by shipping route'
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

  // --- Group conversations by date for sidebar ---
  const groupedConversations = useMemo(() => {
    const today: typeof conversations = [];
    const yesterday: typeof conversations = [];
    const previous7: typeof conversations = [];
    conversations.forEach(conv => {
      // Use the timestamp of the first message in the group, or fallback to extracting from id
      const firstMsg = conv.messages[0];
      let date: Date;
      if (firstMsg && (firstMsg as any).timestamp) {
        date = new Date((firstMsg as any).timestamp);
      } else if (firstMsg && firstMsg.id && /^hist-(\d+)-/.test(firstMsg.id)) {
        // Try to extract timestamp from id if it matches 'hist-<timestamp>-<index>'
        const match = firstMsg.id.match(/^hist-(\d+)-/);
        date = match ? new Date(Number(match[1])) : new Date();
      } else {
        date = new Date();
      }
      if (isToday(date)) today.push(conv);
      else if (isYesterday(date)) yesterday.push(conv);
      else if (isAfter(date, subDays(new Date(), 7))) previous7.push(conv);
    });
    return { today, yesterday, previous7 };
  }, [conversations]);
  // --- End grouping ---

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
      {/* Chat History Sidebar - Modern, grouped, clean design */}
      <aside className="w-80 bg-black/80 border-l border-zinc-800 p-4 flex flex-col h-full">
        <button 
          className="rounded-full bg-zinc-800 text-white font-semibold py-2 mb-4 w-full hover:bg-zinc-700 transition flex items-center justify-center gap-2"
          onClick={createNewChat}
        >
          <Plus className="w-4 h-4" /> New Chat
        </button>
        
        {/* Clear All Conversations Button */}
        {conversations.length > 0 && (
          <button 
            className="rounded-full bg-red-900/20 text-red-400 font-semibold py-2 mb-4 w-full hover:bg-red-900/30 transition flex items-center justify-center gap-2 border border-red-800/50"
            onClick={clearAllConversations}
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        )}
        <div className="relative mb-4">
          <input
            className="w-full rounded-full bg-zinc-900 border border-zinc-700 text-white pl-10 pr-4 py-2 text-sm focus:outline-none"
            placeholder="Search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Today */}
          {groupedConversations.today.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-zinc-500 mb-2">Today</div>
              <ul className="divide-y divide-zinc-800">
                {groupedConversations.today.map(chat => (
                  <li key={chat.id}>
                    <div className="flex items-center justify-between px-4 py-3 rounded-lg transition hover:bg-zinc-900">
                      <button
                        className="flex-1 text-left truncate"
                        onClick={() => loadConversation(chat)}
                      >
                        <span className="truncate">{chat.preview}</span>
                      </button>
                      <button
                        className="ml-2 text-zinc-400 hover:text-red-400 transition-colors p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(chat.id);
                        }}
                        title="Delete conversation"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Yesterday */}
          {groupedConversations.yesterday.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-zinc-500 mb-2">Yesterday</div>
              <ul className="divide-y divide-zinc-800">
                {groupedConversations.yesterday.map(chat => (
                  <li key={chat.id}>
                    <div className="flex items-center justify-between px-4 py-3 rounded-lg transition hover:bg-zinc-900">
                      <button
                        className="flex-1 text-left truncate"
                        onClick={() => loadConversation(chat)}
                      >
                        <span className="truncate">{chat.preview}</span>
                      </button>
                      <button
                        className="ml-2 text-zinc-400 hover:text-red-400 transition-colors p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(chat.id);
                        }}
                        title="Delete conversation"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Previous 7 days */}
          {groupedConversations.previous7.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-zinc-500 mb-2">Previous 7 days</div>
              <ul className="divide-y divide-zinc-800">
                {groupedConversations.previous7.map(chat => (
                  <li key={chat.id}>
                    <div className="flex items-center justify-between px-4 py-3 rounded-lg transition hover:bg-zinc-900">
                      <button
                        className="flex-1 text-left truncate"
                        onClick={() => loadConversation(chat)}
                      >
                        <span className="truncate">{chat.preview}</span>
                      </button>
                      <button
                        className="ml-2 text-zinc-400 hover:text-red-400 transition-colors p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(chat.id);
                        }}
                        title="Delete conversation"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button className="w-full text-xs text-blue-400 mt-4">Show more...</button>
        </div>
      </aside>
    </div>
  )
}

const AIInputField = ({ onSend }: { onSend: (message: string, files: any[]) => void }) => {
  const [message, setMessage] = useState('');
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
                placeholder='What would you like clarified?'
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
      </div>
    </div>
  );
};
