import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchWordPressPostWithMetadata, fetchWordPressPostsWithMetadata } from '../../../lib/wordpressService';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const { posts } = await fetchWordPressPostsWithMetadata();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const { post } = await fetchWordPressPostWithMetadata(slug);

  if (!post) {
    return { title: 'Blog Post Not Found' };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const { post: blog, cachedAt } = await fetchWordPressPostWithMetadata(slug);

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <nav className="mb-8 flex items-center justify-between">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            &larr; Back to Blog
          </Link>

          <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded px-2 py-1">
            <span className="font-medium">Cached:</span>{' '}
            <time className="font-mono" dateTime={cachedAt}>
              {new Date(cachedAt).toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
              })}
            </time>
          </div>
        </nav>

        <article className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <div className="p-8">
            <header className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
                {blog.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                <span className="font-medium">{blog.author.name}</span>
                <span>&bull;</span>
                <time dateTime={blog.publishedAt}>
                  {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <span>&bull;</span>
                <span>{blog.readingTime} min read</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {blog.excerpt}
              </p>
            </header>

            <div
              className="prose prose-zinc dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.body }}
            />
          </div>

          <footer className="border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                  Written by {blog.author.name}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Published on {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Read More Posts
              </Link>
            </div>
          </footer>
        </article>

        <nav className="mt-8 flex gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            &larr; Back to Home
          </Link>
        </nav>
      </div>
    </div>
  );
}
