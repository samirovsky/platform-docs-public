import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface RequestBody {
    message: string;
    pageContext: {
        title: string;
        url: string;
    };
    conversationHistory: ChatMessage[];
}

export async function POST(request: NextRequest) {
    try {
        const body: RequestBody = await request.json();
        const { message, pageContext, conversationHistory } = body;

        // Build the messages array for Mistral API
        const messages: ChatMessage[] = [
            {
                role: 'system',
                content: `You are LeChat, a helpful AI assistant for Mistral AI documentation. You are currently helping a user understand the documentation page titled "${pageContext.title}" (${pageContext.url}). 

IMPORTANT: Only answer questions about the Mistral AI documentation. If the user asks about topics not related to the documentation, politely remind them that you can only help with documentation-related questions.

Be concise, helpful, and reference specific parts of the documentation when relevant. If you're not sure about something, suggest the user check the official documentation.`,
            },
            ...conversationHistory,
            {
                role: 'user',
                content: message,
            },
        ];

        // Call Mistral API
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'mistral-small-latest',
                messages,
                temperature: 0.7,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Mistral API error:', errorData);
            throw new Error('Failed to get response from Mistral API');
        }

        const data = await response.json();
        const assistantMessage = data.choices?.[0]?.message?.content;

        if (!assistantMessage) {
            throw new Error('No response from Mistral API');
        }

        return NextResponse.json({
            content: assistantMessage,
        });
    } catch (error) {
        console.error('LeChat API error:', error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : 'An error occurred while processing your request',
            },
            { status: 500 }
        );
    }
}
