# DWC Distiller

A Doctors Who Code text-preview prototype built on Cloudflare Workers.

## Run locally

```powershell
npm install
npm run dev
```

Open the URL printed by Wrangler. Paste text or select **Try an example**, then **Distill text**. The Worker returns an opening excerpt (up to 400 Unicode code points), a whitespace-delimited word count, and the original input length. The 10,000-character input limit uses JavaScript UTF-16 length, matching the page counter. This version does not use AI or produce a semantic summary.

The interface includes light/dark themes, clear and copy controls, loading and error states, and a narrow-screen layout. Its typography and palette follow [Doctors Who Code](https://www.doctorswhocode.blog/). Fonts load from that site, with system-font fallbacks.

## Verify

```powershell
npm test -- --run
npx tsc --noEmit
# With the local server running on port 8787:
node test/client-check.cjs
```

The client check runs the served script against a minimal DOM and the real local API. It tests behavior; it does not verify browser rendering, clipboard permissions, or mobile layout.

`POST /api/distill` accepts JSON `{ "text": "Your passage" }`. Invalid input returns a readable JSON error. Request bodies are capped at 65,000 bytes before parsing; input text is capped at 10,000 UTF-16 code units. No storage or AI binding is configured.

Public baseline: https://dwc-distiller.onyeije.workers.dev/ (the new interface has not yet been deployed).

See [the build journal](DWC_Distiller_Build_Journal_2026-09-24.md) for milestones, verification evidence, and remaining work.
