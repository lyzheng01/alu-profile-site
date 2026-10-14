# Security Headers and Spanish/Portuguese Localization Implementation Plan

> **For agentic workers:** Execute the approved plan inline with verification checkpoints. Preserve all unrelated uncommitted changes.

**Goal:** Deploy a complete conservative security-header baseline and repair Spanish/Portuguese translations for all currently published public content.

**Architecture:** Nginx will supply a consistent security baseline, with explicit handling for locations that override inherited `add_header` directives and upstream Django headers. Translation dictionaries remain the source for localized product/article API fields; tests and live API audits will verify mappings by stable product slug and published ID.

**Tech Stack:** Nginx 1.14, Django REST Framework, JSON translation catalogs, React, Node/Jest, PowerShell/SSH.

---

### Task 1: Establish translation audit and regression tests

**Files:**
- Test: `backend/apps/products/test_translation_service.py`
- Test: `backend/apps/products/test_multilingual_catalog.py`
- Source: `backend/translations/product_es.json`, `backend/translations/product_pt.json`, `backend/translations/category_es.json`, `backend/translations/category_pt.json`

- [ ] Add tests that verify all currently published product IDs have localized non-placeholder values for user-facing translated fields.
- [ ] Add tests for invalid legacy translations (generic `... original` labels) and ensure category names map to the correct catalog categories.
- [ ] Run focused tests and record expected failures before updating dictionaries or mapping code.

### Task 2: Repair Spanish and Portuguese product/category localization

**Files:**
- Modify: `backend/translations/product_es.json`
- Modify: `backend/translations/product_pt.json`
- Modify: `backend/translations/category_es.json`
- Modify: `backend/translations/category_pt.json`
- Modify if evidence requires: `backend/apps/products/serializers.py`, `backend/apps/products/services.py`
- Test: `backend/apps/products/test_translation_service.py`

- [ ] Build the current published ID-to-slug inventory from the live English API (20 products) and preserve current unpublished catalog changes.
- [ ] Repair localized names, descriptions, features, applications, specifications, range/type, finish/color, alloy, and temper explanatory text for Spanish and Portuguese.
- [ ] Keep technical codes and numeric values intact; translate explanatory prose and use locally natural terminology.
- [ ] Confirm category translation IDs correspond to the five active categories.
- [ ] Run backend translation/catalog tests and audit all 20 product API entries per locale for missing, identical-English, or placeholder values.

### Task 3: Audit public page, article, and SEO translations

**Files:**
- Modify only if defects are found: `backend/translations/frontend_es.json`, `backend/translations/frontend_pt.json`, `backend/translations/article_es.json`, `backend/translations/article_pt.json`, `frontend/src/data/seoLocaleLabels.ts`, relevant page metadata code.
- Test: focused frontend localization/SEO tests.

- [ ] Check translation key coverage and obvious fallback strings in all public frontend keys.
- [ ] Audit all 17 published article titles, excerpts, bodies, tags, and metadata in both languages.
- [ ] Fix only evidenced incomplete or unnatural translations, then validate translated article availability and metadata through the live API.

### Task 4: Add security headers and config validation

**Files:**
- Modify: `deploy/aluminum-site.conf`
- Create if useful: `deploy/lingye-security-headers.conf`

- [ ] Add `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and restrictive `Permissions-Policy`; preserve HSTS.
- [ ] Ensure static/media locations that define cache headers also include the security headers; avoid duplicate upstream API headers.
- [ ] Add a config-level test or exact configuration checks for all served location blocks.
- [ ] Run `nginx -t` against the staged production configuration before deployment.

### Task 5: Deploy narrowly and verify production

**Files:**
- Deploy only the task's translation catalogs, backend files if changed, and Nginx config.

- [ ] Back up each affected production file before replacement.
- [ ] Deploy localized catalogs and restart/reload the backend only if the application requires it; validate API data before moving on.
- [ ] Deploy Nginx configuration, run `nginx -t`, and reload only after successful validation.
- [ ] Verify security headers on HTML, API, static files, media, and an error response; verify all 20 product records and all article records in es/pt.
- [ ] Check final diff to ensure pre-existing uncommitted work remains untouched.
