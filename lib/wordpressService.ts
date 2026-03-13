import { cacheTag, cacheLife } from 'next/cache';
import type { BlogPost, WPPost } from './types';

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || 'https://developer.wordpress.org/news/wp-json/wp/v2';

// ==================== Helpers ====================

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function calculateReadingTime(html: string): number {
  const text = stripHtml(html);
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// ==================== Transform ====================

function transformWordPressPost(wpPost: WPPost): BlogPost {
  const authorData = wpPost._embedded?.author?.[0];
  const wpTerms = wpPost._embedded?.['wp:term']?.flat() || [];
  const termNames = wpTerms.map((t) => t.name);

  return {
    id: wpPost.id,
    userId: wpPost.author,
    title: stripHtml(wpPost.title.rendered),
    body: wpPost.content.rendered,
    slug: wpPost.slug,
    excerpt: stripHtml(wpPost.excerpt.rendered),
    author: {
      name: authorData?.name || 'Unknown',
      email: '',
      website: authorData?.url || '',
    },
    publishedAt: wpPost.date,
    readingTime: calculateReadingTime(wpPost.content.rendered),
    tags: termNames.length > 0 ? termNames : ['General'],
  };
}

// ==================== Surrogate Key Generation ====================

/**
 * Generate surrogate keys for a WordPress post.
 * The same key pattern is used on the WordPress mu-plugin side
 * so both systems can target the same cache entries.
 */
function generateSurrogateKeys(wpPost: WPPost): string[] {
  const keys: string[] = [];

  keys.push(`post-${wpPost.id}`);
  keys.push(`post-${wpPost.slug}`);
  keys.push('post-list');

  if (wpPost.categories) {
    wpPost.categories.forEach(categoryId => keys.push(`term-${categoryId}`));
  }
  if (wpPost.tags) {
    wpPost.tags.forEach(tagId => keys.push(`term-${tagId}`));
  }

  return [...new Set(keys)];
}

// ==================== Low-level Fetch Functions ====================

/**
 * Fetch all posts from WordPress. Tags the fetch-level cache with 'post-list'.
 */
async function fetchAllWPPosts(): Promise<{ posts: BlogPost[]; surrogateKeys: string[] }> {
  const url = `${WORDPRESS_API_URL}/posts?_embed&per_page=10&status=publish&orderby=date&order=desc`;

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: {
      tags: ['post-list'],
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch posts from WordPress: ${response.status}`);
  }

  const wpPosts: WPPost[] = await response.json();
  const allKeys = wpPosts.flatMap(post => generateSurrogateKeys(post));
  const uniqueKeys = [...new Set(allKeys)];

  return { posts: wpPosts.map(transformWordPressPost), surrogateKeys: uniqueKeys };
}

/**
 * Fetch a single post by slug from WordPress. Tags the fetch-level cache with 'post-{slug}'.
 */
async function fetchSingleWPPost(slug: string): Promise<{ post: BlogPost | null; surrogateKeys: string[] }> {
  const url = `${WORDPRESS_API_URL}/posts?_embed&slug=${encodeURIComponent(slug)}&status=publish`;

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: {
      tags: [`post-${slug}`],
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch post from WordPress: ${response.status}`);
  }

  const wpPosts: WPPost[] = await response.json();

  if (wpPosts.length === 0) {
    return { post: null, surrogateKeys: [] };
  }

  const surrogateKeys = generateSurrogateKeys(wpPosts[0]);
  return { post: transformWordPressPost(wpPosts[0]), surrogateKeys };
}

// ==================== Cached Wrapper Functions ('use cache') ====================

/**
 * Fetch all blog posts with 'use cache' directive.
 * Uses infinite cacheLife — relies entirely on on-demand revalidation via surrogate keys.
 */
export async function fetchWordPressPostsWithMetadata(): Promise<{
  posts: BlogPost[];
  cachedAt: string;
}> {
  'use cache';
  cacheLife({ stale: Infinity, revalidate: Infinity, expire: Infinity });

  const { posts, surrogateKeys } = await fetchAllWPPosts();
  surrogateKeys.forEach(key => cacheTag(key));

  return { posts, cachedAt: new Date().toISOString() };
}

/**
 * Fetch a single blog post by slug with 'use cache' directive.
 * Uses infinite cacheLife — relies entirely on on-demand revalidation via surrogate keys.
 */
export async function fetchWordPressPostWithMetadata(slug: string): Promise<{
  post: BlogPost | null;
  cachedAt: string;
}> {
  'use cache';
  cacheLife({ stale: Infinity, revalidate: Infinity, expire: Infinity });

  const { post, surrogateKeys } = await fetchSingleWPPost(slug);
  surrogateKeys.forEach(key => cacheTag(key));

  return { post, cachedAt: new Date().toISOString() };
}
