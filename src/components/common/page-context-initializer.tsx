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
    }, [pathname, title, setPageContext]);

    return null;
}
