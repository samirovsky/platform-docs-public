import { NextRequest, NextResponse } from 'next/server';
// src/config/lechat.ts

// High-level, hand-written guidance for the LLM.
// This is stable even if the generated routes change.
import { LECHAT_ROUTE_KNOWLEDGE, LECHAT_ROUTES, LECHAT_CATEGORIES } from '@/generated/lechat-routes';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface RequestBody {
    messages: ChatMessage[];
    pageContext?: {
        title: string;
        url: string;
    } | null;
    preferences?: {
        alwaysNavigate?: boolean;
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: RequestBody = await request.json();
        const { messages: clientMessages, pageContext: rawPageContext, preferences } = body;
        const alwaysNavigate = preferences?.alwaysNavigate ?? false;

        if (!Array.isArray(clientMessages) || clientMessages.length === 0) {
            return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
        }

        const pageContext = rawPageContext ?? {
            title: 'Mistral AI Documentation',
            url: 'https://docs.mistral.ai',
        };

        const lastUserMessage =
            clientMessages.slice().reverse().find(m => m.role === 'user')?.content.toLowerCase() ?? '';

        const isFirstTurn = clientMessages.length === 1;
        const isSecondTurn = clientMessages.length === 2;

        const hasExplicitNavIntent =
            /navigate|go to|open|route|page|docs|documentation|reference|api|sdk|client|models?|deployment/i
                .test(lastUserMessage);

        const needsRouteKnowledge = isFirstTurn || isSecondTurn || hasExplicitNavIntent;
        const routeKnowledge = needsRouteKnowledge ? LECHAT_ROUTE_KNOWLEDGE : '';

        // Conditional Prompt Logic
        const navigationInstructions = alwaysNavigate
            ? [
                `- If you find a relevant page and the user asks about it (or explicitly asks to go there), output "NAVIGATE: /path/to/doc".`,
            ]
            : [
                `- If the suggested page is different and the user didn't explicitly ask to navigate, DO NOT merely say "check the detailed guide". Instead, politely invite them: "For more details, would you like me to go to the [Page Title] page?"`,
                `- ONLY output "NAVIGATE: /path/to/doc" if the user explicitly confirms (e.g. "yes", "please", "go there") or explicitly asked to navigate in the first place.`,
            ];

        const systemPrompt = [
            `You are LeChat, a concise and precise assistant for Mistral AI documentation.`,
            `Current page: "${pageContext.title}" (${pageContext.url}).`,
            ``,
            `Rules:`,
            `- Answer ONLY questions related to Mistral AI products, APIs, SDKs, models, deployment, or documentation.`,
            `- If the question is unrelated, reply exactly: "I can only help with Mistral AI documentation."`,
            `- Answer in Markdown.`,

            `- Be brief but technically correct. Use sections, bullet points, and code blocks where helpful.`,
            `- Always prefer suggesting navigation over just linking. If a relevant page exists, your goal is to offer to take the user there.`,
            `- If the current page context is not relevant to the user's question, search your Route knowledge for better matches.`,
            `- If the user confirms a previous navigation suggestion (e.g., says "yes", "sure", "ok", "yeaaa", "yep", "please"), use the exact route that was suggested.`,
            `- If the user asks for context: "SET_CONTEXT: /path/to/page"`,
            `- If the user says "always navigate" (or "yes and always navigate"), output "SET_PREFERENCE: ALWAYS_NAVIGATE" on its own line, and then perform the navigation if applicable (output NAVIGATE command as well).`,
            `- You may suggest links to other relevant pages using standard Markdown links [Title](/path/to/doc).`,
            ...navigationInstructions,
            `- When combining navigation/preference with an answer: put the commands on their own lines at the start.`,
            `- If the user asks to "use context" for a specific page, output "SET_CONTEXT: /path/to/doc" to update the reference context.`,
            `- Otherwise, just provide standard Markdown links [Title](/path/to/doc) in your response.`,
            routeKnowledge && `\nRoute knowledge:\n${routeKnowledge}`,
        ].filter(Boolean).join('\n');

        const MAX_TURNS = 8;
        const trimmedMessages = clientMessages.slice(-MAX_TURNS);

        // Filter out any messages with empty content to avoid API errors
        const validMessages = trimmedMessages.filter(msg => msg.content && msg.content.trim().length > 0);

        const messages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
            ...validMessages,
        ];

        // Set up a timeout to abort the request if it takes longer than 20 seconds
        const timeoutController = new AbortController();
        const timeoutId = setTimeout(() => timeoutController.abort(), 20_000);
        try {
            const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'mistral-small-latest',
                    messages,
                    temperature: 0.3,
                    max_tokens: 600,
                }),
                signal: timeoutController.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                console.error('Mistral API error', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText,
                });
                throw new Error(`Failed to get response from Mistral API (${response.status})`);
            }
            const data = await response.json();
            let assistantMessage: string | undefined = data.choices?.[0]?.message?.content;
            if (!assistantMessage) {
                throw new Error('No response content from Mistral API');
            }

            // Debug: Log raw LLM response to see if NAVIGATE command is present
            console.log('Raw LLM response:', assistantMessage.substring(0, 200));

            // Detect navigation instruction
            let navigateTo: string | undefined;
            let setContext: string | undefined;
            let setPreference: { alwaysNavigate: boolean } | undefined;

            const navMatch = assistantMessage.match(/^NAVIGATE:\s*(\/[^\s]+)/m);
            if (navMatch) {
                let route = navMatch[1].trim();
                console.log(`[LeChat] Validating navigation route: ${route}`);
                // Validate that the route exists in our generated routes
                if (route.startsWith('/') && LECHAT_ROUTES.includes(route)) {
                    navigateTo = route;
                } else if (route.startsWith('/')) {
                    // Check for common hallucinations / aliases
                    if (route === '/api/function-calling') {
                        console.log(`[LeChat] Redirecting hallucinated route ${route} to /capabilities/function_calling`);
                        navigateTo = '/capabilities/function_calling';
                    } else {
                        // Check if it's a category route and try to find the first child
                        const categoryMatch = LECHAT_CATEGORIES.find(c =>
                            '/' + c.name.toLowerCase().replace(/\s+/g, '-') === route ||
                            '/' + c.name.toLowerCase() === route
                        );

                        if (categoryMatch && categoryMatch.routes.length > 0) {
                            const firstChild = categoryMatch.routes[0].path;
                            console.log(`Redirecting category route ${route} to first child ${firstChild}`);
                            navigateTo = firstChild;
                        } else {
                            console.warn(`[LeChat] VALIDATION FAILED: Route "${route}" not found in knowledge base and not a valid category. Navigation aborted.`);
                            // Don't set navigateTo, just continue with the message
                        }
                    }
                }
                // Strip the navigation command from the content shown to user
                assistantMessage = assistantMessage.replace(/^NAVIGATE:\s*(\/[^\s]+)/m, '').trim();
            }

            const contextMatch = assistantMessage.match(/^SET_CONTEXT:\s*(\/[^\s]+)/m);
            if (contextMatch) {
                const route = contextMatch[1].trim();
                if (route.startsWith('/')) {
                    setContext = route;
                }
                // Strip the context command from the content shown to user
                assistantMessage = assistantMessage.replace(/^SET_CONTEXT:\s*(\/[^\s]+)/m, '').trim();
            }

            const prefMatch = assistantMessage.match(/^SET_PREFERENCE:\s*ALWAYS_NAVIGATE/m);
            if (prefMatch) {
                setPreference = { alwaysNavigate: true };
                // Strip the preference command
                assistantMessage = assistantMessage.replace(/^SET_PREFERENCE:\s*ALWAYS_NAVIGATE/m, '').trim();
            }

            return NextResponse.json({ content: assistantMessage, navigateTo, setContext, setPreference });
        } catch (err) {
            clearTimeout(timeoutId);
            if (err instanceof Error && err.name === 'AbortError') {
                // Timeout or user abort – send friendly unavailable message
                return NextResponse.json({ content: '⚡️ Server is currently unavailable. Please try again in a moment.', navigateTo: null }, { status: 504 });
            }
            console.error('LeChat API error:', err);
            return NextResponse.json(
                {
                    error: err instanceof Error ? err.message : 'An error occurred while processing your request',
                },
                { status: 500 },
            );
        }
    } catch (error) {
        console.error('LeChat API error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error
                    ? error.message
                    : 'An error occurred while processing your request',
            },
            { status: 500 },
        );
    }
}
