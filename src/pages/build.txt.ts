import type { APIRoute } from 'astro';

// Serves the git commit this deploy was built from. The IndexNow workflow
// polls it to know when a push is live before submitting URLs.
export const GET: APIRoute = () =>
  new Response(process.env.VERCEL_GIT_COMMIT_SHA ?? 'local', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
