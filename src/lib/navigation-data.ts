
export type NavigationNode = {
    title: string;
    href?: string;
    items?: NavigationNode[];
};

export const NAVIGATION_TREE: Record<string, NavigationNode[]> = {
    products: [
        {
            title: 'AI Models',
            items: [
                { title: 'Mistral Large 2', href: '/wip?title=Mistral%20Large%202' },
                { title: 'Mixtral-8x22B', href: '/wip?title=Mixtral-8x22B' },
                { title: 'Codestral', href: '/wip?title=Codestral' },
            ],
        },
        {
            title: 'Developer Tools',
            items: [
                { title: 'Mistral Code Enterprise', href: '/wip?title=Mistral%20Code%20Enterprise' },
                { title: 'Mistral Vibe', href: '/mistral-vibe/introduction' },
                { title: 'Mistral API', href: '/api' },
            ],
        },
        {
            title: 'AI Tools',
            items: [
                { title: 'Le Chat Pro', href: '/products/chat-and-assistants/le-chat' },
                { title: 'Le Chat Enterprise', href: '/products/chat-and-assistants/le-chat-enterprise' },
                { title: 'Mistral AI Studio', href: '/products/enterprise-platform-and-tools/ai-studio' },
            ],
        },
        {
            title: 'Enterprise Infrastructure',
            items: [
                { title: 'Mistral Compute', href: '/wip?title=Mistral%20Compute' },
                { title: 'On-Premises Solutions', href: '/wip?title=On-Premises' },
                { title: 'Hybrid Deployment', href: '/wip?title=Hybrid%20Deployment' },
            ],
        },
    ],
    platform: [
        {
            title: 'Developer Platform',
            items: [
                { title: 'Setup', href: '/wip?title=Setup&section=platform' },
                { title: 'Chat & Conversations', href: '/platform/developer-platform/completion' }, // Closest match
                { title: 'Agentic Workflows', href: '/wip?title=Agentic%20Workflows&section=platform' },
                { title: 'Document Intelligence', href: '/platform/developer-platform/document_ai' },
                { title: 'RAG & Semantic Search', href: '/platform/developer-platform/embeddings' },
                { title: 'Structured Extraction', href: '/platform/developer-platform/structured_output' },
                { title: 'Mistral Vibe', href: '/wip?title=Mistral%20Vibe&section=platform' },
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
                { title: 'Billing & Usage', href: '/wip?title=Billing&section=operations' },
                { title: 'Security & Compliance', href: '/operations/security-and-governance' },
            ],
        },
    ],
    resources: [
        {
            title: 'Technical Reference',
            items: [
                { title: 'Model Library', href: '/wip?title=Model%20Library&section=resources' },
                { title: 'API Reference', href: '/api' },
                { title: 'Beta Features', href: '/wip?title=Beta%20Features&section=resources' },
                { title: 'Error Glossary', href: '/wip?title=Error%20Glossary&section=resources' },
                { title: 'Limits', href: '/wip?title=Limits&section=resources' },
                { title: 'Changelogs', href: '/wip?title=Changelogs&section=resources' },
                { title: 'System Status', href: '/wip?title=System%20Status&section=resources' },
            ],
        },
        {
            title: 'Examples',
            items: [
                { title: 'Cookbooks', href: '/cookbooks' },
                { title: 'Deep-Dive Product-Oriented Tutorials', href: '/wip?title=Tutorials&section=resources' },
                { title: 'Business Use Cases', href: '/wip?title=Use%20Cases&section=resources' },
                { title: 'Searchable Catalog', href: '/wip?title=Catalog&section=resources' },
            ],
        },
    ],
    community: [
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
};
