'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { LECHAT_INIT_MESSAGE } from '@/generated/lechat-routes';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface PageContext {
  title: string;
  url: string;
}

interface Session {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

interface LeChatContextType {
  isOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  stopGeneration: () => void;
  isLoading: boolean;
  isNavigating: boolean;
  navigationSuccess: boolean;
  error: string | null;
  pageContext: PageContext | null;
  setPageContext: (context: PageContext | null) => void; // Keep this for external setting of page context
  // Session Management
  sessions: Session[];
  currentSessionId: string | null;
  createSession: () => void;
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
}

const LeChatContext = createContext<LeChatContextType | undefined>(undefined);

export function LeChatProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationSuccess, setNavigationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageContext, setPageContext] = useState<PageContext | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Session State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Stop generation function
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  // Derived state for current messages
  const messages = currentSessionId
    ? sessions.find(s => s.id === currentSessionId)?.messages || []
    : [];

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('lechat_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
        // Restore last active session or default to the most recent one
        const lastActive = localStorage.getItem('lechat_active_session');
        if (lastActive && parsed.find((s: Session) => s.id === lastActive)) {
          setCurrentSessionId(lastActive);
        } else if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error('Failed to parse sessions', e);
      }
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('lechat_sessions', JSON.stringify(sessions));
    } else {
      localStorage.removeItem('lechat_sessions'); // Clear if no sessions
    }
    if (currentSessionId) {
      localStorage.setItem('lechat_active_session', currentSessionId);
    } else {
      localStorage.removeItem('lechat_active_session'); // Clear if no active session
    }
  }, [sessions, currentSessionId]);

  const createSession = useCallback(() => {
    const initMessage: ChatMessage = {
      role: 'assistant',
      content: LECHAT_INIT_MESSAGE,
    };

    const newSession: Session = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [initMessage],
      createdAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  }, []);

  const switchSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const newSessions = prev.filter(s => s.id !== sessionId);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(newSessions.length > 0 ? newSessions[0].id : null);
      }
      return newSessions;
    });
  }, [currentSessionId]);

  // Keyboard shortcut to toggle panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openPanel = useCallback(() => {
    setIsOpen(true);
    // Ensure a session exists when opening
    if (sessions.length === 0) {
      createSession();
    }
  }, [sessions.length, createSession]);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Ensure we have a session
    let activeId = currentSessionId;
    if (!activeId) {
      const newSession: Session = {
        id: crypto.randomUUID(),
        title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
        messages: [],
        createdAt: Date.now(),
      };
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      activeId = newSession.id;
    }

    const userMessage: ChatMessage = { role: 'user', content };

    // Update session with user message
    setSessions(prev => prev.map(s =>
      s.id === activeId
        ? {
          ...s,
          messages: [...s.messages, userMessage],
          // Update title if it's the first message and title is generic
          title: s.messages.length === 0 && s.title === 'New Chat' ? content.slice(0, 30) + (content.length > 30 ? '...' : '') : s.title
        }
        : s
    ));

    setIsLoading(true);
    setError(null);

    // Create abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Get current messages for context (excluding the one we just added to state, as we'll send it in body)
      // Actually, we need the full history for the API
      const currentSession = sessions.find(s => s.id === activeId);
      const history = currentSession ? currentSession.messages : [];

      const response = await fetch('/api/lechat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...history, userMessage], // Send the full history including the new user message
          pageContext,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Log detailed error information for debugging
        console.error('LeChat API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url: response.url,
        });
        // Throw user-friendly error message
        throw new Error('Failed to get response from LeChat');
      }

      const data = await response.json();

      // Debug: Log API response to help troubleshoot navigation issues
      console.log('LeChat API response:', {
        content: data.content?.substring(0, 100) + '...',
        navigateTo: data.navigateTo,
        setContext: data.setContext
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.content,
      };

      // Update session with assistant message
      setSessions(prev => prev.map(s =>
        s.id === activeId
          ? { ...s, messages: [...s.messages, assistantMessage] }
          : s
      ));

      // Handle context update if the API returns setContext
      if (data.setContext) {
        // The PageContextInitializer will automatically update when we navigate
        // For now, just acknowledge that context will be updated
        console.log('Context will be updated to:', data.setContext);
      }

      // Handle automatic navigation if the API returns a route
      if (data.navigateTo) {
        setIsNavigating(true);
        // Delay navigation to show animation
        setTimeout(() => {
          router.push(data.navigateTo);
          // Turn off navigation animation and show success
          // PageContextInitializer will automatically update context when route changes
          setTimeout(() => {
            setIsNavigating(false);
            setNavigationSuccess(true);
            // Hide success message after 2 seconds
            setTimeout(() => setNavigationSuccess(false), 2000);
          }, 500);
        }, 3000);
      }
    } catch (err) {
      // Don't show error if request was aborted by user
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Request was cancelled by user');
      } else {
        setError('Failed to get response from Mistral API');
        console.error(err);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [currentSessionId, sessions, pageContext]);

  const value: LeChatContextType = {
    isOpen,
    openPanel,
    closePanel,
    messages,
    sendMessage,
    stopGeneration,
    isLoading,
    isNavigating,
    navigationSuccess,
    error,
    pageContext,
    setPageContext,
    sessions,
    currentSessionId,
    createSession,
    switchSession,
    deleteSession,
  };

  return (
    <LeChatContext.Provider value={value}>
      {children}
    </LeChatContext.Provider>
  );
}

export function useLeChat() {
  const context = useContext(LeChatContext);
  if (context === undefined) {
    throw new Error('useLeChat must be used within a LeChatProvider');
  }
  return context;
}
