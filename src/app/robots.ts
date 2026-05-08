import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/pos', '/api'], // ซ่อนหน้าแอดมินและ API ไม่ให้ขึ้น Google
    },
    sitemap: 'https://kruabaangem.com/sitemap.xml',
  }
}
