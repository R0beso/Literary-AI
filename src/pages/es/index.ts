// src/pages/es/index.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ redirect }) => {
  return redirect('/?lang=es', 301); // Redirección permanente (SEO-friendly)
};
