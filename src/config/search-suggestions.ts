export type SuggestionSection = {
  match: (pathname?: string | null) => boolean;
  suggestions: string[];
};

export type SuggestionConfig = {
  default: string[];
  sections: SuggestionSection[];
  pageOverrides: Record<string, string[]>;
};

const GENERAL_SUGGESTIONS = [
  'What is the Mistral Platform?',
  'How do I generate an API key?',
  'Can fine-tuning improve my model performance?',
];

const API_SUGGESTIONS = [
  'How do I use the Chat Completions API?',
  'What are the rate limits?',
  'Show me an example of Function Calling',
];

const COOKBOOK_SUGGESTIONS = [
  'How do I use RAG with Mistral?',
  'Example of tool calling with LangChain',
  'How to do fine-tuning on a custom dataset?',
];

// Map specific paths to highly relevant questions
const PAGE_SPECIFIC_SUGGESTIONS: Record<string, string[]> = {
  '/capabilities/vision': [
    'How do I pass an image URL?',
    'What image formats are supported?',
    'Show me a code example for Vision',
  ],
  '/capabilities/function_calling': [
    'How do I define tools?',
    'What is the JSON mode?',
    'Can I use function calling with streaming?',
  ],
  '/deployment/cloud/azure': [
    'How do I deploy on Azure?',
    'What models are available on Azure?',
    'Pricing for Azure deployment',
  ],
};

const DEFAULT_SUGGESTION_CONFIG: SuggestionConfig = {
  default: GENERAL_SUGGESTIONS,
  sections: [
    {
      match: pathname => Boolean(pathname?.startsWith('/api')),
      suggestions: API_SUGGESTIONS,
    },
    {
      match: pathname => Boolean(pathname?.startsWith('/cookbooks')),
      suggestions: COOKBOOK_SUGGESTIONS,
    },
  ],
  pageOverrides: PAGE_SPECIFIC_SUGGESTIONS,
};

export function getSearchSuggestions(
  pathname?: string | null,
  config: SuggestionConfig = DEFAULT_SUGGESTION_CONFIG,
) {
  if (pathname && config.pageOverrides[pathname]) {
    return config.pageOverrides[pathname];
  }

  const matchedSection = config.sections.find(section =>
    section.match(pathname),
  );

  return matchedSection?.suggestions ?? config.default;
}

export const suggestionConfig = DEFAULT_SUGGESTION_CONFIG;
