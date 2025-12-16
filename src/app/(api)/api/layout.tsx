import sidebarMetadata from '../components/sidebar-metadata.json';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import PageContent from '@/components/layout/page-content';
import { ApiSidebarItem, ApiSidebarMetadataItem } from '../schema/api-sidebar';
import { ApiDocsSidebar } from '../components/sidebar';
import { ApiBreadcrumb } from '@/components/layout/api-breadcrumb';
import { ActiveElementHashProvider } from '../components/hash-auto-change';
import { DocsVariantProvider } from '@/contexts/docs-variant';
import { ApiPagination } from '../components/pagination';
import { LeChatProvider } from '@/contexts/lechat-context';
import { LeChatTrigger } from '@/components/common/lechat-trigger';
import { LeChatPanel } from '@/components/common/lechat-panel';
import { PageContextInitializer } from '@/components/common/page-context-initializer';
import { TextSelectionMenu } from '@/components/common/text-selection-menu';
import { GlobalSearch } from '@/components/layout/global-search';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const flattenedSidebar = flattenSidebar(sidebarMetadata);
  return (
    <LeChatProvider>
      <ActiveElementHashProvider>
        <SidebarProvider>
          <DocsVariantProvider variant="api">
            <Sidebar
              className="h-fold sticky top-header overflow-y-auto scrollbar-none shrink-0"
              collapsible="none"
            >
              <div>
                <ApiDocsSidebar sidebar={flattenedSidebar} />
              </div>
            </Sidebar>
            <div className="flex flex-1 gap-8 min-w-0 lg:pr-sides">
              <PageContent
                as="main"
                className="max-lg:contents lg:px-inner-sides !px-0 items-start"
                data-wrapper-type="api-content"
              >
                <div className="flex-1 min-w-0 w-full flex justify-center lg:py-6 relative">
                  <div className="flex flex-col gap-8 lg:gap-4 flex-1 w-full min-w-0 max-w-4xl">
                    <div className="sticky top-header z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mx-4 px-4 mb-4">
                      <GlobalSearch />
                    </div>
                    <ApiBreadcrumb sidebar={flattenedSidebar} />
                    <div className="contents group/mdx-wrapper">
                      {children}
                      <ApiPagination
                        items={flattenedSidebar}
                        overrides={{
                          pathSlugMap: {
                            '/api': ['api', 'endpoint', 'chat'],
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </PageContent>
            </div>
          </DocsVariantProvider>
        </SidebarProvider>
      </ActiveElementHashProvider>
      <PageContextInitializer />
      <LeChatTrigger />
      <LeChatPanel />
      <TextSelectionMenu />
    </LeChatProvider>
  );
}

const flattenSidebar = (sidebar: typeof sidebarMetadata): ApiSidebarItem[] => {
  const stableEndpoints: ApiSidebarItem[] = [];
  const betaEndpoints: ApiSidebarItem[] = [];

  const gettingStartedCategory: ApiSidebarItem = {
    type: 'category',
    label: 'Getting Started',
    href: '/api/endpoint/chat',
    children: [],
    clickable: true,
    pagination: { prev: undefined, next: undefined },
  };

  const betaCategory: ApiSidebarItem = {
    type: 'category',
    label: 'Beta',
    href: '/api/endpoint/beta/agents',
    children: [],
    clickable: true,
    pagination: { prev: undefined, next: undefined },
  };

  const traverse = (node: ApiSidebarMetadataItem) => {
    const targetCategory = node.slug.includes('beta')
      ? betaEndpoints
      : stableEndpoints;

    targetCategory.push({
      type: 'category',
      label: node.sidebarLabel,
      href: !node.slug ? '/api' : `/api/${node.slug}`,
      clickable: true,
      pagination: { prev: undefined, next: undefined },
      children: node.tags.flatMap(tag =>
        tag.operations.map(
          operation =>
            ({
              type: 'endpoint',
              label: operation.summary,
              href: `/api/${node.slug}#${operation.elementId}`,
              children: [],
              method: operation.method,
              path: operation.path,
              elementId: operation.elementId,
              clickable: true,
              pagination: { prev: undefined, next: undefined },
            }) satisfies ApiSidebarItem
        )
      ),
    });
  };

  for (const item of sidebar) {
    traverse(item);
  }

  gettingStartedCategory.children = stableEndpoints;
  betaCategory.children = betaEndpoints;

  const result = [gettingStartedCategory, betaCategory];

  const allItems: ApiSidebarItem[] = [];

  for (const item of result) {
    if (item.children && item.children.length > 0) {
      allItems.push(...item.children);
    }
  }

  for (let i = 0; i < allItems.length; i++) {
    const current = allItems[i];
    const prev = i > 0 ? allItems[i - 1] : undefined;
    const next = i < allItems.length - 1 ? allItems[i + 1] : undefined;

    current.pagination = {
      prev:
        prev && prev.href ? { href: prev.href, title: prev.label } : undefined,
      next:
        next && next.href ? { href: next.href, title: next.label } : undefined,
    };
  }

  return result;
};
