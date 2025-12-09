export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'getemergence.com',
    alternateName: 'getemergence',
    url: 'https://oscarknabe.de',
    logo: 'https://oscarknabe.de/og-image.jpg',
    description: 'Professionelle Webentwicklung und digitale Lösungen für Unternehmen. Websites, Web-Anwendungen und Mobile Apps.',
    email: 'hello@getemergence.com',
    founder: {
      '@type': 'Person',
      name: 'Oscar Knabe',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Steinstraße 71',
      addressLocality: 'Eschweiler',
      postalCode: '52249',
      addressCountry: 'DE',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@getemergence.com',
      contactType: 'customer service',
      availableLanguage: ['German', 'English'],
    },
    sameAs: [
      'https://linkedin.com/in/oscarknabe',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function LocalBusinessJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'getemergence.com - Webentwicklung',
    image: 'https://oscarknabe.de/og-image.jpg',
    url: 'https://oscarknabe.de',
    telephone: '',
    email: 'hello@getemergence.com',
    description: 'Professionelle Webentwicklung und digitale Lösungen. Websites, Web-Anwendungen und Mobile Apps für Unternehmen.',
    priceRange: '€€',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Steinstraße 71',
      addressLocality: 'Eschweiler',
      postalCode: '52249',
      addressCountry: 'DE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 50.8167,
      longitude: 6.2667,
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Frankfurt am Main',
      },
      {
        '@type': 'City',
        name: 'Köln',
      },
      {
        '@type': 'City',
        name: 'Düsseldorf',
      },
      {
        '@type': 'State',
        name: 'Nordrhein-Westfalen',
      },
      {
        '@type': 'Country',
        name: 'Deutschland',
      },
    ],
    serviceType: [
      'Webentwicklung',
      'Web-Design',
      'Mobile App Entwicklung',
      'IT-Beratung',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebsiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'getemergence.com',
    url: 'https://oscarknabe.de',
    description: 'Professionelle Webentwicklung aus Deutschland. Websites, Web-Anwendungen und Mobile Apps für Unternehmen.',
    publisher: {
      '@type': 'Organization',
      name: 'getemergence.com',
    },
    inLanguage: 'de-DE',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
