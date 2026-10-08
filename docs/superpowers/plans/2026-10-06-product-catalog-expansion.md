# Product Catalog Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand T-slot and accessory listings to 24 and window/door systems to 10, with accurate project-specific sourcing copy and complete nine-locale product content.

**Architecture:** Extend the existing idempotent Django catalog seeder and its local catalog assets; preserve current categories and product slugs. Keep translations keyed by stable product slug in the seeder source, then resolve database IDs when writing the existing locale JSON files so IDs can differ across environments. New images are original illustrative assets, not claimed as exact drawings; display a clear disclosure wherever they appear.

**Tech Stack:** Django management commands, Django TestCase, JSON locale dictionaries, existing React product pages, original catalog image assets, frontend test/build tooling.

---

## File Map

- Modify `backend/apps/products/management/commands/seed_lingye_catalog.py`: add 20 T-slot profiles/accessories and 6 window/door system types; preserve the five categories, all 20 existing entries, idempotency, and existing asset-copy behavior. Resolve stable slug-keyed locale content to the Product IDs in the active database.
- Create 26 original image assets under `backend/catalog_assets/`: one per new product. Assets are illustrative catalog visuals with no unverified dimensions, compatibility labels, or performance marks.
- Modify `backend/apps/products/tests.py`: replace the 20-entry assumptions and add assertions for category totals, preserved slugs, unique content, image presence, and rerun idempotency.
- Modify `backend/apps/products/test_multilingual_catalog.py`: cover translated API responses for newly seeded products in all nine catalog locales and prove no English fallback.
- Modify `backend/translations/product_{en,zh,es,pt,de,fr,it,ru,hi}.json`: add stable slug-keyed localized source values under `_catalog_by_slug`; retain every pre-existing numeric key and value. The seeder merges resolved-ID keys at runtime.
- Modify `backend/apps/products/tests.py`: direct catalog seeding tests to a temporary translation output directory so tests never rewrite checked-in locale files.
- Modify `frontend/src/pages/ProductDetail.tsx` and its existing tests only if the current detail page does not already visibly communicate the illustrative-image and project-confirmation caveat.

## Locked Product Inventory

Add these 20 T-slot category entries (existing 2020, 3030, 4040, and 4545 remain):

- Profile-series references: 2040, 2060, 3060, 4080, 5050, 6060, 8080, 9090.
- Accessory types: 90-degree external corner bracket, three-way connector, angle bracket, flat joining plate, T-slot nut, T-bolt, anchor fastener set, profile end cap, panel fastener, hinge, leveling foot, caster wheel.

Add these 6 window/door system types (existing custom, curtain-wall, South America, and Africa entries remain):

- Sliding-window system, casement-window system, thermal-break window system, sliding-door system, folding-door system, commercial entrance/shopfront system.

Use stable kebab-case slugs derived from the names. Before implementation, check each proposed slug against the database and `CATALOG`; no existing slug may be changed or reused. Series labels are nominal family references only. Do not state that accessories fit a named slot series unless supplier documentation verifies it.

## Task 1: Add Catalog Contract Tests

**Files:**
- Modify: `backend/apps/products/tests.py`

- [x] **Step 1: Replace the current count-only catalog test with target assertions.** Assert 5 categories, 46 products, 46 primary product images, 24 products under `t-slot-profiles`, and 10 under `windows-doors`. Assert the 20 current slugs—including `south-america-window-door-extrusions` and `africa-window-door-extrusions`—remain present.
- [x] **Step 2: Add inventory and quality assertions.** Assert the 20 new slugs are present, every product has a non-empty distinct features field, all 46 slugs are unique, and every seeded image path exists under temporary `MEDIA_ROOT`.
- [x] **Step 3: Run the focused test to establish the expected failure.** From `backend`, run `python manage.py test apps.products.tests.SeedLingyeCatalogCommandTests -v 2`. Expected: the tests fail because the current seeder creates 20 products and lacks the new slugs.

## Task 2: Add the 20 New Catalog Entries

**Files:**
- Modify: `backend/apps/products/management/commands/seed_lingye_catalog.py`

- [x] **Step 1: Add the 20 T-slot entries and 6 window/door entries to their existing category product lists.** Keep the existing seven-field tuple contract `(name, slug, description, specifications, applications, features, image_name)` and keep all existing tuples unchanged.
- [x] **Step 2: Write buyer-useful, distinct English source copy for each entry.** Explain the application and what the buyer should provide; mark section geometry, alloy, temper, finish, compatibility, availability, and lead time as drawing- or project-confirmed. Avoid unverified load, thermal, safety, certification, stock, and manufacturing claims.
- [x] **Step 3: Make the sourcing-service position explicit in new entries.** Use language such as “LingYe can review sourcing options for the project” and “final section and availability confirmed by quotation”; do not describe LingYe as the factory or manufacturer.
- [x] **Step 4: Rerun the focused catalog tests.** Expected: counts, slug preservation, per-product content uniqueness, image paths, and two consecutive idempotent runs pass.

## Task 3: Create Original Illustrative Assets

**Files:**
- Create: 20 distinct image files under `backend/catalog_assets/`, using the exact filenames referenced by the new seeder tuples.
- Modify: `backend/apps/products/management/commands/seed_lingye_catalog.py` only if final image filenames need to be corrected.

- [x] **Step 1: Produce 26 original images in a consistent neutral catalog style.** Create one asset per added product; do not use, trace, crop, or lightly edit Aluslink imagery. Do not render dimensions, series compatibility, logos, certificates, watermarks, or performance values that have not been verified.
- [x] **Step 2: Use the existing asset format convention.** Keep raster assets in supported web formats (`.webp` or `.jpg`) and make each image legible in the current product-card and detail-page aspect ratios.
- [x] **Step 3: Add visible disclosure to the product detail presentation.** Confirm `ProductDetail.tsx` displays a translated notice equivalent to “Illustrative reference only. Final section and compatibility are confirmed against project drawings.” If it does not, add one localized UI string per locale and render it near the product image. Do not rely on alt text alone.
- [x] **Step 4: Validate assets.** Add/extend a test that opens each image with Pillow and asserts it decodes, has non-zero dimensions, and is not a 1x1 placeholder. Manually inspect a contact sheet and the 20 images at product-card scale; revise any image that implies unsupported precision.

## Task 4: Add Nine-Locale Product Translations

**Files:**
- Modify: `backend/apps/products/management/commands/seed_lingye_catalog.py`
- Modify: `backend/translations/product_en.json`
- Modify: `backend/translations/product_zh.json`
- Modify: `backend/translations/product_es.json`
- Modify: `backend/translations/product_pt.json`
- Modify: `backend/translations/product_de.json`
- Modify: `backend/translations/product_fr.json`
- Modify: `backend/translations/product_it.json`
- Modify: `backend/translations/product_ru.json`
- Modify: `backend/translations/product_hi.json`
- Test: `backend/apps/products/test_multilingual_catalog.py`

- [x] **Step 1: Add stable slug-keyed translations to the existing nine product locale JSON files.** Under `_catalog_by_slug`, add all 26 new slugs and localized values for `name`, `description`, `features`, `applications`, `specifications`, `range_param`, `type_param`, `surface_treatment`, `colors`, `grade`, and `temper` in `en`, `zh`, `es`, `pt`, `de`, `fr`, `it`, `ru`, and `hi`. Preserve existing numeric-ID keys. Localize the disclosure and project-specific caveats naturally; keep series codes, alloy identifiers, and temper codes unchanged.
- [x] **Step 2: Resolve each slug to the saved Product ID when seeding locale files.** Add a `--translations-dir` command option defaulting to `settings.BASE_DIR / 'translations'`. Read stable source maps from the checked-in locale files, then merge numeric keys such as `name_<id>`, `description_<id>`, `range_param_<id>`, and `temper_<id>` into the output locale files. Never replace unrelated translations. Preserve `_catalog_by_slug` so the source remains portable when database IDs differ. Tests must pass a temporary output directory.
- [x] **Step 3: Add multilingual API regression coverage.** Seed in a temporary media and translation-output directory, point `translation_service.translations_dir` at that temporary directory, and request representative series, accessory, and window/door products in all nine locales. Assert all eleven `translated_*` fields are non-empty and do not fall back to English for non-English locales; assert every new slug has all eleven localized source fields in each locale file.
- [x] **Step 4: Run focused tests.** From `backend`, run `python manage.py test apps.products.tests.SeedLingyeCatalogCommandTests apps.products.test_multilingual_catalog -v 2`. Expected: catalog counts, rerun behavior, stable-ID translation merge, and all nine locale API assertions pass.
- [x] **Step 5: Review translations for technical restraint.** Verify translations preserve “nominal/reference” wording and project-confirmation caveats; no translation introduces dimensions, fit, availability, or performance guarantees absent from English.

## Task 5: Verify Frontend Presentation

**Files:**
- Modify only when required: `frontend/src/pages/ProductDetail.tsx`
- Modify only when required: `frontend/src/pages/ProductDetail.test.tsx`
- Modify only when required: frontend locale resources used by the product detail page.

- [x] **Step 1: Run existing product detail and listing tests.** From `frontend`, run `npm test -- --run src/pages/ProductDetail.test.tsx src/pages/Products.test.tsx`. Expected: existing product display behavior remains green.
- [x] **Step 2: Add a focused rendering test for the illustrative-image notice if Task 3 changed the UI.** Verify that the notice appears in the selected locale and remains adjacent to the product visual without obscuring it.
- [x] **Step 3: Run the production build.** From `frontend`, run `npm run build`. Expected: build exits successfully with no TypeScript or bundler errors.
- [ ] **Step 4: Inspect representative pages at desktop and mobile widths.** Verify a T-slot series, an accessory, a new window/door system, and the preserved South America/Africa routes. Confirm titles and copy fit, images render, and no invented compatibility is presented.

## Task 6: Final Regression and Change Review

**Files:** all files above.

- [x] **Step 1: Run the backend product suite.** From `backend`, run `python manage.py test apps.products -v 2`. Expected: all product tests pass.
- [x] **Step 2: Run translation JSON validation.** Parse each of the nine `product_*.json` files and assert each of the 26 new slugs has all eleven localized fields; ensure all pre-existing keys remain.
- [ ] **Step 3: Review the final diff.** Confirm only the catalog seeder, intended catalog assets, product tests, locale dictionaries, any necessary detail-page disclosure, and this plan/spec are affected. Confirm no competitor assets or copy entered the repository.
- [x] **Step 4: Report completion without deploying.** Provide the 24/10 category totals, locale coverage, test/build outcomes, and note that online deployment remains separate and requires a follow-up request.

## Execution Notes

- No database migration is expected; the existing Product and ProductImage fields support the expansion.
- Do not commit unrelated pre-existing workspace changes. If commits are requested later, stage only files from this plan.
- The catalog count and image disclosures must be checked against the saved design spec at `docs/superpowers/specs/2026-10-06-product-catalog-expansion-design.md` before considering the work complete.
- Online deployment is explicitly outside this plan.
