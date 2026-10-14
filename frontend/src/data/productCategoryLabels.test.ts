import { getProductCategoryGuide, getProductCategoryLabel } from './productCategoryGuides';

test.each([
  ['cabinet-profiles', 'en', 'Cabinet & Wardrobe'],
  ['industrial-profiles', 'zh', '工业型材'],
  ['t-slot-profiles', 'es', 'Estructuras T-slot'],
  ['windows-doors', 'pt', 'Janelas e portas'],
  ['standard-aluminium-profiles', 'pt', 'Perfis padrão'],
])('returns a reviewed %s label in %s', (slug, language, label) => {
  expect(getProductCategoryLabel(slug, language)).toBe(label);
});

test('uses concise and distinct English SEO titles for industrial and window categories', () => {
  const industrial = getProductCategoryGuide('industrial-profiles', 'en');
  const windows = getProductCategoryGuide('windows-doors', 'en');

  expect(industrial?.metaTitle).toBe('Industrial Aluminum Profiles for Equipment | LingYe');
  expect(windows?.metaTitle).toBe('Window & Door Aluminum Profiles | LingYe');
  expect(industrial?.metaTitle).not.toBe(windows?.metaTitle);
});
