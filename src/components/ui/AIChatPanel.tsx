'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Sparkles, Loader2, MessageCircle, Maximize2, Minimize2 } from 'lucide-react';
import { MarketDisplay } from '@/lib/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatPanelProps {
  market?: MarketDisplay | null;
}

export default function AIChatPanel({ market }: AIChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Generate welcome message when market context changes
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsg: ChatMessage = {
        role: 'assistant',
        content: market
          ? `I'm analyzing **"${market.question}"**. This ${market.category} market has ${market.totalPool} AVAX in the pool with ${market.timeRemaining} remaining. Ask me anything about the odds, strategy, or market dynamics!`
          : `Welcome to Prediction Arena AI! I can analyze markets, explain odds, discuss strategy, and help you make informed decisions. Select a market for specific insights, or ask me anything!`,
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, market, messages.length]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Build market context for the API
      const marketContext = market
        ? {
            question: market.question,
            category: market.category,
            outcomes: market.outcomes.map((o) => ({
              label: o.label,
              percent: o.percent,
              pool: o.pool,
            })),
            totalPool: market.totalPool,
            timeRemaining: market.timeRemaining,
            isExpired: market.isExpired,
            resolved: market.resolved,
            status: market.status,
          }
        : undefined;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          market: marketContext,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.data.content },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              data.error ||
              'Sorry, I encountered an error. Please try again.',
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Connection error. Please check your network and try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = market
    ? [
        `What's the best position for "${market.question}"?`,
        'Explain the current odds',
        'What are the risks?',
        'How does the pool size affect payouts?',
      ]
    : [
        'How do prediction markets work?',
        'What strategies do the AI agents use?',
        'How are payouts calculated?',
        'What should I look for in a market?',
      ];

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full 
                       bg-gradient-to-r from-cyan-500 to-blue-600 
                       shadow-[0_4px_20px_rgba(0,240,255,0.4)]
                       flex items-center justify-center
                       hover:shadow-[0_4px_30px_rgba(0,240,255,0.6)]
                       transition-shadow duration-300"
          >
            <Bot className="w-6 h-6 text-white" />
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-arena-dark"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`fixed z-50 bg-arena-dark border border-arena-border rounded-2xl 
                       shadow-[0_8px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(0,240,255,0.1)]
                       flex flex-col overflow-hidden
                       ${
                         isExpanded
                           ? 'bottom-4 right-4 left-4 top-4 md:left-auto md:top-auto md:w-[600px] md:h-[700px]'
                           : 'bottom-6 right-6 w-[380px] h-[520px]'
                       }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-arena-border bg-arena-card/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Arena AI</h3>
                  <p className="text-[10px] text-gray-400">
                    {market
                      ? `Analyzing: ${market.question.slice(0, 30)}...`
                      : 'Market Intelligence'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 hover:bg-arena-border rounded-lg transition-colors"
                >
                  {isExpanded ? (
                    <Minimize2 className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setMessages([]);
                  }}
                  className="p-1.5 hover:bg-arena-border rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
                      ${
                        msg.role === 'user'
                          ? 'bg-cyan-600/30 text-cyan-50 rounded-br-md'
                          : 'bg-arena-card border border-arena-border text-gray-200 rounded-bl-md'
                      }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <Bot className="w-3 h-3 text-cyan-400" />
                        <span className="text-[10px] font-medium text-cyan-400">
                          Arena AI
                        </span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-arena-card border border-arena-border rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                      <span className="text-xs text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions (only when no messages or just welcome) */}
            {messages.length <= 1 && !isLoading && (
              <div className="px-4 pb-2">
                <p className="text-[10px] text-gray-500 mb-2 flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  Quick questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(q);
                        setTimeout(() => {
                          sendMessage();
                        }, 50);
                      }}
                      className="text-[11px] px-2.5 py-1.5 rounded-lg bg-arena-card border border-arena-border
                                 text-gray-300 hover:border-cyan-500/50 hover:text-cyan-300
                                 transition-colors duration-200"
                    >
                      {q.length > 40 ? q.slice(0, 37) + '...' : q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-arena-border bg-arena-card/30">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about markets, odds, strategy..."
                  disabled={isLoading}
                  className="flex-1 bg-arena-dark border border-arena-border rounded-xl px-3 py-2.5 text-sm
                             text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50
                             disabled:opacity-50 transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 
                             flex items-center justify-center
                             disabled:opacity-30 disabled:cursor-not-allowed
                             hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
                >
                  <Send className="w-4 h-4 text-white" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
