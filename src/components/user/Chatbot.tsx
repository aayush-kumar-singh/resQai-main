import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { chatWithDisasterAI } from '../../services/geminiService'

interface ChatMessage {
  role: 'user' | 'ai'
  text: string
}

export const Chatbot = () => {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: ChatMessage = { role: 'user', text: text.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await chatWithDisasterAI(text.trim(), i18n.language)
      const aiMessage: ChatMessage = { role: 'ai', text: response }
      setMessages(prev => [...prev, aiMessage])
    } catch {
      const errorMessage: ChatMessage = { role: 'ai', text: t('chatbot.error') }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleQuickAction = (topic: string) => {
    sendMessage(topic)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  // Format AI text: bold markers and line breaks
  const formatMessage = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="cb-bold">{part.slice(2, -2)}</strong>
      }
      // Split by newlines and render breaks
      const lines = part.split('\n')
      return lines.map((line, j) => (
        <span key={`${i}-${j}`}>
          {line}
          {j < lines.length - 1 && <br />}
        </span>
      ))
    })
  }

  const showQuickActions = messages.length === 0

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        className="cb-fab"
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Open disaster AI chatbot"
        id="chatbot-fab"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle size={24} />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && <span className="cb-fab-pulse" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="cb-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            id="chatbot-window"
          >
            {/* Header */}
            <div className="cb-header">
              <div className="cb-header-info">
                <div className="cb-header-icon">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="cb-header-title">{t('chatbot.title')}</h3>
                  <p className="cb-header-subtitle">{t('chatbot.subtitle')}</p>
                </div>
              </div>
              <button
                className="cb-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close chatbot"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="cb-messages">
              {/* Welcome message */}
              <motion.div
                className="cb-msg cb-msg-ai"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="cb-msg-avatar cb-avatar-ai">
                  <Bot size={14} />
                </div>
                <div className="cb-bubble cb-bubble-ai">
                  {t('chatbot.welcome')}
                </div>
              </motion.div>

              {/* Quick Action Buttons */}
              {showQuickActions && (
                <motion.div
                  className="cb-quick-actions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <button
                    className="cb-quick-btn"
                    onClick={() => handleQuickAction('Earthquake safety tips')}
                  >
                    {t('chatbot.quickEarthquake')}
                  </button>
                  <button
                    className="cb-quick-btn"
                    onClick={() => handleQuickAction('Flood precautions and safety')}
                  >
                    {t('chatbot.quickFlood')}
                  </button>
                  <button
                    className="cb-quick-btn"
                    onClick={() => handleQuickAction('Emergency helpline numbers')}
                  >
                    {t('chatbot.quickEmergency')}
                  </button>
                </motion.div>
              )}

              {/* Chat Messages */}
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  className={`cb-msg cb-msg-${msg.role}`}
                  initial={{ opacity: 0, y: 8, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className={`cb-msg-avatar cb-avatar-${msg.role}`}>
                    {msg.role === 'ai' ? <Bot size={14} /> : <User size={14} />}
                  </div>
                  <div className={`cb-bubble cb-bubble-${msg.role}`}>
                    {msg.role === 'ai' ? formatMessage(msg.text) : msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  className="cb-msg cb-msg-ai"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="cb-msg-avatar cb-avatar-ai">
                    <Bot size={14} />
                  </div>
                  <div className="cb-bubble cb-bubble-ai cb-typing">
                    <span className="cb-typing-text">{t('chatbot.typing')}</span>
                    <span className="cb-typing-dots">
                      <span className="cb-dot" />
                      <span className="cb-dot" />
                      <span className="cb-dot" />
                    </span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form className="cb-input-area" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                className="cb-input"
                placeholder={t('chatbot.placeholder')}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                id="chatbot-input"
              />
              <motion.button
                type="submit"
                className="cb-send-btn"
                disabled={!input.trim() || isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={t('chatbot.send')}
                id="chatbot-send"
              >
                <Send size={18} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
