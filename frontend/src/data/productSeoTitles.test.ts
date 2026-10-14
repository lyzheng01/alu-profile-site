import { getProductSeoTitle } from './productSeoTitles';

test.each([
  ['2040-t-slot-aluminium-profile', 'es', 'Perfil de aluminio con ranura en T 20 × 40 mm | LingYe'],
  ['2060-t-slot-aluminium-profile', 'pt', 'Perfil de alumínio com ranhura em T 20 × 60 mm | LingYe'],
])('uses concise localized product metadata for %s in %s', (slug, language, expected) => {
  expect(getProductSeoTitle(slug, 'Long product display name', language)).toBe(expected);
});

test('retains the localized product name on other routes and languages', () => {
  expect(getProductSeoTitle('4040-profile', 'Perfil personalizado', 'pt')).toBe('Perfil personalizado | LingYe');
});
