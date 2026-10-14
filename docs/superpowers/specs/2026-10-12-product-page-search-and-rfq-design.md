# Product Page Search and RFQ Design

## Goal

Maintain the product catalog as four localized entry experiences in English, Chinese, Spanish, and Portuguese. Category pages, product details, and the window-and-door showcase should use natural local industry terms, language-specific metadata and internal links, stable URLs, and correctly corresponding language annotations.

## Scope

- Add stable localized routes for all five product categories at `/{lang}/products/category/{categorySlug}`, linked from the catalog and category cards.
- Give each category route localized title, meta description, canonical URL, and category-specific buyer guidance; retain the existing detailed windows-and-doors guide.
- Localize product-detail and showcase metadata and structured breadcrumbs, using the translated product facts returned by the API and never inventing missing specifications.
- Ensure the corresponding language routes for a product/category expose reciprocal `hreflang` annotations and remain directly addressable and discoverable through sitemap/prerender output.
- Add a concise selection matrix and RFQ checklist that distinguish project-dependent decisions from confirmed catalog information.
- Include all category routes in sitemap generation and static prerendering for all four public languages.
- Remove misleading product-detail fallbacks that imply every product uses 6061/6063 or describe an unrelated tile-trim product when data is missing.
- Preserve existing product URLs, query-filter behavior, all in-progress catalog records, and the truthful sourcing-partner positioning.

## Content Rules

- Guidance must help buyers check system series, mating sections and hardware, glazing/performance evidence, finish requirements, and quotation scope.
- Do not invent dimensions, standards compliance, performance, stock, lead time, factory capacity, or universal compatibility.
- Keep the four locales professionally localized; technical abbreviations may remain where they are standard.
- Use factual buyer guidance and checklists on the category page; do not create generic filler articles or competitor-derived copy.

## Verification

- Frontend tests verify category routes, localized page content/metadata/breadcrumbs, product listing, and accurate omission of unspecified product parameters.
- SEO tests verify reciprocal `hreflang`/canonical markup and all localized category URLs in sitemap and prerender output.
- Run focused tests and a production build/prerender; inspect generated HTML and the working tree to ensure existing uncommitted work remains intact.

## Deferred

- Publish additional independent deep-dive articles or downloadable RFQ tools only where user evidence and topic research support them.
- Deployment is not included in this change.
