'use client';

import React from 'react';
import { useLeChat } from '@/contexts/lechat-context';
import { Button } from '@/components/ui/button';
import MistralLogoSolid from '@/components/icons/assets/mistral-logo-solid';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function LeChatTrigger() {
    const { isOpen, openPanel } = useLeChat();
    const isDragging = React.useRef(false);

    return (
        <motion.div
            drag
            dragMomentum={false}
            onDragStart={() => { isDragging.current = true; }}
            onDragEnd={() => { setTimeout(() => { isDragging.current = false; }, 100); }}
            className="fixed z-50 cursor-grab active:cursor-grabbing"
            style={{ bottom: '24px', right: '24px' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <motion.div
                initial="visible"
                animate={isOpen ? "hidden" : "visible"}
                variants={{
                    visible: {
                        opacity: 1,
                        y: 0,
                        pointerEvents: 'auto',
                        transition: { duration: 0.3, ease: "easeOut" }
                    },
                    hidden: {
                        opacity: 0,
                        y: 100, // Goes down relative to current position
                        pointerEvents: 'none',
                        transition: { duration: 0.3, ease: "easeIn" }
                    }
                }}
            >
                <Button
                    data-testid="lechat-trigger-button"
                    onClick={(e) => {
                        if (isDragging.current) {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                        }
                        openPanel();
                    }}
                    className={cn(
                        "h-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer",
                        "bg-[var(--mistral-color-1)] hover:bg-[var(--mistral-color-1)]/90 text-white dark:text-white",
                        "px-6 gap-3 border border-transparent dark:border-white/10"
                    )}
                >
                    <MistralLogoSolid className="size-6" color="currentColor" />
                    <span className="font-semibold text-base hidden sm:inline">
                        Ask LeChat
                    </span>
                </Button>
            </motion.div>
        </motion.div>
    );
}
