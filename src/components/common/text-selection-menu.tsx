'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useLeChat } from '@/contexts/lechat-context';
import MistralLogoSolid from '@/components/icons/assets/mistral-logo-solid';
import { createPortal } from 'react-dom';

export function TextSelectionMenu() {
    const { openPanel, sendMessage } = useLeChat();
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [selectedText, setSelectedText] = useState('');

    const handleSelection = useCallback(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.toString().trim()) {
            setPosition(null);
            setSelectedText('');
            return;
        }

        const text = selection.toString().trim();
        if (text.length < 3) return; // Ignore very short selections

        const range = selection.getRangeAt(0);
        
        // Check if selection is inside LeChat panel
        const commonAncestor = range.commonAncestorContainer;
        const isInsidePanel = commonAncestor instanceof Element 
            ? commonAncestor.closest('#lechat-panel-container') 
            : commonAncestor.parentElement?.closest('#lechat-panel-container');

        if (isInsidePanel) {
            setPosition(null);
            return;
        }

        const rect = range.getBoundingClientRect();

        // Calculate position (centered above the selection)
        setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10, // 10px above
        });
        setSelectedText(text);
    }, []);

    useEffect(() => {
        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('keyup', handleSelection);
        document.addEventListener('scroll', handleSelection); // Hide/update on scroll
        window.addEventListener('resize', handleSelection);

        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('keyup', handleSelection);
            document.removeEventListener('scroll', handleSelection);
            window.removeEventListener('resize', handleSelection);
        };
    }, [handleSelection]);

    const handleAskLeChat = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!selectedText) return;

        openPanel();
        // Send the selected text as a prompt
        // We might want to wrap it in a context like "Explain this: ..." but the user said "text is sent to the panel"
        // Let's send it directly or maybe "Explain: [text]"? 
        // User said "text is sent to the panel". I'll send it as is, or maybe "Explain this selection: ..."
        // Let's stick to sending the text for now, or maybe prepopulate?
        // "text is sent to the panel" implies `sendMessage`.
        await sendMessage(`Explain this: "${selectedText}"`);

        // Clear selection
        window.getSelection()?.removeAllRanges();
        setPosition(null);
    };

    if (!position) return null;

    // Use portal to render outside of overflow:hidden containers if any, though fixed positioning usually works.
    // But to be safe and ensure z-index works globally.
    return createPortal(
        <button
            style={{
                top: position.y,
                left: position.x,
                transform: 'translate(-50%, -100%)',
            }}
            className="fixed z-[9999] flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-neutral-900 rounded-full shadow-lg border border-border animate-in fade-in zoom-in duration-200 hover:scale-105 transition-transform cursor-pointer group"
            onClick={handleAskLeChat}
            onMouseDown={(e) => e.preventDefault()} // Prevent losing selection on click
        >
            <MistralLogoSolid className="size-4 text-[var(--mistral-color-1)]" />
            <span className="text-sm font-medium text-foreground whitespace-nowrap">Ask LeChat</span>
        </button>,
        document.body
    );
}
