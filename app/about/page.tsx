import Link from 'next/link';
import ServerInfo from './server-info';

export const metadata = {
  title: 'About - Next.js 16 Cache Demo',
  description: 'Learn about the Next.js 16 cache architecture with WordPress integration.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <nav className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            &larr; Back to Home
          </Link>
        </nav>

        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
            About
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Next.js 16 cache architecture with WordPress integration
          </p>
        </header>

        <div className="space-y-8">
          <section className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Architecture
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Cache Handlers</h3>
                <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                  <li>&bull; <code className="bg-zinc-100 dark:bg-zinc-700 px-1 rounded">cache-handler.mjs</code> — Legacy (ISR, fetch cache)</li>
                  <li>&bull; <code className="bg-zinc-100 dark:bg-zinc-700 px-1 rounded">cacheHandlers/remote-handler.mjs</code> — Next.js 16 &apos;use cache&apos;</li>
                  <li>&bull; Auto-detects GCS vs file-based storage</li>
                  <li>&bull; In-memory cache disabled</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Cache Strategy</h3>
                <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                  <li>&bull; <code className="bg-zinc-100 dark:bg-zinc-700 px-1 rounded">&apos;use cache&apos;</code> with infinite cacheLife</li>
                  <li>&bull; <code className="bg-zinc-100 dark:bg-zinc-700 px-1 rounded">cacheTag()</code> for surrogate keys</li>
                  <li>&bull; On-demand revalidation from WordPress</li>
                  <li>&bull; No time-based expiration</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700 p-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Dynamic Rendering Demo
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-6">
              The section below renders fresh on every visit (client component). Refresh to see the timestamp update.
            </p>

            <ServerInfo />
          </section>

          <div className="flex gap-4 justify-center">
            <Link
              href="/blogs"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Explore Blog Posts
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-md transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
