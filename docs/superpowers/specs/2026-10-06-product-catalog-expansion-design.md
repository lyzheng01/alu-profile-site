# LingYe Product Catalog Expansion Design

## Goal

Expand the displayed T-slot and window/door ranges using Aluslink's catalog breadth as a reference, without copying its text or images and without implying that LingYe owns a factory or holds stock of every listed item.

## Approved Business Position

New entries represent profile types LingYe can help source or customize. Exact section, alloy, temper, finish, accessory compatibility, availability, and lead time are confirmed for each project. Pages must not claim stock, in-house production, factory capacity, certifications, or fixed performance unless independently verified.

## Scope

- Expand T-slot profiles and accessories from 4 to 24 entries by adding 8 distinct profile-series references and 12 accessory types.
- Expand window and door profiles from 4 to 10 entries by adding 6 distinct system/application references. Keep the existing South America and Africa landing entries and current URLs; do not count additional country pages as new system types.
- Keep the other three categories and their existing product records unchanged.
- Preserve all current product slugs. Add new slugs; do not replace or delete existing product pages.
- Localize every new product's title and customer-facing fields in all nine existing product locales: English, Chinese, Spanish, Portuguese, German, French, Italian, Russian, and Hindi.
- Add original visual assets for new entries. Do not download, reuse, trace, or lightly alter Aluslink images or copy its text.

## Catalog Structure

### T-Slot and Accessories

The final category contains 24 entries: the existing four nominal series (2020, 3030, 4040, 4545), eight additional series references selected from common profile families, and twelve distinct accessory types such as brackets, joining plates, T-nuts/bolts, hinges, feet, end caps, and casters. The exact candidate list is finalized during implementation against supplier-facing or user-provided references. No slot dimensions, series compatibility, load ratings, or material condition are invented; those remain drawing- or quotation-confirmed.

### Window and Door

The final category contains 10 entries: the existing four records plus six system/application references chosen to be meaningfully different, such as sliding-window, casement-window, thermal-break, sliding-door, folding-door, and commercial entrance/shopfront systems. Existing regional landing pages remain intact and clearly distinct from system types.

## Image and Content Rules

- Preferred product image: an original photo or drawing supplied by the user or a supplier with permission to publish it.
- If an exact authorized image is unavailable, use a commissioned original illustration or AI-generated conceptual image only with a visible "illustrative reference; final section confirmed by drawing" disclosure. Do not depict precise dimensions or connector interfaces that have not been verified.
- Use a coherent product-catalog visual style, neutral backgrounds, and clear profile silhouettes. Avoid competitor-specific compositions, logos, watermarks, text, or distinctive product-photo crops.
- Each new entry gets distinct, useful copy: intended use, what information buyers should provide, and which details require confirmation. Avoid repeated boilerplate and unsupported technical claims.
- Product/category copy must present LingYe as a sourcing and project-coordination service, not as the manufacturer.

## Implementation Shape

- Extend the existing idempotent `seed_lingye_catalog` command and its catalog assets; do not introduce a second catalog storage mechanism.
- Keep the existing five category records, existing product URLs, admin workflow, and public API shape.
- Update catalog tests to assert 46 total entries, 24 T-slot entries, 10 window/door entries, idempotency, unique slugs/content, existing URL preservation, and asset presence.
- Add complete product translations for all nine locales and verify localized API output does not fall back to English for the new entries.
- No new database fields or schema migration are required. No live deployment is part of this implementation approval; review the finished site and request deployment separately.

## Verification

- Run the focused product catalog tests and multilingual product API tests.
- Run the frontend test suite/build if shared product rendering or localization changes are needed.
- Inspect the product listing and representative detail pages at desktop and mobile widths.
- Verify all image assets render, disclosures are readable, existing product routes remain unchanged, and newly added details do not assert unconfirmed specifications.

## Alternatives Considered

1. Match Aluslink's category counts mechanically with variants and market pages. Rejected because it risks thin duplication and misleading availability claims.
2. Add only a small set of popular products. Rejected because the user approved staged expansion to the competitor-referenced breadth.
3. Expand to 24 T-slot/accessory entries and 10 window/door entries using distinct product types, preserve current regional pages, and clearly mark project-confirmed sourcing. Selected.
