# Site Security Headers and Spanish/Portuguese Localization

## Goal

Harden response headers for the canonical Lingye site and make every currently published Spanish and Portuguese public page render complete, accurate localized content.

## Scope

- Add a conservative security-header baseline to the active Nginx site configuration for HTML, API, admin, static assets, media, and redirects. Preserve the existing HSTS policy. Do not add an enforcing Content-Security-Policy until external scripts, styles, forms, and media origins are inventoried.
- Audit the currently published catalog (20 products, five categories), all published articles (17), public page copy, and page metadata for Spanish and Portuguese.
- Correct translation source files and any serializer/data-mapping defect so API responses use the intended localized fields; deploy only the files/configuration needed for this task.
- Keep the existing uncommitted catalog expansion and unrelated work intact; do not publish the unshipped 46-product catalog as part of this repair.

## Design

Treat server response headers and localization as independent workstreams. For Nginx, ensure locations with their own cache headers also emit the security baseline, account for headers already set by Django, and validate configuration before reload. For localization, use live API records as the current published product inventory, reconcile stable product slugs to translation records, fix invalid legacy ID mappings and English fallbacks, and retain technical values such as alloy/temper identifiers unchanged while translating explanatory labels and guidance.

## Validation

- Unit tests cover translation lookup/mapping and reject placeholder/English fallback values for published Spanish/Portuguese catalog content.
- Audit all 20 live product records, five categories, 17 articles, frontend translation dictionaries, and SEO metadata in both languages.
- Verify representative localized HTML and every localized product/article API response after deployment.
- Verify required headers on HTML, API, static, media, and error/redirect responses; run `nginx -t` before reload and preserve a server-side config backup.

## Risks

- Nginx `add_header` inheritance changes when a location defines its own `add_header`; explicitly cover cache-configured locations.
- Existing backend header middleware can cause duplicate/conflicting values if not reconciled.
- Product translation data is ID-indexed while the newer catalog translations are slug-indexed; use explicit stable slug-to-ID mapping and avoid unrelated catalog publication.
