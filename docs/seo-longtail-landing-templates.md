# SEO Round 6 - Long-tail Landing Page Templates (EN)

Use these templates for dedicated landing pages or article-style commercial pages.

## 1) aluminum-profile-supplier-for-construction-projects
- URL slug: `/en/aluminum-profile-supplier-for-construction-projects`
- Title: `Aluminum Profile Supplier for Construction Projects | LingYe Aluminum`
- H1: `Aluminum Profile Supplier for Construction Projects`
- Meta description: `Reliable aluminum profile supplier for construction projects. Custom extrusion, stable quality, and global B2B delivery from LingYe Aluminum.`
- Core intent: Commercial / supplier selection
- JSON-LD type: `Product` + `FAQPage`

## 2) industrial-aluminum-extrusion-manufacturer-in-china
- URL slug: `/en/industrial-aluminum-extrusion-manufacturer-in-china`
- Title: `Industrial Aluminum Extrusion Manufacturer in China | LingYe Aluminum`
- H1: `Industrial Aluminum Extrusion Manufacturer in China`
- Meta description: `China-based industrial aluminum extrusion manufacturer with OEM support, precision processing, and export-ready production.`
- Core intent: Commercial / factory sourcing
- JSON-LD type: `Product` + `BreadcrumbList`

## 3) custom-aluminum-profile-factory-for-oem-orders
- URL slug: `/en/custom-aluminum-profile-factory-for-oem-orders`
- Title: `Custom Aluminum Profile Factory for OEM Orders | LingYe Aluminum`
- H1: `Custom Aluminum Profile Factory for OEM Orders`
- Meta description: `Custom aluminum profile factory for OEM/ODM projects. Send drawings and get fast feedback on tooling, finish, and lead time.`
- Core intent: Commercial / OEM inquiry
- JSON-LD type: `Service` + `FAQPage`

## 4) aluminum-tile-trim-supplier-for-wholesale-buyers
- URL slug: `/en/aluminum-tile-trim-supplier-for-wholesale-buyers`
- Title: `Aluminum Tile Trim Supplier for Wholesale Buyers | LingYe Aluminum`
- H1: `Aluminum Tile Trim Supplier for Wholesale Buyers`
- Meta description: `Source aluminum tile trims in bulk with stable finish quality and flexible packaging for distributors and project buyers.`
- Core intent: Transactional / wholesale
- JSON-LD type: `Product` + `OfferCatalog`

## 5) door-and-window-aluminum-profile-manufacturer
- URL slug: `/en/door-and-window-aluminum-profile-manufacturer`
- Title: `Door and Window Aluminum Profile Manufacturer | LingYe Aluminum`
- H1: `Door and Window Aluminum Profile Manufacturer`
- Meta description: `Door and window aluminum profile manufacturer offering durable sections, multiple finishes, and consistent export quality.`
- Core intent: Commercial / product sourcing
- JSON-LD type: `Product` + `BreadcrumbList`

## 6) anodized-aluminum-profile-supplier-with-fast-delivery
- URL slug: `/en/anodized-aluminum-profile-supplier-with-fast-delivery`
- Title: `Anodized Aluminum Profile Supplier with Fast Delivery | LingYe Aluminum`
- H1: `Anodized Aluminum Profile Supplier with Fast Delivery`
- Meta description: `Anodized aluminum profile supplier with controlled color consistency, corrosion resistance, and dependable lead times.`
- Core intent: Commercial / urgency
- JSON-LD type: `Product` + `FAQPage`

## 7) powder-coated-aluminum-extrusion-supplier
- URL slug: `/en/powder-coated-aluminum-extrusion-supplier`
- Title: `Powder Coated Aluminum Extrusion Supplier | LingYe Aluminum`
- H1: `Powder Coated Aluminum Extrusion Supplier`
- Meta description: `Powder coated aluminum extrusion supplier for architectural and industrial applications with custom colors and stable adhesion.`
- Core intent: Transactional / finish-specific
- JSON-LD type: `Product`

## 8) 6063-t5-aluminum-profile-manufacturer
- URL slug: `/en/6063-t5-aluminum-profile-manufacturer`
- Title: `6063 T5 Aluminum Profile Manufacturer | LingYe Aluminum`
- H1: `6063 T5 Aluminum Profile Manufacturer`
- Meta description: `6063 T5 aluminum profile manufacturer with customized extrusion dimensions, surface treatments, and export support.`
- Core intent: Specification-specific
- JSON-LD type: `Product` + `TechnicalArticle`

## 9) architectural-aluminum-section-supplier
- URL slug: `/en/architectural-aluminum-section-supplier`
- Title: `Architectural Aluminum Section Supplier | LingYe Aluminum`
- H1: `Architectural Aluminum Section Supplier`
- Meta description: `Architectural aluminum section supplier for facade, partition, and decoration projects. Custom profiles and stable production capacity.`
- Core intent: Commercial / project procurement
- JSON-LD type: `Product` + `BreadcrumbList`

## 10) aluminum-skirting-profile-manufacturer
- URL slug: `/en/aluminum-skirting-profile-manufacturer`
- Title: `Aluminum Skirting Profile Manufacturer | LingYe Aluminum`
- H1: `Aluminum Skirting Profile Manufacturer`
- Meta description: `Aluminum skirting profile manufacturer for modern interior projects, with clean finish options and wholesale supply support.`
- Core intent: Transactional / niche product
- JSON-LD type: `Product` + `FAQPage`

---

## Recommended Page Skeleton (Reusable)

1. Hero section: clear value proposition + supplier trust points
2. Product/solution overview (application scenarios)
3. Technical options (alloy, temper, finishes, tolerance)
4. Factory and QC proof (images, process, certifications)
5. FAQ block (4-6 commercial questions)
6. CTA block (RFQ form + WhatsApp/email)

## Reusable JSON-LD Snippet (Template)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{{H1}}",
  "brand": { "@type": "Brand", "name": "LingYe Aluminum" },
  "manufacturer": { "@type": "Organization", "name": "LingYe Aluminum" },
  "description": "{{META_DESCRIPTION}}",
  "url": "https://lingyealu.cn{{SLUG}}"
}
```
