import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/'],
      disallow: [
        '/api/',
        '/notes/',
        '/login',
        '/register',
      ],
    },
    sitemap: 'https://richtext.app/sitemap.xml',
  };
}
