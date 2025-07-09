import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const siteUrl = 'https://hippobese.com'; // Cambia por tu dominio
const languages = ['es', 'en'];

// Lee los artículos
const articlesPath = resolve('./public/api/articles.json');
const articles = JSON.parse(readFileSync(articlesPath, 'utf-8'));

// URLs estáticas con idiomas
const staticPages = [
  '/',
  // '/artic/',
].flatMap((page) =>
  languages.map((lang) => ({
    url: `${siteUrl}${page}?lang=${lang}`,
    lang,
  }))
);

// URLs dinámicas (artículos) con idiomas
const articlePages = articles.flatMap((article) =>
  languages.map((lang) => ({
    url: `${siteUrl}/artic/?a=${encodeURIComponent(article.id)}&lang=${lang}`,
    lang,
  }))
);

// Combina todas las URLs
const allPages = [...staticPages, ...articlePages];

// Construye bloques <url> con hreflang
const urlsXml = allPages
  .map(({ url, lang }, i) => {
    // Genera etiquetas <xhtml:link> para todas las versiones del mismo contenido
    const alternates = allPages
      .filter((p, idx) => {
        // Consideramos que el mismo contenido es el grupo que comparte misma "base" sin lang
        // En tu caso, la base es igual para las versiones, solo cambia lang
        // Como no tenemos ruta "base" explícita, agrupamos por url sin lang param
        // Aquí agrupamos por URL base (sin lang), para artículos usamos id, para estáticos la ruta
        if (p.url === url) return true;
        // Para simplificar, agrupamos URLs que solo cambian en lang (misma ruta, distinto lang)
        return p.url.replace(/(\?lang=)(es|en)/, '') === url.replace(/(\?lang=)(es|en)/, '');
      })
      .map(
        (p) =>
          `<xhtml:link rel="alternate" hreflang="${p.lang}" href="${p.url}" />`
      )
      .join('\n    ');

    return `
  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
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

console.log('✅ Sitemap con hreflang generado en public/sitemap.xml');
