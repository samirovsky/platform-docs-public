import PageContent from '@/components/layout/page-content';
import { DocsVariantProvider } from '@/contexts/docs-variant';
import { LeChatProvider } from '@/contexts/lechat-context';
import { LeChatTrigger } from '@/components/common/lechat-trigger';
import { LeChatPanel } from '@/components/common/lechat-panel';
import { PageContextInitializer } from '@/components/common/page-context-initializer';
import { TextSelectionMenu } from '@/components/common/text-selection-menu';

export default function NoSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LeChatProvider>
      <PageContent className="flex-1 mx-sides" as="main">
        <DocsVariantProvider variant="docs">{children}</DocsVariantProvider>
      </PageContent>
      <PageContextInitializer />
      <LeChatTrigger />
      <LeChatPanel />
      <TextSelectionMenu />
    </LeChatProvider>
  );
}
