#!/usr/bin/env node
// Regenerates dist/sitemap.xml with static routes plus dynamic blog posts
// (Supabase) and podcast episodes (Pod.co public API). Runs as `postbuild`.
// Never fails the build: on any fetch error it logs a warning and leaves
// the static copy Vite already copied from public/sitemap.xml in place.

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PODCAST_SLUG } from '../src/config/podcast.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://doright.ng';
const DIST_DIR = join(__dirname, '..', 'dist');

const STATIC_ROUTES = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/about', changefreq: 'monthly', priority: '0.8' },
  { loc: '/programs', changefreq: 'monthly', priority: '0.8' },
  { loc: '/training', changefreq: 'monthly', priority: '0.8' },
  { loc: '/join', changefreq: 'monthly', priority: '0.7' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.6' },
  { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
  { loc: '/trustees', changefreq: 'yearly', priority: '0.5' },
  { loc: '/sub-committees', changefreq: 'yearly', priority: '0.5' },
  { loc: '/webinars', changefreq: 'weekly', priority: '0.7' },
  { loc: '/gallery', changefreq: 'monthly', priority: '0.5' },
  { loc: '/events', changefreq: 'weekly', priority: '0.7' },
  { loc: '/media/podcast', changefreq: 'weekly', priority: '0.7' },
  { loc: '/pay', changefreq: 'monthly', priority: '0.8' },
];

async function fetchBlogPostUrls() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('[sitemap] VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY not set, skipping blog posts');
    return [];
  }
  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, published_at, created_at')
      .eq('status', 'published');
    if (error) throw error;
    return (data || []).map((post) => ({
      loc: `/blog/${post.id}`,
      lastmod: (post.published_at || post.created_at || '').slice(0, 10) || undefined,
      changefreq: 'monthly',
      priority: '0.6',
    }));
  } catch (err) {
    console.warn('[sitemap] failed to fetch blog posts, skipping:', err.message);
    return [];
  }
}

async function fetchPodcastEpisodeUrls() {
  try {
    const response = await fetch(`https://public-api.pod.co/podcasts/${PODCAST_SLUG}/episodes`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return (data.data || []).map((episode) => ({
      loc: `/media/podcast/${episode.slug}`,
      lastmod: (episode.published_at || '').slice(0, 10) || undefined,
      changefreq: 'monthly',
      priority: '0.6',
    }));
  } catch (err) {
    console.warn('[sitemap] failed to fetch podcast episodes, skipping:', err.message);
    return [];
  }
}

function toXmlUrl({ loc, lastmod, changefreq, priority }) {
  const lines = ['  <url>', `    <loc>${SITE_URL}${loc}</loc>`];
  if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
  lines.push(`    <changefreq>${changefreq}</changefreq>`, `    <priority>${priority}</priority>`, '  </url>');
  return lines.join('\n');
}

async function main() {
  const [blogUrls, podcastUrls] = await Promise.all([fetchBlogPostUrls(), fetchPodcastEpisodeUrls()]);
  const allUrls = [...STATIC_ROUTES, ...blogUrls, ...podcastUrls];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allUrls.map(toXmlUrl).join('\n')}\n</urlset>\n`;

  writeFileSync(join(DIST_DIR, 'sitemap.xml'), xml);
  console.log(`[sitemap] wrote ${allUrls.length} URLs (${blogUrls.length} blog posts, ${podcastUrls.length} podcast episodes) to dist/sitemap.xml`);
}

main().catch((err) => {
  console.error('[sitemap] generation failed, dist/sitemap.xml keeps the static fallback:', err);
});
