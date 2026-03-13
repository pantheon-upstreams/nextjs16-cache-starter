export interface BlogPost {
  id: number;
  userId: number;
  title: string;
  body: string;
  slug: string;
  excerpt: string;
  author: {
    name: string;
    email: string;
    website: string;
  };
  publishedAt: string;
  readingTime: number;
  tags: string[];
}

export interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  author: number;
  categories?: number[];
  tags?: number[];
  _embedded?: {
    author?: Array<{ name: string; url?: string }>;
    'wp:term'?: Array<Array<{ id: number; name: string; taxonomy: string }>>;
  };
}
