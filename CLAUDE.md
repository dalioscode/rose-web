# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev        # Start dev server at http://localhost:3000
yarn build      # Build for production
yarn generate   # Static site generation
yarn preview    # Preview production build locally
```

Package manager is **yarn**.

## Architecture

This is a **Nuxt 4** application using the `app/` directory convention (Nuxt 4 layout where pages, components, etc. live under `app/` rather than the root).

Key modules:
- **@nuxt/content** — Markdown-based content, configured in `content.config.ts`. A single `content` collection maps all `**/*.md` files as pages.
- **@nuxt/ui** — Component library (wraps Tailwind CSS v4). Use `U`-prefixed components (e.g. `UContainer`, `UApp`).
- **@nuxt/image** — Optimized image handling.
- **Tailwind CSS v4** — Utility styles, global CSS at `app/assets/css/main.css`.

Global head config (robots noindex, etc.) lives in `nuxt.config.ts` under `app.head`.

Pages: `app/pages/index.vue` (home), `app/pages/changelog.vue`.