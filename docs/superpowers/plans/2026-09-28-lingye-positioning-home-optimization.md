# Lingye Positioning and Homepage Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align Lingye's home, shared factory imagery, page copy, and SEO identity with a factory-forward aluminum-profile sourcing business without claiming Lingye owns the pictured facilities.

**Architecture:** Keep the current React page structure, carousel assets, category/product modules, shared factory component, and inquiry flow. Update copy at its actual sources (React fallbacks, title/SEO config, and backend translation JSON), preserve all routes, then validate both frontend output and production translation API.

**Tech Stack:** React 19, TypeScript, React Router, Tailwind CSS, Jest/React Testing Library, Django translation endpoint, JSON translation catalogs.

---

## File Map

- `frontend/src/pages/Home.tsx`: hero content, CTAs, existing metric strip, homepage SEO metadata.
- `frontend/src/pages/Home.test.tsx`: homepage output, hero actions, carousel imagery and section-order tests.
- `frontend/src/components/FactoryShowcase.tsx`: shared production-scene module used across the home and product routes.
- `frontend/src/components/FactoryShowcase.test.tsx`: localized module title, copy, image alt text, and link tests.
- `frontend/src/pages/About.tsx`: visible factory ownership language, SEO copy, Organization structured-data description, and hardcoded 15 years / 60+ countries / 50,000 tons fallback metrics. Current Company Info/Advantages APIs are empty, so the page renders translation fallbacks.
- `frontend/src/pages/Products.tsx`, `frontend/src/pages/ProductDetail.tsx`, `frontend/src/pages/ProductShowcase.tsx`: visible manufacturer/factory claims, buying-guide anchor labels, metadata, shared module integration, Product structured data, hardcoded fallback trust claims, and unverified extrusion press/anodizing tank facts.
- `frontend/src/pages/LongtailLanding.tsx`: three existing landing-page records include manufacturer/factory ownership and unverified capacity, in-house process, precision, export-market, and lead-time claims. Keep their route keys; revise unsupported brand claims and trust copy.
- `frontend/src/utils/titleManager.ts`, `frontend/public/index.html`: localized page-title/description defaults and static metadata.
- `backend/translations/frontend_en.json`, `frontend_zh.json`, `frontend_es.json`, `frontend_pt.json`: runtime API's actual translation source.
- Existing SEO and backend translation tests: add regression assertions for the changed brand claims and locale resources.

## Task 1: Lock the Homepage Positioning With Tests

**Files:** `frontend/src/pages/Home.test.tsx`

- [ ] Replace carousel-copy assertions with the approved single positioning message while keeping the three-image carousel test.
- [ ] Add assertions that the primary “Send a drawing” link points to `#home-inquiry-form`, the secondary “Browse products” link points to `/en/products`, and both are visible beside the stable hero heading.
- [ ] Assert the page no longer renders “Custom Profiles, Reliable Manufacture”, “Factory-direct”, or developer-facing featured-copy such as “keeps the homepage commercially useful”.
- [ ] Assert five product categories and the existing featured-products-before-FactoryShowcase order remain.
- [ ] Run `npm test -- --watchAll=false --runTestsByPath src/pages/Home.test.tsx`; confirm the new expectations fail before implementation.

## Task 2: Update the Home Hero and Buyer Path

**Files:** `frontend/src/pages/Home.tsx`, `frontend/src/pages/Home.test.tsx`

- [ ] Keep `currentSlide` exclusively for the background-image carousel; use one stable translated H1 and one support sentence for all slides.
- [ ] Add a primary anchor to `#home-inquiry-form` and a secondary React Router link to `/${currentLanguage}/products`.
- [ ] Replace the current number-only metric cards with four compact, translated buyer pathways/capability statements: five product groups, drawing-led custom requirements, finish/processing options, and inquiry/order coordination. Do not add production capacity, lead-time, certification, or factory-ownership claims.
- [ ] Replace editorial fallback text in featured-products and inquiry sections with buyer-facing copy; preserve product data and form behavior.
- [ ] Run the homepage test and verify it passes.

## Task 3: Make Shared Factory Imagery Ownership-Neutral

**Files:** `frontend/src/components/FactoryShowcase.tsx`, `frontend/src/components/FactoryShowcase.test.tsx`, `frontend/src/pages/ProductDetail.tsx`, `backend/translations/frontend_*.json`

- [ ] Change the shared section's wording from “Factory Showcase / Advanced production equipment and modern factory / Explore our factory” to localized wording about production capabilities, manufacturing resources, and project coordination.
- [ ] Keep both current approved local images, the About destination, aspect ratio, and responsive layout.
- [ ] Change the product-detail gallery heading “OUR FACTORY” and its translation key values to neutral production-scene wording without changing image records.
- [ ] Test all visible copy, local image paths, image alt text, and About link; retain the existing home/catalog/detail usage tests.

## Task 4: Remove Lingye-Specific Manufacturer Claims From Metadata and Templates

**Files:** `frontend/src/pages/Home.tsx`, `frontend/src/pages/About.tsx`, `frontend/src/pages/Products.tsx`, `frontend/src/pages/ProductDetail.tsx`, `frontend/src/pages/LongtailLanding.tsx`, `frontend/src/utils/titleManager.ts`, `frontend/public/index.html`, relevant page tests.

- [ ] Change brand-specific `Manufacturer`, `Factory-direct`, `our factory`, “in-house production”, “our facility”, and equivalent claims to accurate “aluminum profile solutions / sourcing and project support” language.
- [ ] Update title, description, OG, and Twitter values together for the homepage and adjust global/static fallback metadata so a pre-hydration page does not contradict the hydrated page.
- [ ] Update About and product templates, including `Competitive Factory-Direct Pricing`, company-specific `Our Factory` labels, About Organization description, and Product structured-data manufacturer fields that identify LingYe as the producer; retain Product `brand` where appropriate.
- [ ] Remove About's hardcoded `15`, `60+`, and `50000` metric fallbacks. Render the metrics strip only when API values exist; with the current empty response, render no figures.
- [ ] In `ProductShowcase.tsx`, remove unverified press tonnage, anodizing tank counts, and unsupported “European-class quality control” language. Preserve the buyer-facing window/door system content and product inquiry path.
- [ ] Replace the seven hardcoded `whyChooseUs` fallback claims in `ProductDetail.tsx` with neutral buyer guidance or remove the block if there is no verified feature data; preserve product-specific, data-backed content only when it does not assert unverified LingYe ownership/capacity.
- [ ] Preserve all page routes and SEO landing slugs. In `LongtailLanding.tsx`, rewrite page-specific H1/title/description/intro/trust points that claim Lingye is the factory/manufacturer or claim in-house lines, ±0.1mm tolerance, 30+ countries, 7–15 day lead times, or other unsupported proof. Keep only product or service statements already supported by site records; where not verified, describe confirmation during project review rather than inventing a substitute metric.
- [ ] Change product-page buying-guide anchor labels when they repeat a false Lingye manufacturer/factory identity; keep their existing hrefs.
- [ ] Add regression tests proving route keys stay resolvable while resulting page H1/metadata contain no company-specific ownership claim.

## Task 5: Align All Supported Runtime Translations

**Files:** `backend/translations/frontend_en.json`, `frontend_zh.json`, `frontend_es.json`, `frontend_pt.json`, `frontend/src/utils/titleManager.ts`, `backend/apps/products/test_translation_service.py` or a focused translation-catalog test.

- [ ] Update every changed UI translation key in all four runtime translation catalogs, including homepage hero/CTA/capability copy, factory module, About/slide/footer identity copy, and product-detail factory wording.
- [ ] Update `PAGE_TITLES` and `PAGE_DESCRIPTIONS` entries for en/zh/es/pt/ar/hi without changing the supported language set.
- [ ] Parse each translation JSON in a test and assert the changed key set has nonempty translations; test `get_all_frontend_content(lang)` returns revised values for en/zh/es/pt.
- [ ] Run backend translation tests and frontend localization tests. Query production `GET /api/translations/frontend_content/?lang=<locale>` after deployment; if production still returns old text, treat deployment as incomplete and synchronize the API's actual source before closing the task.

## Task 6: Verify, Review, and Deploy

**Files:** affected frontend/backend test suites and generated frontend build only.

- [ ] Run focused frontend tests for Home, FactoryShowcase, About, Products, ProductDetail, ProductShowcase, LongtailLanding, Product/Organization structured data, and SEO metadata.
- [ ] Run backend translation tests and parse all four `frontend_*.json` files.
- [ ] Run `npm run build` in `frontend`; confirm sitemap generation, React build, and prerender finish successfully.
- [ ] Inspect desktop and mobile renders, including the first viewport and inquiry anchor; verify images load and CTA targets work.
- [ ] Search the built/runtime-relevant source for Lingye-specific `manufacturer`, `factory-direct`, `our factory`, `in-house`, `自有工厂`, and `我们的工厂` claims. Review matches manually to retain generic industry education only.
- [ ] Deploy frontend and translation-source changes using the repository's documented production flow; verify home/About/products/one SEO landing page status, page title/description/canonical, and translation API output for en/zh/es/pt.
- [ ] Commit only this task's implementation files after verification; do not stage the separate `.superpowers/brainstorm/` mockups.

## Plan Self-Review

- Homepage, shared imagery, all identified brand metadata/templates, translation resources, and online API verification each have explicit tasks.
- Existing URLs, imagery, data-driven galleries, product records, and site architecture are preserved.
- Unverified proof claims are removed rather than replaced with invented numbers; translation source changes are verified independently from frontend fallbacks.
