# T-Slot Accessory Compatibility Article Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a practical T-slot profile/accessory compatibility guide in English, Chinese, Spanish, and Brazilian Portuguese, with two original technical illustrations.

**Architecture:** Use the existing single-article management-command pattern and article translation JSON dictionaries. Keep all language versions structurally aligned and publish original, self-contained SVG diagrams with the existing frontend public images.

**Tech Stack:** Django management command, JSON translation dictionaries, SVG, React site API, sitemap generator.

---

### Task 1: Verify product references and publishing contract

**Files:**
- Read: `backend/apps/news/management/commands/publish_thermal_break_window_rfq_guide.py`
- Read: `backend/apps/news/serializers.py`
- Read: `backend/apps/products/services.py`
- Read: live T-slot product/accessory API and existing T-slot article records

- [ ] Confirm the live T-slot category URL, actual available product/accessory names, article ID allocation, and translation-field requirements. Record only verifiable product facts for the draft.

### Task 2: Write and publish the English article

**Files:**
- Create: `docs/blog-drafts/2026-10-12-t-slot-accessory-compatibility.md`
- Create: `backend/apps/news/management/commands/publish_t_slot_accessory_compatibility.py`
- Test: `backend/apps/news/tests.py`

- [ ] Write a buyer-focused guide covering exact slot identification, T-nut/bolt fit, bracket and end-connector interfaces, mixed-series assumptions, representative assembly checks, and a copy-ready RFQ checklist.
- [ ] Include one worked example that labels known facts and unresolved questions separately; avoid unsupported dimensions, compatibility claims, load ratings, or certifications.
- [ ] Add a focused test for the command's article title, slug, publication status, image references, and idempotent update behavior.
- [ ] Run the focused Django test, execute the management command, then verify the English detail API and source-language product links.

### Task 3: Create original technical illustrations

**Files:**
- Create: `frontend/public/images/article-t-slot-interface-map.svg`
- Create: `frontend/public/images/article-t-slot-rfq-checklist.svg`

- [ ] Draw the profile slot, T-nut/bolt, bracket, and end connection as distinct interfaces without implying universal dimensions.
- [ ] Draw the buyer RFQ checklist as a readable, responsive technical graphic.
- [ ] Check SVG validity, accessible titles/descriptions, text legibility, and production URLs.

### Task 4: Localize all open languages

**Files:**
- Modify: `backend/translations/article_zh.json`
- Modify: `backend/translations/article_es.json`
- Modify: `backend/translations/article_pt.json`
- Test: `backend/apps/news/tests.py`

- [ ] Add title, excerpt, content, and SEO fields for the new article ID in Simplified Chinese, Latin American Spanish, and Brazilian Portuguese.
- [ ] Preserve the English article's heading, paragraph, list, figure, image, and link structure in each translation.
- [ ] Verify terminology, localized internal paths, image alt text, JSON parsing, and minimum article-length requirements.

### Task 5: Deploy and verify

**Files:**
- Regenerate: `frontend/public/sitemap.xml`
- Deploy: translation dictionaries, article data, SVGs, and generated sitemap to `/www/wwwroot/Aluminum`

- [ ] Back up each production file that will be replaced.
- [ ] Deploy using the existing production procedure and rebuild/prerender only if the site's publishing path requires it.
- [ ] Verify live article API responses in all four languages, image URLs, page routes, SEO metadata, `available_languages`, and sitemap entries.

## Self-review

- The design requirements are covered by Tasks 1–5.
- No third-party compatibility or performance claim is introduced without product-specific evidence.
- The deployment task includes backups and direct production verification.
