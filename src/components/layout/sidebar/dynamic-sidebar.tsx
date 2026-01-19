
'use client';

import React, { useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { DocsSidebar } from './index';
import { NAVIGATION_TREE, NavigationNode } from '@/lib/navigation-data';
import { SideBarTreeNode } from './index';

function convertToSidebarTree(nodes: NavigationNode[]): SideBarTreeNode[] {
    return nodes.map(node => ({
        label: node.title,
        href: node.href,
        clickable: !!node.href,
        children: node.items ? convertToSidebarTree(node.items) : [],
        pagination: {},
    }));
}

export function DynamicDocsSidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const sectionParam = searchParams.get('section');

    const sidebarTree = useMemo(() => {
        // Determine the root section
        const segments = pathname.split('/').filter(Boolean);
        const rootSection = segments[0] || 'products';

        // 1. Try exact match on root section
        if (NAVIGATION_TREE[rootSection]) {
            return convertToSidebarTree(NAVIGATION_TREE[rootSection]);
        }

        // 2. If 'section' param is provided (e.g. for /wip pages), use that
        if (sectionParam && NAVIGATION_TREE[sectionParam]) {
            return convertToSidebarTree(NAVIGATION_TREE[sectionParam]);
        }

        // 3. Fallback to products
        return convertToSidebarTree(NAVIGATION_TREE['products']);
    }, [pathname, sectionParam]);

    return (
        <DocsSidebar
            sidebar={sidebarTree}
            expandedCategoriesOptions={{
                overridedExpandedCategories: {
                    // We might need to adjust this if we want specific expansions
                },
            }}
        />
    );
}
