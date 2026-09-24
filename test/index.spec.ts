import { SELF } from 'cloudflare:test';
import { describe, it, expect, vi } from 'vitest';
import worker from '../src/index';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;
const post = (text: unknown) => new IncomingRequest('https://example.com/api/distill', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ text }),
});
const validDistillation = {
	coreIdea: 'Small complete systems create a reliable foundation for later complexity.',
	keyPoints: ['Begin with a bounded problem.', 'Test the full input-to-output path.', 'Record failures and decisions.'],
	uncertainty: 'The source does not define how reliability should be measured.',
	nextQuestion: 'Which real example should be used to evaluate the first version?',
};

describe('DWC Distiller', () => {
 it('serves the input form as HTML', async () => { const r = await SELF.fetch('https://example.com/'); expect(r.status).toBe(200); expect(r.headers.get('content-type')).toContain('text/html'); expect(await r.text()).toContain('id="distill-form"'); });
 it('returns structured AI distillation and source counts', async () => {
	const run = vi.fn().mockResolvedValue({ response: validDistillation });
	const response = await worker.fetch(post('  Build, test, and learn.  '), { AI: { run } as unknown as Ai });
	expect(response.status).toBe(200);
	expect(response.headers.get('cache-control')).toBe('no-store');
	expect(await response.json()).toEqual(expect.objectContaining({ method: 'workers-ai', label: 'AI distillation · Review against the source', ...validDistillation, wordCount: 4, characterCount: 27 }));
	expect(run).toHaveBeenCalledOnce();
	const [model, options] = run.mock.calls[0];
	expect(model).toBe('@cf/meta/llama-3.3-70b-instruct-fp8-fast');
	expect(options.messages[1].content).toContain('Build, test, and learn.');
	expect(options.response_format.type).toBe('json_schema');
 });
 it('accepts JSON returned as a string by the model', async () => {
	const run = vi.fn().mockResolvedValue({ response: JSON.stringify(validDistillation) });
	const response = await worker.fetch(post('Build a small system.'), { AI: { run } as unknown as Ai });
	expect(response.status).toBe(200);
 });
 it('returns a readable error for an invalid model response', async () => {
	const run = vi.fn().mockResolvedValue({ response: { coreIdea: 'Incomplete' } });
	const response = await worker.fetch(post('Build a small system.'), { AI: { run } as unknown as Ai });
	expect(response.status).toBe(502);
	expect(await response.json()).toHaveProperty('error', expect.stringContaining('unavailable'));
 });
 it.each(['', ' \n\t ', null, 123])('rejects invalid text %j', async (text) => { const response = await worker.fetch(post(text), { AI: {} as Ai }); expect(response.status).toBe(400); expect(await response.json()).toHaveProperty('error'); });
 it('accepts the limit and rejects oversized text', async () => {
	const run = vi.fn().mockResolvedValue({ response: validDistillation });
	expect((await worker.fetch(post('a'.repeat(10000)), { AI: { run } as unknown as Ai })).status).toBe(200);
	expect((await worker.fetch(post('a'.repeat(10001)), { AI: { run } as unknown as Ai })).status).toBe(413);
 });
 it('bounds the request body before parsing', async () => { expect((await worker.fetch(post('a'.repeat(65000)), { AI: {} as Ai })).status).toBe(413); });
 it('rejects malformed JSON', async () => { const r = await SELF.fetch('https://example.com/api/distill', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }); expect(r.status).toBe(400); });
 it('requires JSON and POST', async () => { expect((await SELF.fetch('https://example.com/api/distill', { method: 'POST', body: 'text' })).status).toBe(415); const r = await SELF.fetch('https://example.com/api/distill'); expect(r.status).toBe(405); expect(r.headers.get('allow')).toBe('POST'); });
 it('returns 404 for unknown routes', async () => { expect((await SELF.fetch('https://example.com/missing')).status).toBe(404); });
});
