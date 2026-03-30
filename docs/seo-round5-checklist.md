# SEO Round 5 Checklist (lingyealu.cn)

## 1) Search Console / Bing submission checklist

- Add and verify domain property in Google Search Console: `lingyealu.cn`
- Add and verify site in Bing Webmaster Tools: `https://lingyealu.cn/`
- Submit sitemap URL in both tools:
  - `https://lingyealu.cn/sitemap.xml`
- Request indexing for key pages first:
  - `/en`
  - `/en/products`
  - `/en/news`
  - Top 10 product detail URLs from sitemap
- Monitor 7-day crawl/index report:
  - Coverage errors
  - Duplicate URLs
  - Mobile usability

## 2) Long-tail landing page keyword template (English)

Use these as article or category landing page titles/H1 templates:

- Aluminum profile supplier for construction projects
- Industrial aluminum extrusion manufacturer in China
- Custom aluminum profile factory for OEM orders
- Aluminum tile trim supplier for wholesale buyers
- Door and window aluminum profile manufacturer
- Anodized aluminum profile supplier with fast delivery
- Powder coated aluminum extrusion supplier
- 6063 T5 aluminum profile manufacturer
- Architectural aluminum section supplier
- Aluminum skirting profile manufacturer

## 3) Conversion event tracking now live

Implemented front-end events (GTM/GA compatible):

- `generate_lead`
  - Trigger: inquiry form submit success
  - Fields: `method`, `page_path`, `product_name`
- `contact_click`
  - Trigger: homepage contact button click
  - Fields: `source`, `page_path`

If GTM is present, map these to GA4 events and mark `generate_lead` as a conversion.
