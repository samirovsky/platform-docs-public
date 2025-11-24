PNPM ?= pnpm

.PHONY: run build config lint type-check test

run:
	$(PNPM) dev

build:
	$(PNPM) build

config:
	node scripts/setup-env.mjs

lint:
	$(PNPM) lint

type-check:
	$(PNPM) type-check

test:
	$(PNPM) playwright test
