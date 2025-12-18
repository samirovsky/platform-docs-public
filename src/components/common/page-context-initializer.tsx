'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLeChat } from '@/contexts/lechat-context';

interface PageContextInitializerProps {
    title?: string;
}

export function PageContextInitializer({ title }: PageContextInitializerProps) {
    const pathname = usePathname();
    const { setPageContext } = useLeChat();

    useEffect(() => {
        const updateContext = () => {
            // Get the page title from the document or use the provided title
            const pageTitle =
                title ||
                document.title.replace(' | Mistral Docs', '') ||
                'Mistral Documentation';

            // Get the full URL
            const url = window.location.href;

            setPageContext({
                title: pageTitle,
                url,
            });
        };

        // Initial update
        updateContext();

        // Observe title changes
        const titleElement = document.querySelector('title');
        let observer: MutationObserver | null = null;

        if (titleElement) {
            observer = new MutationObserver(updateContext);
            observer.observe(titleElement, { childList: true, subtree: true, characterData: true });
        }

        // Also update on pathname change (Next.js navigation)
        // This is still useful because the title might not change immediately,
        // or might match the previous page's title temporarily.
        // But the observer will catch the subsequent title update.

        return () => {
            observer?.disconnect();
        };
    }, [pathname, title, setPageContext]);

    return null;
}
