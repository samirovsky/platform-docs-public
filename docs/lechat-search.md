# Ask LeChat & Global Search Reuse Guide

This repository ships the Ask LeChat assistant and the MiniSearch-powered global search as drop-in modules. The goal of this guide is to show how to embed both features into another Next.js project without reverse-engineering the implementation.

## Prerequisites

- Node 18+ and pnpm 9+
- `MISTRAL_API_KEY` available for server-side routes (`make config` helps create `.env.local`)
- Access to the static search artifacts (`search-index.json` and `search-docs.json` generated via `pnpm search:build`)

## Project structure

| Feature | Key exports | Where to look |
| --- | --- | --- |
| Ask LeChat context | `LeChatProvider`, `useLeChat`, `LeChatTrigger`, `LeChatPanel` | `src/lib/lechat` |
| Dynamic suggestion prompt helpers | `buildSuggestionMessages`, `parseSuggestionPayload` | `src/lib/lechat/suggestions.ts` |
| Search provider & helpers | `SearchProvider`, `useSearchContext`, `useMiniSearch`, `getSearchSuggestions` | `src/lib/search` |

Both modules expose a single entry point (`src/lib/lechat/index.ts` and `src/lib/search/index.ts`) to make re-exports explicit.

## Reusing Ask LeChat

1. **Provider**
   - Wrap your root layout with `<LeChatProvider>` from `@/lib/lechat`.
   - The provider persists sessions, handles keyboard shortcuts, and exposes `useLeChat()` for manual triggers.

2. **UI widgets**
   - Include `<LeChatTrigger />` and `<LeChatPanel />` (see `src/app/layout.tsx` for an example).
   - Both components only depend on Tailwind tokens and the provider.

3. **API routes**
   - Copy `src/app/api/lechat/route.ts` and `src/app/api/lechat/suggestions/route.ts`.
   - These routes use the helpers from `@/lib/lechat/suggestions` to build the Mistral prompts and parse responses.
   - Set `MISTRAL_API_KEY` (or swap the model/provider if you need to).

4. **Prompt customization**
   - Update `src/lib/lechat/suggestions.ts` (or provide your own `buildSuggestionMessages`) to tune the behavior of dynamic search suggestions without touching route logic.

## Reusing the global search

1. **Provider & modal**
   - Wrap the app inside `<SearchProvider>` (re-exported from `@/lib/search`).
   - Use `<GlobalSearch />` or `<SearchInput />` (see `src/components/layout/header`) to open the command palette.

2. **Search index**
   - Generate `search-index.json` and `search-docs.json` by running `pnpm search:build`.
   - Serve both files from `public/` in the target project so `useMiniSearch()` can hydrate the MiniSearch instance.

3. **Static suggestions**
   - Customize `src/config/search-suggestions.ts` to change fallback questions per section/page.
   - `getSearchSuggestions(pathname)` determines the static list that shows before any query is typed.

4. **Dynamic AI suggestions**
   - The search modal automatically calls `/api/lechat/suggestions` when users type at least three characters.
   - You can swap this endpoint for another provider (or disable it) by editing the `fetch` call in `SearchProvider`.

## Checklist for a new project

1. Copy the `src/lib/lechat`, `src/lib/search`, `src/components/common/lechat-*`, and `src/components/context/search-provider.tsx` files.
2. Copy the API routes inside `src/app/api/lechat`.
3. Run `make config` to create `.env.local` with `MISTRAL_API_KEY`.
4. Run `pnpm search:build` in your docs repo and copy the generated JSON files into `public/`.
5. Wrap the root layout with both providers and render `<LeChatTrigger />`, `<LeChatPanel />`, and `<GlobalSearch />` wherever you need them.

Following the steps above keeps the integration isolated, configurable, and ready to share across multiple properties.
