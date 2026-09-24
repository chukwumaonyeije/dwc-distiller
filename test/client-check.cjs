// Exercise the served client script with a minimal DOM and the real local API.
// This verifies behavior, not browser rendering or layout.
const assert = require('node:assert/strict');
const vm = require('node:vm');
(async () => {
 const html = await (await fetch('http://127.0.0.1:8787/')).text();
 const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const ids = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
 const elements = Object.fromEntries(ids.map(id => [id, { value: '', textContent: '', hidden: false, disabled: false, handlers: {}, attrs: {}, addEventListener(name, fn) { this.handlers[name] = fn; }, setAttribute(k,v) { this.attrs[k]=v; }, removeAttribute(k) { delete this.attrs[k]; }, focus() {} }]));
 let copied = '';
 const context = vm.createContext({ document: { getElementById: id => elements[id], documentElement: { dataset: { theme: 'light' } } }, navigator: { clipboard: { async writeText(text) { copied = text; } } }, fetch: (path, init) => fetch('http://127.0.0.1:8787' + path, init), AbortController, setTimeout, clearTimeout });
 vm.runInContext(script, context);
 const submit = () => elements['distill-form'].handlers.submit({ preventDefault() {} });
 await submit(); assert.match(elements.error.textContent, /Paste some text/);
 elements.source.value = 'a'.repeat(10001); await submit(); assert.match(elements.error.textContent, /10,000/);
 elements.sample.handlers.click(); const pending = submit(); assert.equal(elements.submit.disabled, true); assert.equal(elements.source.readOnly, true); await pending;
 assert.equal(elements.result.hidden, false); assert.match(elements['result-label'].textContent, /not an AI summary/); assert.equal(elements.submit.disabled, false);
 await elements.copy.handlers.click(); assert.match(copied, /not an AI summary/);
 elements.source.value += ' Changed.'; elements.source.handlers.input(); assert.equal(elements.result.hidden, true);
 context.fetch = async () => ({ ok: false, json: async () => ({ error: 'Server temporarily unavailable.' }) }); await submit(); assert.match(elements.error.textContent, /Server temporarily unavailable/); assert.equal(elements.submit.disabled, false); assert.ok(elements.source.value.length);
 context.fetch = async () => ({ ok: true, json: async () => { throw new Error('Invalid JSON'); } }); await submit(); assert.match(elements.error.textContent, /unreadable response/);
 elements.theme.handlers.click(); assert.equal(context.document.documentElement.dataset.theme, 'dark');
 elements.clear.handlers.click(); assert.equal(elements.source.value, ''); assert.equal(elements.result.hidden, true);
 console.log('Client checks PASS: empty, oversized, loading, real API success, copy, stale-result clearing, server failure, unreadable response, theme, clear.');
})().catch(error => { console.error(error); process.exitCode = 1; });
