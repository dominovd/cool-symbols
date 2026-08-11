export const SITE_URL = 'https://cool-symbols.net';
export const SITE_NAME = 'Cool Symbols';
export const GSC_VERIFICATION = 'ETF-UcFG87KFsVQSFjDxOUMGDEG-hgiQfKpezTHcUUk';

type FaqEntry = { question: string; answer: string };

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
    name: input.h1,
    description: input.description,
    url: `${SITE_URL}/${input.slug}`,
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

export function faqJsonLd(faq: FaqEntry[]) {
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
