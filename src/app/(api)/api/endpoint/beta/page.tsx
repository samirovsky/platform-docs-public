import { Metadata } from 'next';
import { Heading, HeadingTitle, HeadingSubtitle } from '@/components/layout/heading';

export const metadata: Metadata = {
    title: 'Beta Features',
    description: 'Explore our latest experimental features and APIs.',
};

export default function BetaFeaturesPage() {
    return (
        <div className="max-w-4xl mx-auto flex-1">
            <div className="mb-8 lg:mb-14">
                <Heading className="max-w-2xl not-prose">
                    <HeadingTitle className="text-balance" size="h1" as="h1">
                        Beta Features
                    </HeadingTitle>
                    <HeadingSubtitle className="text-secondary-foreground/65 text-base">
                        Explore our latest experimental features and APIs. These features are in beta and subject to change.
                    </HeadingSubtitle>
                </Heading>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a href="/api/endpoint/beta/agents" className="block p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                    <h2 className="text-xl font-bold mb-2">Beta Agents Endpoints</h2>
                    <p className="text-muted-foreground">Experimental endpoints for managing and interacting with AI agents.</p>
                </a>
                <a href="/api/endpoint/beta/conversations" className="block p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                    <h2 className="text-xl font-bold mb-2">Conversations</h2>
                    <p className="text-muted-foreground">Beta endpoints for conversation management.</p>
                </a>
                <a href="/api/endpoint/beta/libraries" className="block p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                    <h2 className="text-xl font-bold mb-2">Libraries</h2>
                    <p className="text-muted-foreground">Experimental libraries and SDK extensions.</p>
                </a>
            </div>
        </div>
    );
}
