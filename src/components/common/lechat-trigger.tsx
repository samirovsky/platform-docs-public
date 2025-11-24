'use client';

import React from 'react';
import { useLeChat } from '@/contexts/lechat-context';
import { MessageCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LeChatTrigger() {
    const { openPanel } = useLeChat();

    return (
        <button
            onClick={openPanel}
            className={cn(
                'fixed bottom-6 right-6 z-50',
                'flex items-center gap-2 px-4 py-3',
                'bg-primary text-primary-foreground',
                'rounded-full shadow-lg',
                'hover:bg-primary/90',
                'transition-all duration-200',
                'hover:scale-105',
                'group'
            )}
            aria-label="Ask LeChat about this page"
        >
            <MessageCircleIcon className="size-5" />
            <span className="font-medium text-sm hidden sm:inline">
                Ask LeChat about this page
            </span>
        </button>
    );
}
