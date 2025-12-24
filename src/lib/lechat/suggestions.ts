import { LECHAT_ROUTE_KNOWLEDGE } from '@/generated/lechat-routes';

const MAX_SUGGESTIONS = 3;

const BASE_SYSTEM_PROMPT = `You are an expert search assistant for Mistral AI documentation.
Your goal is to predict the most likely "how-to" or "concept" question a user is trying to ask based on their partial input.

Documentation map:
${LECHAT_ROUTE_KNOWLEDGE}

Rules:
- Generate 3-5 high-quality, precise questions that are likely to be "Frequently Asked Questions".
- Questions MUST be relevant to the documentation map above.
- Phrasing should be natural and professional (e.g., "How do I...", "What is...", "Best practices for...").
- diverse: cover different angles (implementation, concept, troubleshooting) if ambiguity exists.
- Ignore queries about general trivia, sports, or other vendors.
- STRICT JSON OUTPUT: {"suggestions":["Question 1", "Question 2", ...], "verdict":"on_topic"|"off_topic"}.
- If the query is completely unrelated to AI/Mistral, set verdict to "off_topic" and suggestions to [].`;

export function buildSuggestionMessages(query: string) {
  const sanitizedQuery = query.trim().replace(/\s+/g, ' ').slice(0, 280);
  return [
    { role: 'system' as const, content: BASE_SYSTEM_PROMPT },
    {
      role: 'user' as const,
      content: `User query: "${sanitizedQuery}". Generate up to ${MAX_SUGGESTIONS} suggestions.`,
    },
  ];
}

export function parseSuggestionPayload(payload: unknown): string[] {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload.filter(isNonEmptyString).slice(0, MAX_SUGGESTIONS);
  }

  if (typeof payload === 'string') {
    try {
      return parseSuggestionPayload(JSON.parse(payload));
    } catch (error) {
      console.error('Failed to parse suggestion string payload', error);
      return [];
    }
  }

  if (typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.suggestions)) {
      return obj.suggestions.filter(isNonEmptyString).slice(0, MAX_SUGGESTIONS);
    }
    const firstArray = Object.values(obj).find(Array.isArray);
    if (firstArray) {
      return firstArray.filter(isNonEmptyString).slice(0, MAX_SUGGESTIONS);
    }
  }

  return [];
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
