#!/usr/bin/env tsx

/**
 * Generate LeChat route knowledge from the actual documentation structure
 * This ensures the AI always has accurate, up-to-date route information
 */

import fs from 'fs';
import path from 'path';

interface RouteInfo {
    path: string;
    title?: string;
}

function extractTitleFromMDX(filePath: string): string | undefined {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const titleMatch = content.match(/^title:\s*(.+)$/m);
        return titleMatch ? titleMatch[1].trim() : undefined;
    } catch {
        return undefined;
    }
}

function scanDirectory(dir: string, baseRoute: string = ''): RouteInfo[] {
    const routes: RouteInfo[] = [];

    try {
        const items = fs.readdirSync(dir, { withFileTypes: true });

        // Check if current directory has a page file and extract title
        const pageFile = items.find(item =>
            item.isFile() &&
            (item.name === 'page.mdx' || item.name === 'page.tsx' || item.name === 'page.js')
        );

        if (pageFile) {
            const filePath = path.join(dir, pageFile.name);
            let title: string | undefined;
            if (pageFile.name.endsWith('.mdx')) {
                title = extractTitleFromMDX(filePath);
            } else if (pageFile.name.endsWith('.tsx') || pageFile.name.endsWith('.js')) {
                // Use the last segment of the route as a fallback title
                const segment = baseRoute.split('/').pop();
                title = segment?.replace(/_/g, ' ');

                // If no segment (root route), use a default title
                if (!title && !baseRoute) {
                    title = "Home";
                }

                // Capitalize first letters
                if (title) {
                    title = title.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                }
            }
            // For root route, baseRoute is empty string, which is falsy but valid
            // We want to push it if pageFile exists
            routes.push({ path: baseRoute || '/', title });
        }

        for (const item of items) {
            // Skip private directories and files
            if (item.name.startsWith('_') || item.name.startsWith('(') || item.name.startsWith('.')) {
                continue;
            }

            if (item.isDirectory()) {
                const route = `${baseRoute}/${item.name}`;
                // Recursively scan subdirectories
                const subDir = path.join(dir, item.name);
                const subRoutes = scanDirectory(subDir, route);
                routes.push(...subRoutes);
            }
        }
    } catch (error) {
        console.error(`Error scanning directory ${dir}:`, error);
    }

    return routes;
}

interface RouteCategory {
    name: string;
    routes: RouteInfo[];
}

function categorizeRoutes(routes: RouteInfo[]): RouteCategory[] {
    const categories: Map<string, RouteInfo[]> = new Map();

    for (const route of routes) {
        const parts = route.path.split('/').filter(Boolean);
        if (parts.length === 0) continue;

        const category = parts[0];
        const categoryRoutes = categories.get(category) || [];
        categoryRoutes.push(route);
        categories.set(category, categoryRoutes);
    }

    // Convert to array and sort
    return Array.from(categories.entries())
        .map(([name, routes]) => ({
            name: name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            routes: routes.sort((a, b) => a.path.localeCompare(b.path))
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

function generateInitMessage(categories: RouteCategory[]): string {
    return `I'm ready to help you with Mistral AI documentation. Ask me anything! 🚀`;
}

function generateRouteKnowledge(categories: RouteCategory[]): string {
    // Include ALL routes with titles for better matching
    const routeLines = categories.map(cat => {
        const routes = cat.routes.map(r => {
            if (r.title && r.title !== r.path.split('/').pop()?.replace(/_/g, ' ')) {
                return `"${r.title}" (${r.path})`;
            }
            return r.path;
        }).join(', ');
        return `${cat.name}: ${routes}`;
    }).join('\n');

    return `

**Available Documentation Routes:**
${routeLines}

**Navigation:**
- If the user explicitly asks to "navigate", "go to", or "open" a page, end your response with: "NAVIGATE: /exact-route"
- Match user requests to routes using either the page title or the URL path.
- Otherwise, just use standard Markdown links like "[Page Name](/exact-route)" in your text. Do NOT use the NAVIGATE command unless explicitly requested.`;
}

function main() {
    console.log('🔍 Scanning documentation structure...');

    const docsDir = path.join(process.cwd(), 'src/app/(docs)');
    const apiDir = path.join(process.cwd(), 'src/app/(api)/api');
    // Cookbooks are now part of (docs), so they are scanned within docsDir.
    // const cookbookDir = path.join(process.cwd(), 'src/app/(no-sidebar-pages)/cookbooks'); 

    // Scan all directories
    const docsRoutes = scanDirectory(docsDir);
    const apiRoutes = scanDirectory(apiDir, '/api');
    // const cookbookRoutes = scanDirectory(cookbookDir, '/cookbooks');

    // Combine all routes
    const routes = [...docsRoutes, ...apiRoutes];

    console.log(`✅ Found ${routes.length} routes (docs: ${docsRoutes.length}, api: ${apiRoutes.length})`);

    // Manually add specific cookbook routes that use dynamic slug
    const extraCookbookRoutes: RouteInfo[] = [
        { path: '/cookbooks/mistral-ocr-document_understanding', title: 'Mistral OCR Document Understanding' },
        // Add more specific cookbook routes here as needed
    ];
    // Merge with scanned routes
    const allRoutes = [...routes, ...extraCookbookRoutes];
    // Use allRoutes for categories and output
    const categories = categorizeRoutes(allRoutes);
    console.log(`📚 Organized into ${categories.length} categories`);
    // Generate the content
    const initMessage = generateInitMessage(categories);
    const routeKnowledge = generateRouteKnowledge(categories);

    const output = {
        generatedAt: new Date().toISOString(),
        categories,
        initMessage,
        routeKnowledge,
        allRoutes: allRoutes.map(r => r.path).sort()
    };

    const outputPath = path.join(process.cwd(), 'src/generated/lechat-routes.json');
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`✨ Generated route knowledge at ${outputPath}`);

    // Also generate a TypeScript file for importing
    const tsContent = `// Auto-generated by generate-lechat-routes.ts
// Do not edit manually - run 'pnpm lechat:routes' to regenerate

export const LECHAT_INIT_MESSAGE = ${JSON.stringify(initMessage, null, 2)};

export const LECHAT_ROUTE_KNOWLEDGE = ${JSON.stringify(routeKnowledge, null, 2)};

export const LECHAT_ROUTES = ${JSON.stringify(output.allRoutes, null, 2)};

export const LECHAT_CATEGORIES = ${JSON.stringify(categories, null, 2)};
`;

    const tsPath = path.join(process.cwd(), 'src/generated/lechat-routes.ts');
    fs.writeFileSync(tsPath, tsContent);
    console.log(`✨ Generated TypeScript exports at ${tsPath}`);

    console.log('🎉 Done!');
}

main();
