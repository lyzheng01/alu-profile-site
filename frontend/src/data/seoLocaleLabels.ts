const labels = {
  en: { home: 'Home', products: 'Products' },
  zh: { home: '首页', products: '产品' },
  es: { home: 'Inicio', products: 'Productos' },
  pt: { home: 'Início', products: 'Produtos' },
} as const;

export const getSeoLocaleLabels = (language: string) => labels[language as keyof typeof labels] || labels.en;
