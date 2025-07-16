import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const siteUrl = 'https://hippobese.com';
const languages = ['es', 'en'];

// Lee los artículos
const articlesPath = resolve('./public/api/articles.json');
const articles = JSON.parse(readFileSync(articlesPath, 'utf-8'));

// ✅ URLs estáticas con idiomas (excluimos /artic/)
const staticPages = [
  '/',
].flatMap((page) =>
  languages.map((lang) => ({
    url: `${siteUrl}${page}?lang=${lang}`,
    lang,
  }))
);

// ✅ URLs dinámicas (artículos) con idiomas
const articlePages = articles.flatMap((article) =>
  languages.map((lang) => ({
    url: `${siteUrl}/artic/?a=${encodeURIComponent(article.id)}&lang=${lang}`,
    lang,
  }))
);

// ✅ URLs de PDFs (solo inglés)
const pdfPages = articles
  .filter((article) => article.nameFile) // Solo artículos que tengan PDF definido
  .map((article) => ({
    url: `${siteUrl}/assets/pdfs/version-1/${encodeURIComponent(article.nameFile)}.pdf`,
    lang: 'en', // PDFs solo en inglés
  }));

// ✅ Combina todas las URLs
const allPages = [...staticPages, ...articlePages, ...pdfPages];

// ✅ Construye bloques <url> con hreflang (solo para páginas, no PDFs)
const urlsXml = allPages
  .map(({ url, lang }) => {
    const safeUrl = url.replace(/&/g, '&amp;');

    // Si es un PDF no agregamos alternates
    if (url.endsWith('.pdf')) {
      return `
  <url>
    <loc>${safeUrl}</loc>
    <changefreq>never</changefreq>
    <priority>0.5</priority>
  </url>`;
    }

    // Para páginas HTML sí agregamos alternates
    const alternates = allPages
      .filter(p => p.url.replace(/(\?lang=)(es|en)/, '') === url.replace(/(\?lang=)(es|en)/, '') && !p.url.endsWith('.pdf'))
      .map(p => {
        const safeHref = p.url.replace(/&/g, '&amp;');
        return `<xhtml:link rel="alternate" hreflang="${p.lang}" href="${safeHref}" />`;
      })
      .join('\n    ');

    return `
  <url>
    <loc>${safeUrl}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    ${alternates}
  </url>`;
  })
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlsXml}
</urlset>`;

// Guarda en public/
const outputPath = resolve('./public/sitemap.xml');
writeFileSync(outputPath, sitemap);

console.log('✅ Sitemap con hreflang + PDFs generado en public/sitemap.xml');
