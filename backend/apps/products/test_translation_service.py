import json
import tempfile
from pathlib import Path
from types import SimpleNamespace
from unittest import mock

from django.test import SimpleTestCase

from .services import TranslationService


class FrontendTranslationServiceTests(SimpleTestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.service = TranslationService()
        self.service.translations_dir = Path(self.temp_dir.name)
        (Path(self.temp_dir.name) / 'frontend_en.json').write_text(
            json.dumps({'nav_home': 'Home', 'new_key': 'New label'}),
            encoding='utf-8',
        )
        (Path(self.temp_dir.name) / 'frontend_es.json').write_text(
            json.dumps({'nav_home': 'Inicio'}),
            encoding='utf-8',
        )

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_reading_missing_language_is_read_only_and_returns_source_fallbacks(self):
        with mock.patch.object(self.service, 'translate_frontend_content') as translate:
            content = self.service.get_all_frontend_content('fr')

        self.assertEqual(content, {'nav_home': 'Home', 'new_key': 'New label'})
        translate.assert_not_called()
        self.assertFalse((Path(self.temp_dir.name) / 'frontend_fr.json').exists())

    def test_existing_locale_is_completed_from_english_source_without_writing(self):
        content = self.service.get_all_frontend_content('es')

        self.assertEqual(content, {'nav_home': 'Inicio', 'new_key': 'New label'})
        self.assertEqual(
            json.loads((Path(self.temp_dir.name) / 'frontend_es.json').read_text(encoding='utf-8')),
            {'nav_home': 'Inicio'},
        )

    def test_chinese_translation_uses_google_supported_locale_code(self):
        translator = mock.Mock()
        translator.translate.return_value = '中文结果'
        with mock.patch('apps.products.services.GoogleTranslator', return_value=translator) as factory:
            result = self.service.translate_text('Industrial profile', 'zh')

        self.assertEqual(result, '中文结果')
        factory.assert_called_once_with(source='en', target='zh-CN')

    def test_article_batch_does_not_persist_source_text_as_a_translation(self):
        article = SimpleNamespace(
            id=6,
            title='A profile guide',
            content='<p>Article content</p>',
            excerpt='A short summary',
            meta_title='A profile guide',
            meta_description='A useful description',
            meta_keywords='aluminium profile',
        )
        with mock.patch.object(self.service, 'translate_text', side_effect=lambda text, _lang: text), \
                mock.patch('apps.products.services.time.sleep'):
            translations = self.service.translate_model_batch('article', [article], 'zh')

        self.assertFalse(any(key.endswith('_6') for key in translations))
        self.assertFalse((Path(self.temp_dir.name) / 'article_zh.json').exists())

    def test_article_batch_translates_seo_metadata_in_addition_to_body_fields(self):
        article = SimpleNamespace(
            id=6,
            title='A profile guide',
            content='<p>Article content</p>',
            excerpt='A short summary',
            meta_title='A profile guide',
            meta_description='A useful description',
            meta_keywords='aluminium profile',
        )
        with mock.patch.object(self.service, 'translate_text', side_effect=lambda text, _lang: f'zh:{text}'), \
                mock.patch('apps.products.services.time.sleep'):
            translations = self.service.translate_model_batch('article', [article], 'zh')

        for field in ('title', 'content', 'excerpt', 'meta_title', 'meta_description', 'meta_keywords'):
            self.assertIn(f'{field}_6', translations)

    def test_positioning_copy_is_available_in_all_runtime_locales(self):
        translations_dir = Path(__file__).resolve().parents[2] / 'translations'
        self.service.translations_dir = translations_dir

        for language in ('en', 'zh', 'es', 'pt'):
            with self.subTest(language=language):
                content = self.service.get_all_frontend_content(language)
                self.assertTrue(content['home_hero_precision_title'])
                self.assertTrue(content['home_hero_primary_cta'])
                self.assertTrue(content['factory_showcase'])
                self.assertTrue(content['footer_brand'])
                self.assertNotRegex(
                    content['about_company_intro_content'],
                    r'professional aluminum profile manufacturer|fabricante de perfiles de aluminio|制造商|自有工厂',
                )
