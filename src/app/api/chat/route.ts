import { mistral } from '@ai-sdk/mistral';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, selectedText } = await req.json();

  let systemPrompt = "You are a helpful assistant for Mistral AI documentation. Answer questions clearly and concisely based on the provided context.";
  if (selectedText) {
    systemPrompt += `\n\nContext from documentation:\n"""\n${selectedText}\n"""`;
  }

  const result = await streamText({
    model: mistral('mistral-large-latest'),
    system: systemPrompt,
    messages,
  });

  return result.toAIStreamResponse();
}
