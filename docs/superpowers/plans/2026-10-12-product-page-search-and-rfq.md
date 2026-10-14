# Localized Product Catalog Implementation Plan

> **For agentic workers:** Execute each task with the test-first workflow. Preserve unrelated working-tree changes.

**Goal:** Make all five product category entry pages and product detail/showcase pages independently discoverable and professionally localized in English, Chinese, Spanish, and Portuguese.

**Architecture:** Reuse the existing category API, product translation API, React routes, SEO hook, and sitemap/prerender scripts. Add localized category guidance as frontend content, keep verified technical facts sourced from backend data, and generate reciprocal hreflang tags for equivalent URLs.

**Tech Stack:** React, TypeScript, React Router, Jest/Testing Library, Node sitemap/prerender scripts.

---

### Task 1: Verify and test shared SEO locale annotations

**Files:** `frontend/src/hooks/useSeoMeta.ts`, `frontend/src/hooks/useSeoMeta.test.tsx`

- [ ] Add tests that each locale emits its self-canonical, all available reciprocal hreflang URLs, and `x-default`.
- [ ] Test language availability subsets for translated dynamic articles and ensure unavailable locales are not emitted.
- [ ] Keep canonical paths language-specific and normalize slash construction.
- [ ] Run the hook tests and verify the new assertions fail before changes.

### Task 2: Add localized landing content and routes for the remaining categories

**Files:** `frontend/src/data/productCategoryGuides.ts`, `frontend/src/pages/Products.tsx`, `frontend/src/pages/Products.test.tsx`, `frontend/src/App.tsx`

- [ ] Add buyer-oriented localized guides for cabinet/wardrobe, industrial, T-slot framing, and standard profiles in en/zh/es/pt.
- [ ] Use stable slugs from the category API: `cabinet-profiles`, `industrial-profiles`, `t-slot-profiles`, and `standard-aluminium-profiles`; keep `windows-doors` unchanged.
- [ ] Resolve the category from route slug, preserve legacy query filters, and route category controls to stable paths.
- [ ] Localize category SEO metadata, buyer guidance, RFQ checklist, and contextual product/article links; avoid unsupported dimensions, standards, compatibility, and manufacturing claims.
- [ ] Add table-driven tests for all four added categories and languages, plus route/canonical checks.

### Task 3: Localize product details and structured breadcrumbs

**Files:** `frontend/src/pages/ProductDetail.tsx`, `frontend/src/pages/ProductDetail.test.tsx`, translation dictionaries as required.

- [ ] Confirm product name, description, parameters, category, features, and applications are read from the API's translated fields for the requested `lang`.
- [ ] Localize metadata fallback text and structured breadcrumb names by language; retain only known product facts.
- [ ] Ensure product detail canonical and hreflang URLs point to the same product slug across available languages.
- [ ] Test all four locales for title/description, breadcrumb labels, locale annotations, and no invented alloy/temper values.

### Task 4: Localize the window and door showcase

**Files:** `frontend/src/pages/ProductShowcase.tsx`, `frontend/src/pages/ProductShowcase.test.tsx`, optionally a focused locale data module.

- [ ] Move all visible showcase copy, technical labels, alt text, RFQ checklist, and structured metadata into four localized variants.
- [ ] Preserve image assets and remove no existing factual qualification or project-confirmation caveat.
- [ ] Test a representative critical section per locale and the generated canonical/hreflang metadata.

### Task 5: Publish routes in SEO artifacts and verify rendered HTML

**Files:** `frontend/scripts/generate-sitemap.js`, `frontend/scripts/prerender.js`, `frontend/scripts/prerender.test.js`, `frontend/public/sitemap.xml` (generated output only when the normal command succeeds).

- [ ] Add all five category routes in four locales to sitemap and prerender route discovery.
- [ ] Ensure static HTML contains each route's localized title, description, canonical, `lang`, and reciprocal hreflang entries.
- [ ] Run script tests, the normal build/prerender pipeline where the environment permits, and inspect generated pages for the four locales.
- [ ] Run focused frontend tests and final diff checks; do not deploy or commit unless separately requested.
