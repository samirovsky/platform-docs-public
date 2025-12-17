# Mistral Platform Docs

This repository contains the public-facing documentation for the Mistral AI platform. It is a Next.js application that renders MDX guides, API references, cookbooks, and the Ask LeChat assistant with a shared global search experience.

## Requirements

- Node.js 18+
- pnpm 9+
- A Mistral API key (`MISTRAL_API_KEY`) for Ask LeChat and AI-powered search suggestions

## Quick start

```bash
pnpm install          # installs dependencies and builds API docs (postinstall)
make config           # creates/updates .env.local with required keys
make run              # runs `pnpm dev` on http://localhost:3002
```

The development server rebuilds cookbook content, exports raw MDX, and launches Next.js with the webpack flag that matches production builds.

### Common tasks

| Command | Description |
| --- | --- |
| `make run` | Runs `pnpm dev` (cookbook build + Next.js dev server). |
| `make build` | Runs `pnpm build` (includes the full `prebuild` pipeline). |
| `make config` | Interactive helper that writes `.env.local` with `MISTRAL_API_KEY`, `NEXT_PUBLIC_BASE_URL`, etc. |
| `make lint` | Runs `pnpm lint`. |
| `make type-check` | Runs `pnpm type-check`. |
| `make test` | Runs the Playwright suite (`pnpm playwright test`). |

> Tip: `pnpm search:build` regenerates `public/search-index.json` and `public/search-docs.json`. Run it any time you change docs content outside the normal `prebuild` flow.

## Search & Ask LeChat

- The search modal is powered by `SearchProvider` (`src/lib/search`). It hydrates a MiniSearch index from `public/search-index.json` + `public/search-docs.json` and dispatches Ask LeChat queries directly from the command palette.
- Ask LeChat lives in `src/lib/lechat`. The provider maintains chat sessions, handles navigation commands, and exposes `<LeChatTrigger />` plus `<LeChatPanel />`.
- Dynamic AI suggestions hit `/api/lechat/suggestions`, which uses `src/lib/lechat/suggestions.ts` to build a structured prompt and parse Mistral responses.

Need to embed these features into another project? See [`docs/lechat-search.md`](docs/lechat-search.md) for a step-by-step integration guide.

## Cookbook content

Cookbooks are configured via `cookbooks.config.json`. Each entry points to a notebook under `static/cookbooks` and declares metadata such as:

```json
{
  "path": "path/to/notebook.ipynb",
  "labels": {
    "integrations": [],
    "useCases": ["Your use case"]
  },
  "availableInDocs": true,
  "title": "",
  "mainSection": {
    "featured": false,
    "latest": true
  }
}
```

Run `pnpm cookbook:build` after adding or updating cookbooks to regenerate the compiled MDX.

## Troubleshooting

- Always ensure URLs include `https://` or `http://` to avoid unintended relative links.
- Static assets belong in `static/img/` (reference them as `/img/your-image.svg`).
- Ask LeChat and AI suggestions silently disable themselves if `MISTRAL_API_KEY` is missing. Re-run `make config` to verify `.env.local`.
- If Playwright cannot bind to a port during tests, re-run `make test` outside of containerized shells (the suite spins up a temporary Next.js server via `pnpm dev`).

## Contributing

Mistral AI welcomes external pull requests. Please review the [contribution guide](https://docs.mistral.ai/guides/contribute/) before submitting changes, and verify your work locally with the `make` commands listed above.
