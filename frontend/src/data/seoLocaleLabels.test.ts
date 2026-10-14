import { getSeoLocaleLabels } from './seoLocaleLabels';

test.each([
  ['en', 'Home', 'Products'],
  ['zh', '首页', '产品'],
  ['es', 'Inicio', 'Productos'],
  ['pt', 'Início', 'Produtos'],
])('provides localized structured-navigation labels for %s', (language, home, products) => {
  expect(getSeoLocaleLabels(language)).toEqual({ home, products });
});
