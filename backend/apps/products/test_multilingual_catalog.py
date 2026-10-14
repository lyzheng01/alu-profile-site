import json
import tempfile
from pathlib import Path
from unittest import mock

from django.test import TestCase, override_settings
from django.core.management import call_command
from rest_framework.test import APIClient

from .models import Category, Product
from .services import translation_service


PRODUCT_LOCALES = ('en', 'zh', 'es', 'pt', 'de', 'fr', 'it', 'ru', 'hi')
CATALOG_FIELDS = (
    'name', 'description', 'features', 'applications', 'specifications',
    'range_param', 'type_param', 'surface_treatment', 'colors', 'grade', 'temper',
)
REPRESENTATIVE_SLUGS = (
    '2040-t-slot-aluminium-profile',
    't-slot-nut',
    'sliding-door-system',
)


class MultilingualCatalogApiTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.translation_patcher = mock.patch(
            'apps.products.signals.translation_service.auto_translate_on_save',
            autospec=True,
        )
        cls.translation_patcher.start()

    @classmethod
    def tearDownClass(cls):
        cls.translation_patcher.stop()
        super().tearDownClass()

    def setUp(self):
        self.client = APIClient()
        self.temp_dir = tempfile.TemporaryDirectory()
        self.previous_translations_dir = translation_service.translations_dir
        translation_service.translations_dir = Path(self.temp_dir.name)
        (Path(self.temp_dir.name) / 'category_zh.json').write_text(
            json.dumps({'name_1': '工业型材', 'description_1': '工业应用型材'}),
            encoding='utf-8',
        )
        (Path(self.temp_dir.name) / 'product_zh.json').write_text(
            json.dumps({
                'name_1': '4040工业铝型材',
                'description_1': '用于工业框架的铝型材',
                'features_1': '高强度结构',
                'applications_1': '设备框架',
            }),
            encoding='utf-8',
        )
        self.category = Category.objects.create(
            name='Industrial Profiles',
            description='Industrial profile range',
            slug='industrial-profiles',
        )
        self.product = Product.objects.create(
            category=self.category,
            name='4040 Industrial Aluminum Profile',
            description='Aluminum profile for industrial frames',
            features='High strength structure',
            applications='Equipment frames',
            specifications='6063-T5',
            slug='4040-industrial-aluminum-profile',
        )

    def tearDown(self):
        translation_service.translations_dir = self.previous_translations_dir
        self.temp_dir.cleanup()

    def test_chinese_catalog_uses_record_translations_for_category_and_product(self):
        category_response = self.client.get('/api/categories/?lang=zh')
        product_response = self.client.get('/api/products/?lang=zh')

        self.assertEqual(category_response.status_code, 200)
        self.assertEqual(product_response.status_code, 200)
        category = category_response.json().get('results', category_response.json())[0]
        product = product_response.json().get('results', product_response.json())[0]
        self.assertEqual(category['translated_name'], '工业型材')
        self.assertEqual(category['translated_description'], '工业应用型材')
        self.assertEqual(product['translated_name'], '4040工业铝型材')
        self.assertEqual(product['translated_description'], '用于工业框架的铝型材')
        self.assertEqual(product['translated_features'], '高强度结构')
        self.assertEqual(product['translated_applications'], '设备框架')


class SeededCatalogTranslationsTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.translation_patcher = mock.patch(
            'apps.products.signals.translation_service.auto_translate_on_save',
            autospec=True,
        )
        cls.translation_patcher.start()

    @classmethod
    def tearDownClass(cls):
        cls.translation_patcher.stop()
        super().tearDownClass()

    def setUp(self):
        self.client = APIClient()
        self.temp_dir = tempfile.TemporaryDirectory()
        self.output_dir = Path(self.temp_dir.name) / 'output'
        self.output_dir.mkdir()
        self.previous_translations_dir = translation_service.translations_dir
        self.media_dir = Path(self.temp_dir.name) / 'media'
        self.media_dir.mkdir()
        self.addCleanup(self._restore_translation_service)

    def _restore_translation_service(self):
        translation_service.translations_dir = self.previous_translations_dir
        self.temp_dir.cleanup()

    def seed(self):
        with override_settings(MEDIA_ROOT=self.media_dir):
            call_command('seed_lingye_catalog', translations_dir=str(self.output_dir), verbosity=0)

    def test_source_locale_files_cover_all_new_slugs_and_eleven_fields(self):
        backend_root = Path(__file__).resolve().parents[2]
        expected_slugs = {
            '2040-t-slot-aluminium-profile', '2060-t-slot-aluminium-profile',
            '3060-t-slot-aluminium-profile', '4080-t-slot-aluminium-profile',
            '5050-t-slot-aluminium-profile', '6060-t-slot-aluminium-profile',
            '8080-t-slot-aluminium-profile', '9090-t-slot-aluminium-profile',
            '90-degree-external-corner-bracket', 'three-way-connector',
            'angle-bracket', 'flat-joining-plate', 't-slot-nut', 't-bolt',
            'anchor-fastener-set', 'profile-end-cap', 'panel-fastener', 'hinge',
            'leveling-foot', 'caster-wheel', 'sliding-window-system',
            'casement-window-system', 'thermal-break-window-system',
            'sliding-door-system', 'folding-door-system',
            'commercial-entrance-shopfront-system',
        }
        for locale in PRODUCT_LOCALES:
            with self.subTest(locale=locale):
                data = json.loads((backend_root / 'translations' / f'product_{locale}.json').read_text(encoding='utf-8'))
                catalog = data['_catalog_by_slug']
                self.assertEqual(set(catalog), expected_slugs)
                for slug in expected_slugs:
                    self.assertEqual(set(catalog[slug]), set(CATALOG_FIELDS), f'{locale}/{slug}')
                    self.assertTrue(all(isinstance(catalog[slug][field], str) and catalog[slug][field].strip() for field in CATALOG_FIELDS), f'{locale}/{slug}')

    def test_spanish_and_portuguese_sources_cover_published_legacy_products_by_slug(self):
        backend_root = Path(__file__).resolve().parents[2]
        published_slugs = {
            'glass-door-frame-profiles', 'wardrobe-aluminium-profiles',
            'gola-handleless-cabinet-profiles', 'wardrobe-handle-profiles',
            'aluminium-heat-sink-profiles', 'custom-cnc-aluminium-profiles',
            'aluminium-enclosure-profiles', 'cnc-machined-aluminium-components',
            '2020-t-slot-aluminium-profile', '3030-t-slot-aluminium-profile',
            '4040-t-slot-aluminium-profile', '4545-t-slot-aluminium-profile',
        }
        invalid_copy = ('original', 'project-specific; confirm', 'to be confirmed by project')
        for locale in ('es', 'pt'):
            with self.subTest(locale=locale):
                source = json.loads((backend_root / 'translations' / f'product_{locale}.json').read_text(encoding='utf-8'))
                catalog = source.get('_catalog_by_slug', {})
                self.assertTrue(published_slugs.issubset(catalog), f'{locale} is missing published slug translations')
                for slug in published_slugs:
                    for field in CATALOG_FIELDS:
                        value = catalog[slug].get(field, '')
                        self.assertTrue(value.strip(), f'{locale}/{slug}/{field} is empty')
                        self.assertFalse(any(marker in value.lower() for marker in invalid_copy), f'{locale}/{slug}/{field} is placeholder text')

    def test_seed_merges_resolved_id_keys_preserves_existing_keys_and_is_idempotent(self):
        backend_root = Path(__file__).resolve().parents[2]
        source = json.loads((backend_root / 'translations' / 'product_zh.json').read_text(encoding='utf-8'))
        (self.output_dir / 'product_zh.json').write_text(
            json.dumps({'unrelated_key': 'keep me', 'name_999': 'old value'}), encoding='utf-8'
        )

        self.seed()
        product = Product.objects.get(slug=REPRESENTATIVE_SLUGS[0])
        output = json.loads((self.output_dir / 'product_zh.json').read_text(encoding='utf-8'))
        for field in CATALOG_FIELDS:
            self.assertEqual(output[f'{field}_{product.id}'], source['_catalog_by_slug'][product.slug][field])
        self.assertEqual(output['unrelated_key'], 'keep me')
        self.assertEqual(output['name_999'], 'old value')
        self.assertEqual(output['_catalog_by_slug'], source['_catalog_by_slug'])
        first_run = (self.output_dir / 'product_zh.json').read_bytes()

        self.seed()
        self.assertEqual((self.output_dir / 'product_zh.json').read_bytes(), first_run)
        for locale in PRODUCT_LOCALES:
            self.assertTrue((self.output_dir / f'product_{locale}.json').is_file())

    def test_all_locale_api_fields_are_localized_for_series_accessory_and_door_system(self):
        self.seed()
        translation_service.translations_dir = self.output_dir
        for locale in PRODUCT_LOCALES:
            for slug in REPRESENTATIVE_SLUGS:
                with self.subTest(locale=locale, slug=slug):
                    product = Product.objects.get(slug=slug)
                    response = self.client.get(f'/api/products/{product.id}/?lang={locale}')
                    self.assertEqual(response.status_code, 200)
                    payload = response.json()
                    for field in CATALOG_FIELDS:
                        translated = payload.get(f'translated_{field}', payload.get(field))
                        self.assertIsNotNone(translated, f'{locale}/{slug}/{field}')
                        self.assertTrue(translated.strip(), f'{locale}/{slug}/{field}')
                        if locale != 'en':
                            self.assertNotEqual(translated, getattr(product, field), f'{locale}/{slug}/{field}')
