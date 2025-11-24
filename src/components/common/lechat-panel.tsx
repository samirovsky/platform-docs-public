'use client';

import React, { useEffect, useRef } from 'react';
import { useLeChat } from '@/contexts/lechat-context';
import { XIcon, SendIcon, Loader2Icon, SparklesIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LeChatPanel() {
    const {
        isOpen,
        messages,
        isLoading,
        error,
        pageContext,
        closePanel,
        sendMessage,
    } = useLeChat();

    const [inputValue, setInputValue] = React.useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        await sendMessage(inputValue);
        setInputValue('');
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/20 z-[100] animate-in fade-in duration-200"
                onClick={closePanel}
            />

            {/* Panel */}
            <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-background border-l border-border z-[101] flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="size-5 text-primary" />
                        <div>
                            <h2 className="font-semibold text-base">Ask LeChat</h2>
                            {pageContext && (
                                <p className="text-xs text-muted-foreground">
                                    About: {pageContext.title}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={closePanel}
                        className="rounded-md p-1.5 hover:bg-accent transition-colors"
                        aria-label="Close chat panel"
                    >
                        <XIcon className="size-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <SparklesIcon className="size-12 text-muted-foreground/50 mb-4" />
                            <h3 className="font-semibold text-lg mb-2">
                                Ask questions about this page
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                I can help you understand the content, explain concepts, or
                                answer questions about {pageContext?.title || 'this documentation'}.
                            </p>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={cn(
                                'flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                        >
                            {message.role === 'assistant' && (
                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <SparklesIcon className="size-4 text-primary" />
                                </div>
                            )}
                            <div
                                className={cn(
                                    'rounded-lg px-4 py-2.5 max-w-[85%]',
                                    message.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-accent text-foreground'
                                )}
                            >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                            {message.role === 'user' && (
                                <div className="size-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                                    <span className="text-xs font-semibold">You</span>
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <SparklesIcon className="size-4 text-primary" />
                            </div>
                            <div className="rounded-lg px-4 py-2.5 bg-accent">
                                <div className="flex items-center gap-2">
                                    <Loader2Icon className="size-4 animate-spin" />
                                    <span className="text-sm text-muted-foreground">
                                        Thinking...
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 border-t border-border">
                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask a question about this page..."
                            className="flex-1 px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isLoading}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center gap-2"
                        >
                            <SendIcon className="size-4" />
                            <span className="hidden sm:inline">Send</span>
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
