import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Minimize2, Loader2, AlertCircle } from 'lucide-react';
import { chatWithInstructor } from '../services/geminiService';
import { ChatMessage, ChatHistoryEntry } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Jambo! 👋 I am your NTSA Driving Instructor. Ask me anything about driving rules, signs, or safety!', timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input.trim(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    const history: ChatHistoryEntry[] = [...messages, userMsg].map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    try {
    const responseText = await chatWithInstructor(userMsg.text, history);
    const botMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach instructor');
    } finally {
    setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-x-3 sm:inset-x-auto sm:right-5 md:right-6 bottom-[calc(16px+env(safe-area-inset-bottom,0px))] sm:bottom-[calc(20px+env(safe-area-inset-bottom,0px))] md:bottom-[calc(24px+env(safe-area-inset-bottom,0px))] z-50 flex justify-center sm:justify-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="pointer-events-auto bg-white w-full sm:w-[72vw] md:w-[420px] max-w-[460px] min-w-[300px] min-h-[440px] sm:min-h-[480px] max-h-[72vh] md:max-h-[75vh] rounded-2xl shadow-2xl border border-gray-200 flex flex-col mb-3 sm:mb-4 overflow-hidden animate-fade-in-up transition-all">
          {/* Header */}
          <div className="bg-primary p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <MessageCircle size={18} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">NTSA AI Instructor</h3>
                <p className="text-[11px] text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded transition"
              aria-label="Minimize chat"
            >
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-gray-50 scrollbar-hide space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] md:max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-white text-slate-700 shadow-sm border border-gray-100 rounded-bl-none'
                  }`}
                >
                  {msg.role === 'model' ? <MarkdownRenderer content={msg.text} /> : msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                  <Loader2 className="animate-spin text-primary" size={20} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 sm:p-5 bg-white border-t border-gray-100">
            {error && (
              <div className="mb-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-2 py-2">
                <AlertCircle size={14} />
                <span className="truncate">{error}</span>
              </div>
            )}
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about traffic rules..."
                className="w-full bg-gray-100 text-sm rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-1.5 bg-primary text-white rounded-full hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="text-center mt-2">
                <span className="text-[10px] text-gray-400">AI can make mistakes. Verify with NTSA handbook.</span>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto group flex items-center gap-2 bg-primary hover:bg-primary-hover text-white py-3 px-5 rounded-full shadow-lg transition-all transform hover:scale-105 w-full sm:w-auto"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
          <span className="font-medium">Ask Instructor</span>
        </button>
      )}
    </div>
  );
};

export default ChatWidget;