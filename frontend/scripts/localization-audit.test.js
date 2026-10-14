const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const translationsDir = path.join(__dirname, '..', '..', 'backend', 'translations');
const sourceDir = path.join(__dirname, '..', 'src');
const publishedIds = Array.from({ length: 46 }, (_, index) => index + 1);
const fields = ['name', 'description', 'features', 'applications', 'specifications', 'range_param', 'type_param', 'surface_treatment', 'colors', 'grade', 'temper'];
const invalid = /(?:producto original|caracter[ií]sticas originales|aplicaciones originales|original do produto|recursos originais|aplicativos originais|project-specific; confirm|to be confirmed by project|confirm by drawing|framing section for|profile section and panel fit|extrusion section and machining)/i;

test('published Chinese, Spanish, and Portuguese products have complete localized fields', () => {
  for (const locale of ['zh', 'es', 'pt']) {
    const data = JSON.parse(fs.readFileSync(path.join(translationsDir, `product_${locale}.json`), 'utf8'));
    for (const id of publishedIds) {
      for (const field of fields) {
        const value = data[`${field}_${id}`];
        assert.equal(typeof value, 'string', `${locale} product ${id} is missing ${field}`);
        assert.ok(value.trim(), `${locale} product ${id} has empty ${field}`);
        assert.doesNotMatch(value, invalid, `${locale} product ${id} has fallback/placeholder ${field}`);
      }
    }
  }
});

test('products with stable slugs use their matching localized catalog copy', () => {
  const slugIds = {
    '2040-t-slot-aluminium-profile': 21,
    '2060-t-slot-aluminium-profile': 22,
    '3060-t-slot-aluminium-profile': 23,
    '4080-t-slot-aluminium-profile': 24,
    '5050-t-slot-aluminium-profile': 25,
    '6060-t-slot-aluminium-profile': 26,
    '8080-t-slot-aluminium-profile': 27,
    '9090-t-slot-aluminium-profile': 28,
    '90-degree-external-corner-bracket': 29,
    'three-way-connector': 30,
    'angle-bracket': 31,
    'flat-joining-plate': 32,
    't-slot-nut': 33,
    't-bolt': 34,
    'anchor-fastener-set': 35,
    'profile-end-cap': 36,
    'panel-fastener': 37,
    hinge: 38,
    'leveling-foot': 39,
    'caster-wheel': 40,
    'sliding-window-system': 41,
    'casement-window-system': 42,
    'thermal-break-window-system': 43,
    'sliding-door-system': 44,
    'folding-door-system': 45,
    'commercial-entrance-shopfront-system': 46,
  };
  for (const locale of ['zh', 'es', 'pt']) {
    const data = JSON.parse(fs.readFileSync(path.join(translationsDir, `product_${locale}.json`), 'utf8'));
    for (const [slug, id] of Object.entries(slugIds)) {
      for (const field of fields) {
        assert.equal(data[`${field}_${id}`], data._catalog_by_slug?.[slug]?.[field], `${locale} ${slug} maps the wrong ${field} to product ${id}`);
      }
    }
  }
});

test('legacy product IDs 13 to 20 retain their correct localized identity', () => {
  const expected = {
    zh: ['定制门窗铝型材', '幕墙铝型材', '南美门窗铝型材', '非洲门窗铝型材', '铝制U型槽', '铝制H型材', '铝制方管', '铝制扁条'],
    es: ['Perfiles de aluminio a medida para ventanas y puertas', 'Perfiles de aluminio para muro cortina', 'Perfiles para ventanas y puertas en Sudamérica', 'Perfiles para ventanas y puertas en África', 'Canal U de aluminio', 'Perfil H de aluminio', 'Tubo cuadrado de aluminio', 'Barra plana de aluminio'],
    pt: ['Perfis de alumínio extrudado sob medida para janelas e portas', 'Perfis de alumínio para fachadas-cortina', 'Perfis para janelas e portas na América do Sul', 'Perfis para janelas e portas em mercados africanos', 'Perfil U de alumínio', 'Perfil H de alumínio', 'Tubo quadrado de alumínio', 'Barra chata de alumínio'],
  };
  for (const locale of ['zh', 'es', 'pt']) {
    const data = JSON.parse(fs.readFileSync(path.join(translationsDir, `product_${locale}.json`), 'utf8'));
    for (let id = 13; id <= 20; id += 1) {
      assert.equal(data[`name_${id}`], expected[locale][id - 13], `${locale} product ${id} name is incorrect`);
    }
  }
});

test('published category translations match the five live category IDs', () => {
  const expectedNames = {
    zh: [
      '柜体与衣柜铝型材',
      '工业铝型材',
      'T型槽框架铝型材',
      '门窗铝型材',
      '标准铝型材',
    ],
    es: [
      'Perfiles de aluminio para muebles y armarios',
      'Perfiles industriales de aluminio',
      'Perfiles estructurales con ranura en T',
      'Perfiles de aluminio para ventanas y puertas',
      'Perfiles estándar de aluminio',
    ],
    pt: [
      'Perfis de alumínio para móveis e armários',
      'Perfis industriais de alumínio',
      'Perfis estruturais com ranhura em T',
      'Perfis de alumínio para janelas e portas',
      'Perfis padrão de alumínio',
    ],
  };
  for (const locale of ['zh', 'es', 'pt']) {
    const data = JSON.parse(fs.readFileSync(path.join(translationsDir, `category_${locale}.json`), 'utf8'));
    for (let id = 1; id <= 5; id += 1) {
      assert.equal(data[`name_${id}`], expectedNames[locale][id - 1], `${locale} category ${id} is mapped to the wrong label`);
      assert.ok(data[`description_${id}`]?.trim(), `${locale} category ${id} is missing its description`);
    }
  }
});

test('all non-English frontend dictionaries cover all English UI keys', () => {
  const english = JSON.parse(fs.readFileSync(path.join(translationsDir, 'frontend_en.json'), 'utf8'));
  const sourceFiles = [];
  const collectSourceFiles = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const filePath = path.join(directory, entry.name);
      if (entry.isDirectory()) collectSourceFiles(filePath);
      else if (/\.(tsx?|jsx?)$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name)) sourceFiles.push(filePath);
    }
  };
  collectSourceFiles(sourceDir);

  const usedKeys = new Set();
  for (const filePath of sourceFiles) {
    const source = fs.readFileSync(filePath, 'utf8');
    for (const match of source.matchAll(/\bt\(\s*['"]([^'"]+)['"]/g)) usedKeys.add(match[1]);
  }
  const missingEnglishKeys = [...usedKeys].filter((key) => typeof english[key] !== 'string');
  assert.deepEqual(missingEnglishKeys, [], 'English UI dictionary is missing source translation keys');

  for (const locale of ['zh', 'es', 'pt']) {
    const data = JSON.parse(fs.readFileSync(path.join(translationsDir, `frontend_${locale}.json`), 'utf8'));
    for (const key of Object.keys(english)) {
      assert.equal(typeof data[key], 'string', `${locale} is missing UI key ${key}`);
      assert.ok(data[key].trim(), `${locale} UI key ${key} is empty`);
    }
  }
});

test('factory showcase copy does not claim LingYe owns manufacturing facilities', () => {
  const disallowedClaims = {
    en: /our factory|our production line|our manufacturing facilities|advanced manufacturing facilities/i,
    zh: /我们的工厂|自有工厂|拥有最先进的生产设施/,
    es: /nuestra fábrica|nuestras instalaciones de fabricación|capacidades de fabricación/i,
    pt: /nossa fábrica|nossas instalações de fabricação|capacidades de fabricação/i,
  };
  for (const locale of Object.keys(disallowedClaims)) {
    const data = JSON.parse(fs.readFileSync(path.join(translationsDir, `frontend_${locale}.json`), 'utf8'));
    for (const key of ['factory_showcase', 'factory_subtitle', 'home_factory_production_line', 'home_production_equipment_desc', 'slide_3_subtitle']) {
      assert.doesNotMatch(data[key] || '', disallowedClaims[locale], `${locale} ${key} overstates LingYe's manufacturing ownership`);
    }
  }
});

test('all published Chinese, Spanish, and Portuguese articles have localized body and SEO copy', () => {
  for (const locale of ['zh', 'es', 'pt']) {
    const data = JSON.parse(fs.readFileSync(path.join(translationsDir, `article_${locale}.json`), 'utf8'));
    for (let id = 1; id <= 17; id += 1) {
      for (const field of ['title', 'excerpt', 'content', 'meta_title', 'meta_description']) {
        const value = data[`${field}_${id}`];
        assert.equal(typeof value, 'string', `${locale} article ${id} is missing ${field}`);
        assert.ok(value.trim(), `${locale} article ${id} has empty ${field}`);
      }
    }
    for (let id = 1; id <= 15; id += 1) {
      assert.ok(data[`tag_${id}`]?.trim(), `${locale} tag ${id} is missing a translation`);
    }
  }
});
