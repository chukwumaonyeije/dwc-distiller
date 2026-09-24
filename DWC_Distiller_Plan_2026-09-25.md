# DWC Distiller Plan — September 25, 2026

## Goal

Use the deployed application enough to identify real problems, fix the issues that affect trust or basic usability, and leave the text-and-PDF workflow more reliable. Do not add URL or YouTube ingestion until the current workflow has been exercised with representative sources.

## 1. Test the application as a reader

- [ ] Distill one short pasted article excerpt.
- [ ] Distill one longer set of working notes.
- [ ] Load and distill one short text-based PDF that stays below 10,000 characters.
- [ ] Load and distill one longer PDF that triggers the 10,000-character excerpt notice.
- [ ] Try one source containing headings, references, or a table.
- [ ] Compare every core idea and key point with the visible source.
- [ ] Confirm that the uncertainty field identifies something genuinely missing or unsupported.
- [ ] Confirm that the next question follows from the source rather than outside knowledge.

For each problem, record the source type, the action taken, what happened, what was expected, whether it happens again, and a screenshot when the visual state matters. Do not place confidential or patient-identifiable content in the journal or screenshots.

## 2. Triage findings before editing

- [ ] Mark issues as **blocking**, **misleading**, or **polish**.
- [ ] Fix blocking failures first: uploads that do not load, requests that fail, missing results, or unusable mobile layout.
- [ ] Fix misleading output next: unsupported claims, lost negation, incorrect numbers, or uncertainty that contradicts the source.
- [ ] Defer cosmetic changes unless they interfere with reading or completing the task.

## 3. Improve PDF extraction carefully

- [ ] Review examples of isolated page numbers, split words, repeated headers or footers, and broken accented characters.
- [ ] Add only normalization rules that can be tested against the original PDF.
- [ ] Avoid aggressive cleanup that could alter medical terminology, numbers, units, or negation.
- [ ] Keep the extracted text visible and editable before distillation.
- [ ] Retest the two medical-article examples captured on September 24.
- [ ] Preserve the clear scanned-PDF/OCR limitation.

## 4. Complete browser and phone checks

- [ ] Test the deployed site at a narrow phone width.
- [ ] Capture one phone screenshot.
- [ ] Verify **Copy distillation** with the real browser clipboard.
- [ ] Verify light and dark themes after loading a PDF and after receiving a result.
- [ ] Check long filenames, long key points, and error messages for overflow.
- [ ] Confirm keyboard focus remains understandable through Open PDF, Distill, Copy, and Clear.

## 5. Review production behavior

- [ ] Check Cloudflare request and Workers AI usage after ordinary testing.
- [ ] Confirm the public rate limiter still returns a readable retry message when exercised in a controlled test.
- [ ] Review production errors or logs for failed AI responses and PDF-related browser reports.
- [ ] Run the handler tests, TypeScript check, client behavior check, and `git diff --check` before any deployment.
- [ ] Record every deployment version and public verification in the build journal.

## 6. Decide the next input type

- [ ] Review the evidence from text and PDF use before expanding scope.
- [ ] Prefer URL article extraction as the next slice if the current baseline is stable.
- [ ] Define URL boundaries before implementation: public pages only, extraction failures, redirects, content limits, and sites that block automated access.
- [ ] Keep YouTube transcripts for a later slice because transcript availability, language, timing, and platform access create separate failure modes.

## 7. Preserve the build story

- [ ] Add short journal entries while testing instead of reconstructing the day afterward.
- [ ] Record one example where the distillation was useful and one where it needed correction.
- [ ] Capture the reasoning behind every scope decision.
- [ ] Note material suitable for the Doctors Who Code build log and the AgenticBuilderMD **Build → Use → Observe → Write** framework.

## Definition of done

- [ ] Representative text and PDF sources have been tested against the visible source.
- [ ] Every blocking or misleading issue found today is fixed or documented with a clear next action.
- [ ] Phone layout and real clipboard behavior are verified.
- [ ] Tests pass and the public deployment is rechecked if code changes.
- [ ] The journal contains test evidence, decisions, remaining limitations, and the next product slice.
