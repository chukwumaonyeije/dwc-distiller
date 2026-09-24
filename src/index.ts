import { page } from './page';
const MAX_TEXT_LENGTH = 10000;
const json = (value: unknown, status = 200, headers = {}) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
export default {
  async fetch(request): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === '/') {
      if (!['GET', 'HEAD'].includes(request.method)) return json({ error: 'Use GET to open the page.' }, 405, { Allow: 'GET, HEAD' });
      return new Response(request.method === 'HEAD' ? null : page(MAX_TEXT_LENGTH), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Content-Type-Options': 'nosniff' } });
    }
    if (path !== '/api/distill') return json({ error: 'Page not found.' }, 404);
    if (request.method !== 'POST') return json({ error: 'Use POST to distill text.' }, 405, { Allow: 'POST' });
    if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return json({ error: 'Send your text as JSON.' }, 415);
    let body: unknown;
    try {
      const reader = request.body?.getReader();
      const decoder = new TextDecoder();
      let raw = '', size = 0;
      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > 65000) { await reader.cancel(); return json({ error: 'Request is too large. Use at most 10,000 characters.' }, 413); }
            raw += decoder.decode(value, { stream: true });
          }
        } finally { reader.releaseLock(); }
      }
      body = JSON.parse(raw + decoder.decode());
    } catch { return json({ error: 'The request could not be read. Send valid JSON.' }, 400); }
    if (!body || typeof body !== 'object' || !('text' in body) || typeof body.text !== 'string') return json({ error: 'Include a text field containing your passage.' }, 400);
    if (body.text.length > MAX_TEXT_LENGTH) return json({ error: 'Use at most 10,000 characters.' }, 413);
    const text = body.text.trim();
    if (!text) return json({ error: 'Paste some text before selecting Distill.' }, 400);
    const characters = Array.from(text);
    return json({ method: 'excerpt', label: 'Text preview — not an AI summary', excerpt: characters.slice(0, 400).join('') + (characters.length > 400 ? '…' : ''), wordCount: text.split(/\s+/u).length, characterCount: body.text.length });
  },
} satisfies ExportedHandler<Env>;
