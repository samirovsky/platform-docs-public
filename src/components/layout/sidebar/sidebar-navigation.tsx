'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { DocsSidebar, SideBarTreeNode } from './index';

export function SidebarNavigation({
  fullSidebar,
}: {
  fullSidebar: SideBarTreeNode[];
}) {
  const pathname = usePathname();

  // Define top-level sections that have their own sidebar trees
  const sections = ['getting-started', 'products', 'platform', 'operations', 'resources', 'community'];

  // Determine current section from pathname
  const currentSection = sections.find((section) =>
    pathname.startsWith(`/${section}`)
  ) || 'getting-started';

  // Filter sidebar items
  const filteredSidebar = React.useMemo(() => {
    if (!currentSection) {
      // If no matching section (e.g., root), show nothing or default?
      // Based on request, "open when I click on each top menu", so likely empty or specialized.
      // Let's assume for root path we might show a default or nothing. 
      // For now, let's filter specifically for the section.
      return [];
    }

    // Find the category in the full sidebar that matches the current section
    const sectionNode = fullSidebar.find((item) => {
      // Assume the slug matches the section name. 
      // Sidebar items from file system usually have hrefs like /products
      return item.href === `/${currentSection}` || item.label.toLowerCase() === currentSection;
    });

    // If found, return its children. If the node itself is what we want to show as root, return [sectionNode]
    // The request implies "tree structure that will open when I click on each top menu".
    // Usually this means the children of "Products" become the root of the sidebar.
    return sectionNode?.children || [];

  }, [fullSidebar, currentSection]);

  // If no section matches, or no children found, you might want to show the full sidebar or empty
  // For safety during migration, if filtered is empty but we are not in a known section, maybe show full?
  // But user specifically asked for new structure.

  // Handling the case where we might be at /products (the root of the section)
  // The sidebar generation usually creates a category for /products if it exists as a folder.

  // NOTE: We need to handle the case where "Products" is a folder in src/app/(docs)/products
  // The getSidebar function returns a tree where "products" is a top-level item.

  return (
    <DocsSidebar
      sidebar={filteredSidebar}
      expandedCategoriesOptions={{
        overridedExpandedCategories: {
          // Keep existing override logic if needed, or adjust
          '/': [['getting-started', 'introduction']],
        },
      }}
    />
  );
}
