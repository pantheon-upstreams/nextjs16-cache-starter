# Next.js 16 Custom Cache Handler Starter

A Next.js 16 application with WordPress integration using the `'use cache'` directive, `cacheTag()`, and `cacheLife()` APIs for on-demand cache revalidation via surrogate keys. Uses `@pantheon-systems/nextjs-cache-handler` for persistent caching across horizontally scaled containers.

## Getting Started

```bash
npm install
npm run dev        # Development server at http://localhost:3000
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint
```

## How It Differs from Next.js 15

| Aspect | Next.js 15 | Next.js 16 |
|---|---|---|
| Cache directive | `export const revalidate = 300` (ISR) | `'use cache'` + `cacheLife()` + `cacheTag()` |
| Surrogate keys | `Surrogate-Key` headers defined in `next.config.mjs` | Set programmatically via `cacheTag()` in data-fetching functions — the internal router reads cache tags directly from the cache handler |
| Cache handlers | Single `cacheHandler` | Legacy `cacheHandler` + `cacheHandlers.remote` for `'use cache'` |
| Dynamic rendering | `export const dynamic = 'force-dynamic'` | Route segment config is incompatible with `cacheComponents: true` — use client components for dynamic content |
| Cache lifetime | Time-based (revalidate every N seconds) | Infinite by default — purely on-demand revalidation from WordPress |
| Adapter | Not used | `experimental.adapterPath` configures the Pantheon adapter, which exposes cache tags to the internal router for setting surrogate keys |

## Pages

| Route | Rendering | Description |
|---|---|---|
| `/` | Static | Homepage with navigation |
| `/blogs` | Cached (`'use cache'`) | Blog listing from WordPress, cached with surrogate keys |
| `/blogs/:slug` | Partial Prerender | Blog detail pages, cached with per-post surrogate keys |
| `/about` | Static | Static page with a client-side dynamic timestamp |

## API Routes

| Endpoint | Method | Description |
|---|---|---|
| `/api/revalidate` | POST | Revalidate surrogate keys (secured with `WEBHOOK_SECRET`) |

### Revalidation Endpoint

The `/api/revalidate` endpoint receives webhook requests from WordPress and calls `revalidateTag()` for each surrogate key.

**Authentication** (one of):
- `X-Webhook-Secret: <WEBHOOK_SECRET>` header
- `secret` field in request body

**Request format:**

```bash
curl -X POST https://your-nextjs-site.com/api/revalidate \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-secret-here" \
  -d '{ "surrogate_keys": ["post-123", "post-my-slug", "post-list", "term-5"] }'
```

**Response:**

```json
{
  "message": "Revalidated 4 cache tags",
  "revalidated_at": "2026-03-12T10:30:00.000Z",
  "results": [
    { "key": "post-123", "status": "success" },
    { "key": "post-my-slug", "status": "success" },
    { "key": "post-list", "status": "success" },
    { "key": "term-5", "status": "success" }
  ]
}
```

## Cache Architecture

### next.config.mjs

```js
const nextConfig = {
  cacheComponents: true,                                                  // enables 'use cache' directive
  cacheHandler: path.resolve(__dirname, './cache-handler.mjs'),           // legacy handler (ISR, fetch cache)
  cacheHandlers: {
    remote: path.resolve(__dirname, './cacheHandlers/remote-handler.mjs'), // 'use cache' handler
  },
  cacheMaxMemorySize: 0,                                                  // all caching through the custom handler
};
```

### Cache Handlers

| File | Purpose |
|---|---|
| `cache-handler.mjs` | Legacy handler for ISR, route handlers, and fetch cache. Uses `createCacheHandler()` from the Pantheon package. |
| `cacheHandlers/remote-handler.mjs` | Next.js 16 handler for the `'use cache'` directive. Uses `createUseCacheHandler()` and exports the instance directly. |

Both auto-detect the storage backend — GCS when `CACHE_BUCKET` is set, file-based otherwise.


### Surrogate Key Tagging

Cache tags are set programmatically in `lib/wordpressService.ts` at two levels:

1. **Fetch-level tags** via `next: { tags: [...] }` on fetch calls:
   - `fetchAllWPPosts()` — tags with `post-list`
   - `fetchSingleWPPost(slug)` — tags with `post-{slug}`

2. **`'use cache'` function-level tags** via `cacheTag()`:
   - `generateSurrogateKeys()` produces keys from each WordPress post: `post-{id}`, `post-{slug}`, `post-list`, `term-{categoryId}`, `term-{tagId}`
   - The cached wrapper functions (`fetchWordPressPostsWithMetadata`, `fetchWordPressPostWithMetadata`) apply these keys via `cacheTag()` with infinite `cacheLife`

The same key pattern is used by the WordPress mu-plugin, enabling targeted invalidation from either side.

## WordPress Integration

Blog content is fetched from a WordPress site via the WP REST API. By default, it uses the WordPress Developer News site as a working demo source.

### Connecting to Your Own WordPress Site

Set the `WORDPRESS_API_URL` environment variable:

```bash
WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json/wp/v2
```

### WordPress mu-plugin for Webhooks

Install the mu-plugin from the [Pantheon WordPress revalidation tutorial](https://docs.pantheon.io/nextjs/wordpress-revalidation-tutorial) at `wp-content/mu-plugins/nextjs-webhook.php`. It:

- Fires on post publish, update, unpublish, and delete events
- Generates matching surrogate keys (`post-{id}`, `post-{slug}`, `post-list`, `term-{id}`)
- Sends a non-blocking POST to your `/api/revalidate` endpoint with the `surrogate_keys` array

### Surrogate Key Flow

```
WordPress post updated
  → mu-plugin generates surrogate keys: ["post-123", "post-my-slug", "post-list", "term-5"]
  → POST /api/revalidate with surrogate_keys + X-Webhook-Secret
  → Next.js calls revalidateTag() for each key
  → Only affected cached entries are refreshed on next request
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `WORDPRESS_API_URL` | WordPress REST API base URL | `https://developer.wordpress.org/news/wp-json/wp/v2` |
| `WEBHOOK_SECRET` | Shared secret for authenticating `/api/revalidate` requests | — (required) |
| `CACHE_BUCKET` | GCS bucket name (presence triggers GCS mode) | — |
