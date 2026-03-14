'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export default function ChatAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    body: {
      selectedText,
    },
  });

  // Handle text selection
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        setSelectedText(selection.toString());
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg transition-transform hover:scale-105 z-50 flex items-center justify-center"
          aria-label="Open chat"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Mistral AI Assistant</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Ask questions about the docs</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Selected Text Indicator */}
          {selectedText && (
            <div className="px-4 py-2 bg-orange-50 dark:bg-orange-950/30 border-b border-orange-100 dark:border-orange-900/50 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Selected context:</span>
                <button
                  onClick={() => setSelectedText('')}
                  className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  Clear
                </button>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate italic">
                "{selectedText}"
              </p>
            </div>
          )}

          {/* Messages Area */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
          >
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 opacity-50">
                <MessageSquare size={32} className="mb-2 text-zinc-400" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Select any text in the documentation or just ask a question!
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[85%] ${
                    m.role === 'user' ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <span className="text-[10px] text-zinc-400 mb-1 px-1">
                    {m.role === 'user' ? 'You' : 'Mistral AI'}
                  </span>
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm ${
                      m.role === 'user'
                        ? 'bg-orange-500 text-white rounded-tr-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              className="flex gap-2"
            >
              <input
                className="flex-1 px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border border-transparent focus:border-orange-500 focus:bg-white dark:focus:bg-zinc-900 rounded-xl outline-none transition-all placeholder:text-zinc-400 dark:text-zinc-100"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask something..."
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
