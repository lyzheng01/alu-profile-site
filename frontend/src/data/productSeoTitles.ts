const conciseTitles: Record<string, Record<string, string>> = {
  '2040-t-slot-aluminium-profile': {
    es: 'Perfil de aluminio con ranura en T 20 × 40 mm | LingYe',
    pt: 'Perfil de alumínio com ranhura em T 20 × 40 mm | LingYe',
  },
  '2060-t-slot-aluminium-profile': {
    es: 'Perfil de aluminio con ranura en T 20 × 60 mm | LingYe',
    pt: 'Perfil de alumínio com ranhura em T 20 × 60 mm | LingYe',
  },
};

export const getProductSeoTitle = (slug: string, name: string, language: string): string => (
  conciseTitles[slug]?.[language] || `${name} | LingYe`
);
