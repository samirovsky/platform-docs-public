'use client';

import { KeyboardKey } from '@/components/ui/keyboard-key';
import MagnifyingGlass from '@/components/icons/magnifying-glass';
import ChatIcon from '@/components/icons/pixel/chat';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/components/context/search-provider';
import { useLeChat } from '@/contexts/lechat-context';
import { cn } from '@/lib/utils';

export function GlobalSearch({ className }: { className?: string }) {
    const { setOpen } = useSearch();
    const { openPanel } = useLeChat();

    return (
        <div className={cn("w-full relative group", className)}>
            <div
                role="button"
                onClick={() => setOpen(true)}
                className="flex items-center w-full h-12 px-4 pr-24 bg-background/50 hover:bg-background/80 border border-border/50 hover:border-border transition-all duration-300 shadow-sm hover:shadow-md rounded-md cursor-text text-muted-foreground"
            >
                <MagnifyingGlass className="w-5 h-5 mr-3" />
                <span className="text-base font-medium">Search documentation or ask a question</span>
            </div>

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                        e.stopPropagation();
                        openPanel();
                    }}
                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                    title="Ask LeChat"
                >
                    <ChatIcon className="w-5 h-5" />
                </Button>
                <div className="pointer-events-none hidden sm:block">
                    <KeyboardKey className="text-xs">⌘K</KeyboardKey>
                </div>
            </div>
        </div>
    );
}
