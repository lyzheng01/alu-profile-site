# Public Factory Showcase Design

## Goal

Add one reusable factory-image module to the homepage and product-related experience so visitors can see LingYe's manufacturing context from the home, catalog, showcase, or a product detail page.

## Scope

- Render the same shared module on `/products`, `/products/:productSlug`, and `/products/windows-doors/showcase` for every supported language.
- Render it on the homepage after featured products and before profile finish references, so the content flow moves from product discovery to manufacturing proof and then product detail references.
- On product routes, place it after the page's primary product content and before its final contact/conversion area where one exists; otherwise place it before the footer.
- Keep product-specific `factory_images` on product details intact. The shared module is supplementary and must not replace data-backed galleries.
- Use local, approved, clean imagery only. Exclude video frames with TÜV Rheinland branding, dates, or third-party signage. Do not use the generatively reconstructed inspector image as documentary factory evidence.
- Localize module headings, supporting copy, and image alt text through the existing translation mechanism.

## Implementation Shape

- Create a focused shared React component for the factory showcase, using the existing site's spacing, image, and translation conventions.
- Use the reviewed local factory images `factory-extrusion-lines.webp` and `factory-crane-clean.webp` already in the site's public image directory. Preserve aspect ratios and provide stable image containers to avoid layout shifts.
- Add the component to the three product page templates and the homepage, not to unrelated pages such as About or News.

## Verification

- Add component and page integration tests proving the module appears on the homepage and all three product route templates and uses only the approved local assets.
- Run the targeted frontend tests and production build.
- Inspect the affected pages at desktop and mobile sizes before deployment; deploy only after the rendered module is verified.

## Alternatives Considered

1. Add the module only to the product catalog. This is smaller but misses visitors entering through search links to detail pages.
2. Continue relying only on the per-product database galleries. This leaves pages without configured gallery data with no consistent factory context.
3. Use one shared module across the homepage and all product routes. Recommended because it gives visitors consistent manufacturing context from the first visit through product evaluation while preserving product-specific galleries.
