
export type NavigationNode = {
    title: string;
    href?: string;
    items?: NavigationNode[];
};

export const NAVIGATION_TREE: Record<string, NavigationNode[]> = {
    products: [
        {
            title: 'Introduction',
            items: [
                { title: 'Introduction', href: '/products/introduction' },
            ],
        },
        {
            title: 'Language Models',
            items: [
                {
                    title: 'Frontier models',
                    items: [
                        { title: 'Mistral Large family', href: '/products/language-models/frontier-models/mistral-large-2' },
                    ],
                },
                {
                    title: 'Open-weight models',
                    items: [
                        { title: 'Mistral 7B', href: '/products/language-models/open-weight-models/mistral-7b-0-3' },
                        { title: 'Ministral series', href: '/products/language-models/open-weight-models/ministral-8b-24-1' },
                    ],
                },
                {
                    title: 'Specialized models',
                    items: [
                        { title: 'Coding models', href: '/products/language-models/specialized-models/codestral-25-01' },
                        { title: 'Small & efficient models', href: '/products/language-models/specialized-models/mistral-small-3-0-25-01' },
                    ],
                },
            ],
        },
        {
            title: 'Developer Tools',
            items: [
                { title: 'Mistral Vibe', href: '/mistral-vibe/introduction' },
                { title: 'Mistral API', href: '/api' },
            ],
        },
        {
            title: 'AI Tools',
            items: [
                {
                    title: 'Le Chat Pro',
                    items: [
                        { title: 'Quick Start', href: 'https://chat.mistral.ai' },
                        {
                            title: "How To's",
                            items: [
                                { title: 'Document analysis (upload files)', href: '/wip?title=Doc%20Analysis' },
                                { title: 'Plugin marketplace', href: '/wip?title=Plugins' },
                                { title: 'Advanced prompting', href: '/wip?title=Advanced%20Prompting' },
                            ],
                        },
                        { title: 'Support: Pro-tier assistance', href: '/wip?title=Pro%20Support' },
                    ],
                },
                {
                    title: 'Mistral AI Studio',
                    items: [
                        { title: 'Quick Start', href: 'https://console.mistral.ai/home' },
                        { title: "How To's: Build agents without code", href: '/wip?title=Build%20Agents' },
                    ],
                },
            ],
        },
        {
            title: 'Enterprise Solutions',
            items: [
                {
                    title: 'Mistral AI Platform',
                    items: [
                        { title: 'Deployment Options', href: '/wip?title=Platform%20Deployment' },
                    ],
                },
                {
                    title: 'Le Chat Entreprise',
                    items: [
                        { title: 'Deployment Options', href: '/wip?title=Le%20Chat%20Enterprise%20Deployment' },
                    ],
                },
            ],
        },
    ],
    platform: [
        {
            title: 'Introduction',
            items: [
                { title: 'Introduction', href: '/platform/introduction' },
            ],
        },
        {
            title: 'Developer Platform',
            items: [
                { title: 'Setup', href: '/wip?title=Setup&section=platform' },
                { title: 'Chat & Conversations', href: '/platform/developer-platform/completion' },
                { title: 'Agentic Workflows', href: '/wip?title=Agentic%20Workflows&section=platform' },
                { title: 'Document Intelligence', href: '/platform/developer-platform/document_ai' },
                { title: 'RAG & Semantic Search', href: '/platform/developer-platform/embeddings' },
                { title: 'Structured Extraction', href: '/platform/developer-platform/structured_output' },

            ],
        },
        {
            title: 'Evaluation & Optimization',
            items: [
                { title: 'Model Selection Guide', href: '/wip?title=Model%20Selection&section=platform' },
                { title: 'Advanced Prompt Engineering Techniques', href: '/wip?title=Prompting&section=platform' },
                { title: 'Fine-tuning', href: '/platform/evaluation-and-optimization/finetuning' },
                { title: 'Evaluation and observation', href: '/platform/evaluation-and-optimization/evaluation' },
                { title: 'Tokenization & Sampling', href: '/platform/evaluation-and-optimization/tokenization' },
            ],
        },
    ],
    operations: [
        {
            title: 'Introduction',
            items: [
                { title: 'Introduction', href: '/operations/introduction' },
            ],
        },
        {
            title: 'Deployment & Operations',
            items: [
                { title: 'Identity & Access', href: '/wip?title=IAM&section=operations' },
                { title: 'Workspace & organization management', href: '/wip?title=Workspace&section=operations' },
                { title: 'Monitoring', href: '/wip?title=Monitoring&section=operations' },
                { title: 'Cloud Deployment', href: '/wip?title=Cloud%20Deployment&section=operations' },
                { title: 'On-prem section (gated or link)', href: '/wip?title=On-prem&section=operations' },
            ],
        },
        {
            title: 'Security & Governance',
            items: [
                { title: 'Billing & Usage', href: '/operations/security-and-governance/billing-and-usage' },
                { title: 'Security & Compliance', href: '/operations/security-and-governance' },
            ],
        },
    ],
    resources: [
        {
            title: 'Introduction',
            items: [
                { title: 'Introduction', href: '/resources/introduction' },
            ],
        },
        {
            title: 'Technical Reference',
            items: [
                { title: 'Model Library', href: '/wip?title=Model%20Library&section=resources' },
                { title: 'API Reference', href: '/api' },
                { title: 'Beta Features', href: '/wip?title=Beta%20Features&section=resources' },
                { title: 'Glossary', href: '/resources/technical-reference/glossary' },
                { title: 'Limits', href: '/wip?title=Limits&section=resources' },
                { title: 'Changelogs', href: '/resources/technical-reference/changelog' },
                { title: 'System Status', href: '/wip?title=System%20Status&section=resources' },
            ],
        },
        {
            title: 'Examples',
            items: [
                { title: 'Cookbooks', href: '/resources/examples/cookbooks' },
                { title: 'Deep-Dive Product-Oriented Tutorials', href: '/wip?title=Tutorials&section=resources' },
                { title: 'Business Use Cases', href: '/wip?title=Use%20Cases&section=resources' },
                { title: 'Searchable Catalog', href: '/wip?title=Catalog&section=resources' },
            ],
        },
    ],
    community: [
        {
            title: 'Introduction',
            items: [
                { title: 'Introduction', href: '/community/introduction' },
            ],
        },
        {
            title: 'Connect',
            items: [
                { title: 'Discord ↗', href: 'https://discord.com/invite/mistralai' },
                { title: 'Events & Meetups', href: '/community/connect' },
            ],
        },
        {
            title: 'Learn & Share',
            items: [
                { title: 'Videos & YouTube ↗', href: 'https://youtube.com/@MistralAI' },
                { title: 'Talks & Webinars', href: '/community/learn-and-share' },
            ],
        },
        {
            title: 'Open Source',
            items: [
                { title: 'Projects ↗', href: 'https://github.com/mistralai' },
                { title: 'Contribute', href: '/community/open-source' },
            ],
        },
        {
            title: 'Ambassadors',
            items: [
                { title: 'Program overview', href: '/community/ambassadors' },
                { title: 'Ambassador directory', href: '/wip?title=Ambassador%20Directory&section=community' },
                { title: 'Become an ambassador', href: '/wip?title=Join&section=community' },
                { title: 'Roles & responsibilities', href: '/wip?title=Roles&section=community' },
                { title: 'Benefits', href: '/wip?title=Benefits&section=community' },
                { title: 'Program resources', href: '/wip?title=Resources&section=community' },
            ],
        },
    ],
    'getting-started': [
        {
            title: 'Introduction',
            items: [
                { title: 'Introduction', href: '/getting-started/introduction' },
            ],
        },
        {
            title: 'Guides',
            items: [
                {
                    title: 'Definitions',
                    items: [
                        { title: 'What is an LLM?', href: '/getting-started/definitions/what-is-an-llm' },
                        { title: 'Prompting Capabilities', href: '/getting-started/definitions/prompting-techniques' },
                        { title: 'Glossary', href: '/getting-started/definitions/glossary' },
                    ],
                },
                { title: 'Customization', href: '/getting-started/customization' },
                { title: 'Clients', href: '/getting-started/clients' },
                { title: 'Models', href: '/getting-started/models' },
            ],
        },
    ],
};
