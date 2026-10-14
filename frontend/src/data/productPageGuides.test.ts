import { getProductPageGuide } from './productPageGuides';

const slugs = [
  'glass-door-frame-profiles',
  'wardrobe-aluminium-profiles',
  'aluminium-heat-sink-profiles',
];
const languages = ['en', 'zh', 'es', 'pt'];

test.each(slugs.flatMap(slug => languages.map(language => [slug, language]))) (
  'provides useful localized description and application guidance for %s (%s)',
  (slug, language) => {
    const guide = getProductPageGuide(slug, language);

    expect(guide?.description).toBeTruthy();
    expect(guide?.applications).toBeTruthy();
    const descriptionLength = language === 'zh' ? guide!.description.length : guide!.description.split(/\s+/).length;
    const applicationsLength = language === 'zh' ? guide!.applications.length : guide!.applications.split(/\s+/).length;
    expect(descriptionLength).toBeGreaterThan(language === 'zh' ? 100 : 45);
    expect(applicationsLength).toBeGreaterThan(language === 'zh' ? 100 : 35);
  }
);

test('does not apply product guidance to unrelated product pages', () => {
  expect(getProductPageGuide('commercial-entrance-shopfront-system', 'en')).toBeNull();
});
