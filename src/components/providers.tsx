'use client';

import { ThemeProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { LeChatProvider } from '@/contexts/lechat-context';

import { SearchProvider } from './context/search-provider';
import { TabSyncProvider } from '@/contexts/tab-sync-context';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LeChatProvider>
        <SearchProvider>
          <TabSyncProvider>{children}</TabSyncProvider>
        </SearchProvider>
      </LeChatProvider>
    </ThemeProvider>
  );
}
