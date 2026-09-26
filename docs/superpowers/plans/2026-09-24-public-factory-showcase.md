# Public Factory Showcase Implementation Plan

> **For agentic workers:** Execute inline in the current task, test-first, preserving unrelated working-tree changes.

**Goal:** Add a localized, reusable factory photo module to the homepage and every product-related page.

**Architecture:** A shared `FactoryShowcase` component renders the existing extrusion-line and cleaned crane assets with translated heading, supporting copy, image descriptions, and an About link. Home, product listing, product showcase, and product detail pages mount it at the approved content boundaries; the detail page keeps its product-specific database gallery.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, React Testing Library/Jest, existing translation JSON served through the backend API.

---

## Files

- Create `frontend/src/components/FactoryShowcase.tsx` and `FactoryShowcase.test.tsx` for the reusable module.
- Modify `frontend/src/pages/Home.tsx`, `Products.tsx`, `ProductShowcase.tsx`, and `ProductDetail.tsx` to mount the module.
- Modify `frontend/src/pages/Home.test.tsx`, `Products.test.tsx`, `ProductShowcase.test.tsx`; create `ProductDetail.test.tsx` for route-page integration coverage.
- Modify `backend/translations/frontend_{en,zh,es,pt}.json` with the module CTA and localized alt descriptions, reusing existing `factory_showcase` and `factory_subtitle` keys.

### Task 1: Add shared module and localization

- [x] Add a failing `FactoryShowcase.test.tsx` covering the translated heading/subtitle, the two approved image paths, translated alt text, and About link.
- [x] Run the component test and confirm it fails because the component is not implemented.
- [x] Implement the accessible, responsive section using `/images/factory-extrusion-lines.webp` and `/images/factory-crane-clean.webp`.
- [x] Add CTA and alt-text keys in the English, Chinese, Spanish, and Portuguese translation JSON files.
- [x] Rerun the component test and confirm it passes.

### Task 2: Mount on homepage and product catalog

- [x] Add failing integration assertions to `Home.test.tsx` and `Products.test.tsx` for the shared module.
- [x] Run both tests and confirm the expected missing-module failures.
- [x] Mount the module after featured products/buying content as appropriate, keeping the home order: categories, featured products, factory showcase, finish references.
- [x] Rerun the page tests and confirm they pass.

### Task 3: Mount on showcase and product detail

- [x] Add a failing assertion to `ProductShowcase.test.tsx` and create a focused `ProductDetail.test.tsx` for the shared module, while asserting the existing product factory-gallery content remains present.
- [x] Run the tests and confirm the missing shared-module failures.
- [x] Replace ProductShowcase's inline factory-image column with the shared module, preserving the quality checklist; mount the module after related products on ProductDetail while preserving the existing inquiry-form location and product-specific gallery.
- [x] Rerun the showcase and detail tests and confirm they pass.

### Task 4: Verify build and responsive layout

- [x] Run the full frontend test suite (8 suites, 11 tests) and frontend production build (124 prerendered routes, 0 failures).
- [ ] Inspect home, product catalog, showcase, and one detail page at desktop and mobile widths; check image loading, module spacing, localized labels, and no duplicated factory images on showcase.
- [x] Deploy the frontend bundle and four translation JSON files after verification; confirmed 200 responses for the home, product catalog, showcase, product detail, both factory images, and translated content in all four languages.

## Self-Review

- Homepage and all three product page templates are covered by Tasks 2 and 3.
- Existing product-specific factory galleries are explicitly preserved and covered by ProductDetail integration tests.
- All four supported languages receive localized new strings in Task 1.
- Third-party video frames and the reconstructed inspector photo are excluded by design.
