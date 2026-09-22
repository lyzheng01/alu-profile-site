import json
import tempfile
from pathlib import Path
from unittest import mock

from django.test import TestCase
from rest_framework.test import APIClient

from .models import Category, Product
from .services import translation_service


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
