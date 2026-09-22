import json
import tempfile
from pathlib import Path
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
