# DWC Distiller

A Doctors Who Code text-distillation prototype built on Cloudflare Workers and Workers AI.

## Run locally

```powershell
npm install
npm run dev
```

Open the URL printed by Wrangler. Paste text or select **Try an example**, then **Distill text**. The Worker returns a core idea, three key points, what remains uncertain, and one question to investigate next. The result also includes a whitespace-delimited word count and the original input length. The 10,000-character input limit uses JavaScript UTF-16 length, matching the page counter.

The model is `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, called through an `AI` binding with JSON Schema output. The server validates the returned structure before sending it to the browser. The prompt instructs the model to use only the supplied source and treat instructions inside that source as quoted material. AI output can still omit or misstate details, so the interface tells readers to compare every result with the source.

The interface includes light/dark themes, clear and copy controls, loading and error states, and a narrow-screen layout. Its typography and palette follow [Doctors Who Code](https://www.doctorswhocode.blog/). Fonts load from that site, with system-font fallbacks.

## Verify

```powershell
npm test -- --run
npx tsc --noEmit
# With the local server running on port 8787:
node test/client-check.cjs
```

The client check runs the served script against a minimal DOM and a mocked structured AI response. It tests browser behavior; it does not verify browser rendering, clipboard permissions, mobile layout, or model quality.

`POST /api/distill` accepts JSON `{ "text": "Your passage" }`. Invalid input returns a readable JSON error. Request bodies are capped at 65,000 bytes before parsing; input text is capped at 10,000 UTF-16 code units. No storage binding is configured.

A Cloudflare Rate Limiting binding permits 20 validated distillation requests per minute for the shared public endpoint before model inference. The counter is local to a Cloudflare location and eventually consistent, so this is practical prototype protection rather than exact global accounting. Limited requests receive HTTP 429 with a 60-second retry hint. If the limiter itself is unavailable, the Worker fails closed before using Workers AI.

Workers AI always uses the Cloudflare account, including during local development, and may consume the account's Workers AI allocation. The Vitest configuration therefore uses `wrangler.test.jsonc` without a live AI binding and injects a mocked binding into the handler tests.

Public application: https://dwc-distiller.onyeije.workers.dev/ (Workers AI version deployed and verified September 24, 2026).

See [the build journal](DWC_Distiller_Build_Journal_2026-09-24.md) for milestones, verification evidence, and remaining work.
