import { SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
const distill = (text: unknown) => SELF.fetch('https://example.com/api/distill', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
describe('DWC Distiller', () => {
 it('serves the input form as HTML', async () => { const r = await SELF.fetch('https://example.com/'); expect(r.status).toBe(200); expect(r.headers.get('content-type')).toContain('text/html'); expect(await r.text()).toContain('id="distill-form"'); });
 it('returns a non-AI excerpt and source counts', async () => { const r = await distill('  Build, test, and learn.  '); expect(r.status).toBe(200); expect(r.headers.get('cache-control')).toBe('no-store'); expect(await r.json()).toEqual({ method: 'excerpt', label: 'Text preview — not an AI summary', excerpt: 'Build, test, and learn.', wordCount: 4, characterCount: 27 }); });
 it.each(['', ' \n\t ', null, 123])('rejects invalid text %j', async (text) => { const r = await distill(text); expect(r.status).toBe(400); expect(await r.json()).toHaveProperty('error'); });
 it('accepts the limit and rejects oversized text', async () => { expect((await distill('a'.repeat(10000))).status).toBe(200); expect((await distill('a'.repeat(10001))).status).toBe(413); });
 it('bounds the request body before parsing', async () => { expect((await distill('a'.repeat(65000))).status).toBe(413); });
 it('does not split emoji at the excerpt boundary', async () => { expect(await (await distill('😀'.repeat(401))).json()).toHaveProperty('excerpt', '😀'.repeat(400) + '…'); });
 it('rejects malformed JSON', async () => { const r = await SELF.fetch('https://example.com/api/distill', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }); expect(r.status).toBe(400); });
 it('requires JSON and POST', async () => { expect((await SELF.fetch('https://example.com/api/distill', { method: 'POST', body: 'text' })).status).toBe(415); const r = await SELF.fetch('https://example.com/api/distill'); expect(r.status).toBe(405); expect(r.headers.get('allow')).toBe('POST'); });
 it('returns 404 for unknown routes', async () => { expect((await SELF.fetch('https://example.com/missing')).status).toBe(404); });
});
