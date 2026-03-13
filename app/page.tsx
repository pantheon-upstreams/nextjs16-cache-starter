import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
            Next.js 16 Cache Demo
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            WordPress integration with <code className="bg-zinc-200 dark:bg-zinc-700 px-1 rounded">&apos;use cache&apos;</code> directive and surrogate key revalidation
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/blogs"
            className="block p-6 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Blog Posts
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              WordPress posts cached with <code className="bg-zinc-100 dark:bg-zinc-700 px-1 rounded">&apos;use cache&apos;</code> + <code className="bg-zinc-100 dark:bg-zinc-700 px-1 rounded">cacheTag()</code>. Invalidated on-demand via surrogate keys.
            </p>
          </Link>

          <Link
            href="/about"
            className="block p-6 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              About
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Static page with a client-side dynamic section showing live timestamps.
            </p>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">How this differs from Next.js 15</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>&bull; No <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">Surrogate-Key</code> headers in next.config — cache tags are set programmatically via <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">cacheTag()</code></li>
            <li>&bull; Uses <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">&apos;use cache&apos;</code> directive instead of ISR <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">revalidate</code> exports</li>
            <li>&bull; Two cache handlers: legacy (<code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">cache-handler.mjs</code>) + use-cache (<code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">use-cache-handler.mjs</code>)</li>
            <li>&bull; Infinite <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">cacheLife</code> — pages stay cached until WordPress triggers revalidation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
