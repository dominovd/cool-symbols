import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_URL } from '../lib/seo';

/**
 * Hand-rolled instead of @astrojs/sitemap because that integration emits
 * sitemap-index.xml + sitemap-0.xml. Keeping the single /sitemap.xml filename
 * means the URL already submitted in Google Search Console keeps working, and
 * we retain control over priority/changefreq per page type.
 */
// Written to disk at build time; there is no reason to pay for a function call
// on every crawler hit.
export const prerender = true;

export const GET: APIRoute = async () => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const categories = await getCollection('categories');

  const urls = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    ...categories.map((entry) => ({
      loc: `/${entry.data.slug}`,
      changefreq: 'monthly',
      priority: '0.8',
    })),
    { loc: '/about', changefreq: 'monthly', priority: '0.5' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.5' },
    { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
    { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${SITE_URL}${url.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
