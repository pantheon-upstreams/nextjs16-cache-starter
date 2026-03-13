# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Architecture

This is a **Next.js 16** app (App Router) with WordPress integration using `'use cache'`, `cacheTag()`, and `cacheLife()` APIs. Uses `@pantheon-systems/nextjs-cache-handler` for persistent caching. Tailwind CSS v4 for styling.

### Key Differences from Next.js 15

- **No `Surrogate-Key` headers in next.config** — cache tags are set programmatically via `cacheTag()` in `lib/wordpressService.ts`. The adapter (`experimental.adapterPath`) exposes these tags to the internal router, which sets surrogate keys on responses.
- **No `export const revalidate`** — uses `'use cache'` directive with infinite `cacheLife` instead of ISR
- **No `export const dynamic`** — route segment config is incompatible with `cacheComponents: true`. Use client components for dynamic content.
- **`revalidateTag()` requires two arguments** in Next.js 16: `revalidateTag(key, { expire: 0 })`
- **`cacheComponents: true`** in next.config enables the `'use cache'` directive

### Cache System

`next.config.mjs` registers two cache handlers:
- `cacheHandler` → `cache-handler.mjs` (legacy: ISR, route handlers, fetch cache)
- `cacheHandlers.remote` → `cacheHandlers/remote-handler.mjs` (Next.js 16 `'use cache'`)

The adapter at `pantheon-adapter.js` is configured via `experimental.adapterPath` — it makes the site expose cache tags to the internal router for CDN surrogate key headers.

In-memory cache disabled (`cacheMaxMemorySize: 0`). Auto-selects GCS vs file-based storage based on `CACHE_BUCKET`.

### Data Flow

- `lib/wordpressService.ts` fetches from WordPress REST API (default: `developer.wordpress.org/news`)
- `fetchAllWPPosts()` / `fetchSingleWPPost()` — low-level fetches with `next: { tags: [...] }`
- `generateSurrogateKeys()` — produces keys: `post-{id}`, `post-{slug}`, `post-list`, `term-{id}`
- `fetchWordPressPostsWithMetadata()` / `fetchWordPressPostWithMetadata()` — `'use cache'` wrappers that apply `cacheTag()` for each surrogate key with infinite `cacheLife`
- Blog pages call the cached wrapper functions directly
- Types are in `lib/types.ts` (`BlogPost`, `WPPost`)

### API Routes

| Endpoint | Purpose |
|---|---|
| `POST /api/revalidate` | Revalidate surrogate keys from WordPress webhook (secured with `WEBHOOK_SECRET`) |

### Environment Variables

- `WORDPRESS_API_URL` — WordPress REST API base (default: `https://developer.wordpress.org/news/wp-json/wp/v2`)
- `WEBHOOK_SECRET` — Shared secret for `/api/revalidate` (required)
- `CACHE_BUCKET` — GCS bucket name (presence triggers GCS mode)

## Code Style Guidelines

- **Small, focused functions** with single responsibilities and descriptive names
- **Early returns / guard clauses** over nested if statements — keep code flat
- **Targeted try-catch blocks** — catch specific errors close to where they occur
- **No unnecessary nesting** — break nested logic into separate functions
- **Document function purpose** with JSDoc comments explaining the objective
