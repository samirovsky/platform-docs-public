import { NextRequest, NextResponse } from 'next/server';
import { buildSuggestionMessages, parseSuggestionPayload } from '@/lib/lechat/suggestions';

export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json();

        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return NextResponse.json({ suggestions: [] });
        }

        // Abort controller for timeout (faster timeout for suggestions)
        const timeoutController = new AbortController();
        const timeoutId = setTimeout(() => timeoutController.abort(), 5000); // 5s timeout

        const messages = buildSuggestionMessages(query);
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'mistral-small-latest',
                messages,
                temperature: 0.2,
                max_tokens: 150,
                response_format: { type: 'json_object' }
            }),
            signal: timeoutController.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error('Mistral API error');
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content;
        const suggestions = parseSuggestionPayload(rawContent);

        return NextResponse.json({ suggestions });

    } catch (error) {
        console.error('Suggestion API error:', error);
        return NextResponse.json({ suggestions: [] });
    }
}
