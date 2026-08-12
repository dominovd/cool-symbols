export const SITE_URL = 'https://cool-symbols.net';
export const SITE_NAME = 'Cool Symbols';
export const GSC_VERIFICATION = 'ETF-UcFG87KFsVQSFjDxOUMGDEG-hgiQfKpezTHcUUk';
export const CONTACT_EMAIL = 'info@cool-symbols.net';

/**
 * Stable @id values. Schema.org entities are far more useful to a search
 * engine when they can be pointed at from several pages rather than
 * redeclared on each one, which is what these anchors are for.
 */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

type FaqEntry = { question: string; answer: string };

/** Social preview image for a page. Generated at build time by scripts/generate-og.mjs. */
export function ogImage(slug: string): string {
  return `${SITE_URL}/og/${slug || 'home'}.png`;
}

/** Vertical variant, sized for Pinterest which drops landscape images. */
export function pinImage(slug: string): string {
  return `${SITE_URL}/og/${slug || 'home'}-pin.png`;
}

/**
 * The publisher entity. Emitted once per page so that any other entity on the
 * page can reference it by @id instead of repeating the details.
 */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/favicon.svg`,
      width: 64,
      height: 64,
    },
    description:
      'Free copy-paste library of Unicode symbols, special characters, fancy text fonts, and AI symbol tools.',
    email: CONTACT_EMAIL,
    foundingDate: '2026',
  };
}

/**
 * The site entity, including the search action that lets Google offer a
 * sitelinks search box. The target points at the home page symbol filter.
 */
export function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    publisher: { '@id': ORGANIZATION_ID },
    inLanguage: 'en',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbJsonLd(displayName: string, slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: displayName, item: `${SITE_URL}/${slug}` },
    ],
  };
}

export function collectionPageJsonLd(input: {
  h1: string;
  description: string;
  slug: string;
  displayName: string;
  symbols: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/${input.slug}#webpage`,
    name: input.h1,
    description: input.description,
    url: `${SITE_URL}/${input.slug}`,
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: ogImage(input.slug),
      width: 1200,
      height: 630,
    },
    mainEntity: {
      '@type': 'ItemList',
      name: input.displayName,
      numberOfItems: input.symbols.length,
      // Capped so the embedded JSON stays a sane size on 100+ symbol pages.
      itemListElement: input.symbols.slice(0, 30).map((name, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name,
      })),
    },
  };
}

export function faqJsonLd(faq: readonly FaqEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/**
 * Generic page entity for the static content pages, which previously carried
 * no structured data at all.
 */
export function webPageJsonLd(input: {
  type: 'AboutPage' | 'ContactPage' | 'WebPage';
  name: string;
  description: string;
  slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': input.type,
    '@id': `${SITE_URL}/${input.slug}#webpage`,
    name: input.name,
    description: input.description,
    url: `${SITE_URL}/${input.slug}`,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
    inLanguage: 'en',
  };
}
