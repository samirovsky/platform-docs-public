'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLeChat } from '@/contexts/lechat-context';
import Link from 'next/link';
import { XIcon, SendIcon, SquareIcon, Maximize2Icon, Minimize2Icon, ListIcon, PlusIcon, Trash2Icon, MessageSquareIcon, CopyIcon, CheckIcon, TerminalIcon } from 'lucide-react';
import { ThunderIcon } from '@/components/icons/pixel';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MistralLogoSolid from '@/components/icons/assets/mistral-logo-solid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';

const MistralLoader = () => (
    <div className="relative flex items-center justify-center size-8">
        <div className="absolute inset-0 rounded-full border-2 border-muted" />
        <div className="absolute inset-0 rounded-full border-2 border-[var(--mistral-color-1)] border-t-transparent animate-spin" />
        <MistralLogoSolid className="size-4 text-[var(--mistral-color-1)]" />
    </div>
);

const CodeBlock = ({ language, children }: { language: string, children: string }) => {
    const [copied, setCopied] = useState(false);
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const handleCopy = () => {
        navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-4 rounded-xl border border-border bg-background dark:bg-neutral-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30 dark:bg-neutral-800/50">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <TerminalIcon className="size-4" />
                    <span className="text-xs font-medium uppercase">{language || 'Code'}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    {copied ? (
                        <>
                            <CheckIcon className="size-3.5" />
                            <span>Copied</span>
                        </>
                    ) : (
                        <>
                            <CopyIcon className="size-3.5" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <div className="text-xs font-mono">
                <SyntaxHighlighter
                    language={language}
                    style={isDark ? vscDarkPlus : oneLight}
                    customStyle={{
                        margin: 0,
                        padding: '1rem',
                        background: 'transparent',
                        fontSize: '12px',
                    }}
                    wrapLines={true}
                    wrapLongLines={true}
                >
                    {children}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

export function LeChatPanel() {
    const {
        isOpen,
        messages,
        isLoading,
        isNavigating,
        navigationSuccess,
        error,
        pageContext,
        setPageContext,
        closePanel,
        sendMessage,
        stopGeneration,
        sessions,
        currentSessionId,
        createSession,
        switchSession,
        deleteSession,
    } = useLeChat();

    const [inputValue, setInputValue] = React.useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when messages change or panel opens
    useEffect(() => {
        const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        };

        if (isOpen) {
            // Instant scroll if messages change while open
            scrollToBottom();

            // Delayed scroll for initial open animation
            const timeoutId = setTimeout(scrollToBottom, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [messages, isOpen]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen && !showHistory) {
            inputRef.current?.focus();
        }
    }, [isOpen, showHistory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const message = inputValue;
        setInputValue(''); // Clear input immediately
        await sendMessage(message);
    };

    const handleNewChat = () => {
        createSession();
        setShowHistory(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleSwitchSession = (id: string) => {
        switchSession(id);
        setShowHistory(false);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/20 z-[140] animate-in fade-in duration-200"
                onClick={closePanel}
            />

            {/* Panel */}
            <div
                id="lechat-panel-container"
                className={cn(
                    "fixed top-0 right-0 h-full bg-background dark:bg-neutral-950 border-l border-border z-[150] flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl transition-[width] ease-in-out rounded-l-2xl overflow-hidden",
                    isExpanded ? "w-full sm:w-[800px]" : "w-full sm:w-[480px]"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-background/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <img
                            src={isNavigating ? "/assets/sprites/cat_walk.gif" : "/assets/sprites/cat_head.png"}
                            alt="LeChat status"
                            className="size-8 object-contain"
                            title={isNavigating ? "LeChat is crawling..." : isLoading ? "LeChat is thinking..." : "LeChat is ready"}
                        />
                        <div>
                            <h2 className="font-semibold text-base text-foreground">
                                {showHistory ? 'History' : 'Ask LeChat'}
                            </h2>
                            {!showHistory && pageContext && (
                                <div className="flex items-center gap-1.5 max-w-[200px]">
                                    <p className="text-xs text-muted-foreground truncate">
                                        {pageContext.title}
                                    </p>
                                    <button
                                        onClick={() => setPageContext(null)}
                                        className="text-muted-foreground/50 hover:text-destructive transition-colors"
                                        title="Remove page context"
                                    >
                                        <XIcon className="size-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="rounded-md p-1.5 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                            title="History"
                        >
                            {showHistory ? <XIcon className="size-5" /> : <ListIcon className="size-5" />}
                        </button>
                        <button
                            onClick={handleNewChat}
                            className="rounded-md p-1.5 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                            title="New Chat"
                        >
                            <PlusIcon className="size-5" />
                        </button>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="rounded-md p-1.5 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground hidden sm:block"
                            aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
                        >
                            {isExpanded ? (
                                <Minimize2Icon className="size-5" />
                            ) : (
                                <Maximize2Icon className="size-5" />
                            )}
                        </button>
                        <button
                            onClick={closePanel}
                            className="rounded-md p-1.5 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                            aria-label="Close chat panel"
                        >
                            <XIcon className="size-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {showHistory ? (
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        <button
                            onClick={handleNewChat}
                            className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border hover:border-[var(--mistral-color-1)] hover:bg-[var(--mistral-color-1)]/5 transition-all group text-muted-foreground hover:text-[var(--mistral-color-1)] mb-4"
                        >
                            <div className="size-8 rounded-full bg-muted group-hover:bg-[var(--mistral-color-1)]/10 flex items-center justify-center transition-colors">
                                <PlusIcon className="size-4" />
                            </div>
                            <span className="font-medium">Start a new discussion</span>
                        </button>

                        {sessions.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No history yet.</p>
                            </div>
                        ) : (
                            sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={cn(
                                        "group flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer border border-transparent",
                                        session.id === currentSessionId
                                            ? "bg-[var(--mistral-color-1)]/5 border-[var(--mistral-color-1)]/20"
                                            : "hover:bg-accent hover:border-border"
                                    )}
                                    onClick={() => handleSwitchSession(session.id)}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={cn(
                                            "size-8 rounded-lg flex items-center justify-center shrink-0",
                                            session.id === currentSessionId
                                                ? "bg-[var(--mistral-color-1)] text-white"
                                                : "bg-muted text-muted-foreground"
                                        )}>
                                            <MessageSquareIcon className="size-4" />
                                        </div>
                                        <div className="flex flex-col overflow-hidden text-left">
                                            <span className={cn(
                                                "font-medium truncate text-sm",
                                                session.id === currentSessionId ? "text-[var(--mistral-color-1)]" : "text-foreground"
                                            )}>
                                                {session.title || 'New Chat'}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(session.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSession(session.id);
                                        }}
                                        className="p-2 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                                        title="Delete chat"
                                    >
                                        <Trash2Icon className="size-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                    <div className="size-16 bg-[var(--mistral-color-1)]/10 rounded-2xl flex items-center justify-center mb-6">
                                        <MistralLogoSolid className="size-8 text-[var(--mistral-color-1)]" />
                                    </div>
                                    <h3 className="font-semibold text-xl mb-2">
                                        How can I help you?
                                    </h3>
                                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                        I can answer questions about {pageContext?.title || 'this documentation'}.
                                    </p>
                                    <div className="mt-8 flex flex-col gap-1 w-full max-w-sm mx-auto">
                                        {[
                                            "What models are available?",
                                            "How do I use constraints?",
                                            "Explain capabilities."
                                        ].map((question) => (
                                            <button
                                                key={question}
                                                onClick={() => sendMessage(question)}
                                                className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors flex items-center gap-3 group"
                                            >
                                                <ThunderIcon className="size-4 shrink-0 text-[#F04E23]" />
                                                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{question}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        'flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
                                        message.role === 'user' ? 'justify-end' : 'justify-start'
                                    )}
                                >
                                    {message.role === 'assistant' && (
                                        <div className="size-8 rounded-lg bg-[var(--mistral-color-1)] flex items-center justify-center shrink-0 mt-1 text-white">
                                            <MistralLogoSolid className="size-5" color="currentColor" />
                                        </div>
                                    )}
                                    <div
                                        className={cn(
                                            'max-w-[85%]',
                                            message.role === 'user'
                                                ? 'bg-secondary/50 text-foreground px-5 py-3 rounded-2xl rounded-tr-sm'
                                                : 'text-foreground px-0 py-1'
                                        )}
                                    >
                                        <div className="text-sm prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed">
                                            {message.role === 'assistant' && message.content.includes("I can only help with Mistral AI documentation.") ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex flex-col items-center gap-2 animate-in fade-in duration-500 shrink-0">
                                                            <img
                                                                src="/assets/sprites/cat_sleeping.gif"
                                                                alt="Sleeping cat"
                                                                className="h-8 w-auto object-contain opacity-80"
                                                            />
                                                        </div>
                                                        <div>
                                                            <ReactMarkdown
                                                                remarkPlugins={[remarkGfm]}
                                                                components={{
                                                                    a: ({ node, href, ...props }: any) => {
                                                                        const isInternal = href && (href.startsWith('/') || href.startsWith('#'));
                                                                        if (isInternal) {
                                                                            return (
                                                                                <Link
                                                                                    href={href}
                                                                                    {...props}
                                                                                    className="text-[var(--mistral-color-1)] hover:underline font-medium"
                                                                                />
                                                                            );
                                                                        }
                                                                        return (
                                                                            <a
                                                                                href={href}
                                                                                {...props}
                                                                                className="text-[var(--mistral-color-1)] hover:underline font-medium"
                                                                            />
                                                                        );
                                                                    },
                                                                    p: ({ node, ...props }: any) => (
                                                                        <p {...props} className="mb-0 inline-block leading-normal" />
                                                                    ),
                                                                    ul: ({ node, ...props }: any) => (
                                                                        <ul {...props} className="list-disc pl-4 mb-0 space-y-1" />
                                                                    ),
                                                                    ol: ({ node, ...props }: any) => (
                                                                        <ol {...props} className="list-decimal pl-4 mb-0 space-y-1" />
                                                                    ),
                                                                    li: ({ node, ...props }: any) => (
                                                                        <li {...props} className="mb-0" />
                                                                    ),
                                                                    h1: ({ node, ...props }: any) => (
                                                                        <h1 {...props} className="text-lg font-bold mb-1 mt-2 first:mt-0" />
                                                                    ),
                                                                    h2: ({ node, ...props }: any) => (
                                                                        <h2 {...props} className="text-base font-bold mb-1 mt-2 first:mt-0" />
                                                                    ),
                                                                    h3: ({ node, ...props }: any) => (
                                                                        <h3 {...props} className="text-sm font-bold mb-1 mt-1 first:mt-0" />
                                                                    ),
                                                                    code: ({ node, inline, className, children, ...props }: any) => {
                                                                        const match = /language-(\w+)/.exec(className || '');
                                                                        return !inline && match ? (
                                                                            <CodeBlock
                                                                                language={match[1]}
                                                                            >
                                                                                {String(children).replace(/\n$/, '')}
                                                                            </CodeBlock>
                                                                        ) : (
                                                                            <code
                                                                                {...props}
                                                                                className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground"
                                                                            >
                                                                                {children}
                                                                            </code>
                                                                        );
                                                                    },
                                                                    pre: ({ node, ...props }: any) => (
                                                                        <div {...props} />
                                                                    ),
                                                                }}
                                                            >
                                                                {message.content}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-1 w-full mt-2">
                                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                                            Suggestions
                                                        </p>
                                                        {[
                                                            "What models are available?",
                                                            "How do I use constraints?",
                                                            "Explain capabilities."
                                                        ].map((question) => (
                                                            <button
                                                                key={question}
                                                                onClick={() => sendMessage(question)}
                                                                className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors flex items-center gap-3 group"
                                                            >
                                                                <ThunderIcon className="size-4 shrink-0 text-[#F04E23]" />
                                                                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{question}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        a: ({ node, href, ...props }: any) => {
                                                            const isInternal = href && (href.startsWith('/') || href.startsWith('#'));
                                                            if (isInternal) {
                                                                return (
                                                                    <Link
                                                                        href={href}
                                                                        {...props}
                                                                        className="text-[var(--mistral-color-1)] hover:underline font-medium"
                                                                    />
                                                                );
                                                            }
                                                            return (
                                                                <a
                                                                    href={href}
                                                                    {...props}
                                                                    className="text-[var(--mistral-color-1)] hover:underline font-medium"
                                                                />
                                                            );
                                                        },
                                                        p: ({ node, ...props }: any) => (
                                                            <p {...props} className="mb-3 last:mb-0" />
                                                        ),
                                                        ul: ({ node, ...props }: any) => (
                                                            <ul {...props} className="list-disc pl-4 mb-3 space-y-1" />
                                                        ),
                                                        ol: ({ node, ...props }: any) => (
                                                            <ol {...props} className="list-decimal pl-4 mb-3 space-y-1" />
                                                        ),
                                                        li: ({ node, ...props }: any) => (
                                                            <li {...props} className="mb-1" />
                                                        ),
                                                        h1: ({ node, ...props }: any) => (
                                                            <h1 {...props} className="text-lg font-bold mb-3 mt-4 first:mt-0" />
                                                        ),
                                                        h2: ({ node, ...props }: any) => (
                                                            <h2 {...props} className="text-base font-bold mb-2 mt-3 first:mt-0" />
                                                        ),
                                                        h3: ({ node, ...props }: any) => (
                                                            <h3 {...props} className="text-sm font-bold mb-2 mt-2 first:mt-0" />
                                                        ),
                                                        code: ({ node, inline, className, children, ...props }: any) => {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            return !inline && match ? (
                                                                <CodeBlock
                                                                    language={match[1]}
                                                                >
                                                                    {String(children).replace(/\n$/, '')}
                                                                </CodeBlock>
                                                            ) : (
                                                                <code
                                                                    {...props}
                                                                    className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground"
                                                                >
                                                                    {children}
                                                                </code>
                                                            );
                                                        },
                                                        pre: ({ node, ...props }: any) => (
                                                            <div {...props} />
                                                        ),
                                                    }}
                                                >
                                                    {message.content}
                                                </ReactMarkdown>
                                            )
                                            }
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="size-8 rounded-lg bg-transparent flex items-center justify-center shrink-0 mt-1">
                                        <MistralLoader />
                                    </div>
                                </div>
                            )}

                            {isNavigating && (
                                <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="size-8 rounded-lg bg-[var(--mistral-color-1)] flex items-center justify-center shrink-0 mt-1 text-white">
                                        <MistralLogoSolid className="size-5" color="currentColor" />
                                    </div>
                                    <div className="max-w-[85%] text-foreground px-0 py-1">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <img
                                                    src="/assets/sprites/cat_walk.gif"
                                                    alt="Walking cat"
                                                    className="h-8 w-auto object-contain"
                                                />
                                                <span className="font-medium">LeChat is crawling...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {navigationSuccess && (
                                <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="size-8 rounded-lg bg-[var(--mistral-color-1)] flex items-center justify-center shrink-0 mt-1 text-white">
                                        <MistralLogoSolid className="size-5" color="currentColor" />
                                    </div>
                                    <div className="max-w-[85%] text-foreground px-0 py-1">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <img
                                                    src="/assets/sprites/orange_cat_idle.gif"
                                                    alt="Success cat"
                                                    className="h-8 w-auto object-contain"
                                                />
                                                <span className="font-medium text-foreground">
                                                    You are at <a href={pageContext?.url || '#'} className="text-[var(--mistral-color-1)] hover:underline">{pageContext?.title || 'this page'}</a> !
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive mx-12">
                                    {error}
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-background dark:bg-neutral-950">
                            <div className="relative flex items-center">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-border bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-[var(--mistral-color-1)]/20 focus:border-[var(--mistral-color-1)] transition-all text-sm placeholder:text-muted-foreground"
                                    disabled={isLoading}
                                />
                                {isLoading ? (
                                    <button
                                        type="button"
                                        onClick={stopGeneration}
                                        aria-label="Stop generation"
                                        className="absolute right-2 p-1.5 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-all"
                                    >
                                        <SquareIcon className="size-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={!inputValue.trim()}
                                        className="absolute right-2 p-1.5 bg-[var(--mistral-color-1)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none transition-all"
                                    >
                                        <SendIcon className="size-4" />
                                    </button>
                                )}
                            </div>
                            <div className="text-center mt-3 flex flex-col gap-1">
                                <p className="text-[10px] text-muted-foreground">
                                    LeChat can make mistakes. Check important info.
                                </p>
                                <p className="text-[10px] text-muted-foreground/60 font-medium">
                                    Tip: you can toggle this pane with <kbd className="font-sans">⌘</kbd> + <kbd className="font-sans">M</kbd>
                                </p>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </>
    );
}
