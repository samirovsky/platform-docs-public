'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface PageContext {
  title: string;
  url: string;
}

interface LeChatContextType {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  pageContext: PageContext | null;
  openPanel: () => void;
  closePanel: () => void;
  sendMessage: (message: string) => Promise<void>;
  setPageContext: (context: PageContext) => void;
  clearMessages: () => void;
}

const LeChatContext = createContext<LeChatContextType | undefined>(undefined);

export function LeChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageContext, setPageContext] = useState<PageContext | null>(null);

  const openPanel = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || !pageContext) return;

      // Add user message
      const userMessage: ChatMessage = { role: 'user', content: message };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/lechat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            pageContext: {
              title: pageContext.title,
              url: pageContext.url,
            },
            conversationHistory: messages,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response from LeChat');
        }

        const data = await response.json();
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.content,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An error occurred. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages, pageContext]
  );

  const value: LeChatContextType = {
    isOpen,
    messages,
    isLoading,
    error,
    pageContext,
    openPanel,
    closePanel,
    sendMessage,
    setPageContext,
    clearMessages,
  };

  return (
    <LeChatContext.Provider value={value}>{children}</LeChatContext.Provider>
  );
}

export function useLeChat() {
  const context = useContext(LeChatContext);
  if (context === undefined) {
    throw new Error('useLeChat must be used within a LeChatProvider');
  }
  return context;
}
