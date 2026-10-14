import tempfile
import re
import json
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from unittest.mock import patch

from django.core.management import call_command
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import Article, AluminumBlogTopic
from apps.products.services import translation_service


class MarkupCounter(HTMLParser):
    def __init__(self, markup):
        super().__init__()
        self.counts = Counter()
        self.feed(markup)

    def handle_starttag(self, tag, attrs):
        if tag in {'figure', 'figcaption', 'img', 'h2', 'h3', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a', 'code'}:
            self.counts[tag] += 1


class SeedLingyeNewsTests(TestCase):
    def test_quote_comparison_article_publishes_complete_localized_cost_guide(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            media_dir = Path(temp_dir) / 'media'
            translations_dir = Path(temp_dir) / 'translations'
            translations_dir.mkdir()
            with override_settings(MEDIA_ROOT=media_dir, TRANSLATIONS_DIR=translations_dir):
                with patch.object(translation_service, 'translations_dir', translations_dir):
                    call_command('publish_aluminum_quote_comparison_guide')

                    article = Article.objects.get(slug='compare-aluminum-extrusion-quotes-landed-cost')
                    self.assertEqual(article.status, 'published')
                    self.assertIn('wall thickness', article.content.lower())
                    self.assertIn('tariff classification', article.content.lower())
                    self.assertEqual(article.content.count('<figure>'), 2)
                    self.assertIn('<table>', article.content)
                    self.assertTrue(Path(media_dir, article.featured_image.name).is_file())
                    source_markup = MarkupCounter(article.content).counts
                    image_root = Path(__file__).resolve().parents[3] / 'frontend' / 'public'
                    for image_path in re.findall(r'<img[^>]+src="(/images/[^\"]+)"', article.content):
                        self.assertTrue((image_root / image_path.lstrip('/')).is_file(), image_path)

                    for language in ('zh', 'es', 'pt'):
                        payload = json.loads((translations_dir / f'article_{language}.json').read_text(encoding='utf-8'))
                        for field in ('title', 'excerpt', 'content', 'meta_title', 'meta_description', 'meta_keywords'):
                            self.assertTrue(payload.get(f'{field}_{article.id}'), f'{language}: {field}')
                        self.assertEqual(MarkupCounter(payload[f'content_{article.id}']).counts, source_markup, language)

    def test_thermal_break_window_rfq_command_publishes_one_reviewable_article(self):
        with tempfile.TemporaryDirectory() as media_dir:
            with override_settings(MEDIA_ROOT=media_dir):
                call_command('publish_thermal_break_window_rfq_guide')

                article = Article.objects.get(slug='thermal-break-window-profile-rfq-guide')
                self.assertEqual(article.status, 'published')
                self.assertEqual(article.title, 'Thermal-Break Aluminium Window Profiles: What Buyers Should Specify Before an RFQ')
                self.assertEqual(article.content.count('<figure>'), 3)
                self.assertIn('https://nfrc.org/certified-product-directory/', article.content)
                self.assertTrue(Path(media_dir, article.featured_image.name).is_file())
                self.assertTrue(article.tags.exists())

    def test_command_publishes_fourteen_articles_with_covers_and_is_idempotent(self):
        with tempfile.TemporaryDirectory() as media_dir:
            with override_settings(MEDIA_ROOT=media_dir):
                call_command('seed_lingye_news')
                call_command('seed_lingye_news')

                articles = Article.objects.filter(status='published')
                self.assertEqual(articles.count(), 14)
                self.assertTrue(all(article.content and article.excerpt for article in articles))
                self.assertTrue(all(article.tags.exists() for article in articles))
                self.assertTrue(all(Path(media_dir, article.featured_image.name).is_file() for article in articles))
                self.assertEqual(AluminumBlogTopic.objects.filter(status='published').count(), 14)

                expected_slugs = {
                    '6061-vs-6063-aluminium-alloy-selection',
                    'aluminium-extrusion-cross-section-die-design-guide',
                    'aluminium-extrusion-process-from-billet-to-profile',
                    'cnc-machined-aluminium-profile-tolerances-inspection',
                    'aluminium-heat-sink-profile-design-guide',
                    'aluminium-solar-mounting-profile-design-checklist',
                    'aluminium-extrusion-die-tooling-ownership-checklist',
                    'aluminium-extrusion-lead-time-planning-guide',
                    'aluminium-profile-export-packaging-checklist',
                }
                self.assertTrue(expected_slugs.issubset(set(articles.values_list('slug', flat=True))))

                new_slugs = {
                    'aluminium-extrusion-die-tooling-ownership-checklist',
                    'aluminium-extrusion-lead-time-planning-guide',
                    'aluminium-profile-export-packaging-checklist',
                }
                for slug in new_slugs:
                    article = articles.get(slug=slug)
                    plain_text = re.sub(r'<[^>]+>', ' ', article.content)
                    self.assertGreaterEqual(len(plain_text.split()), 1000, slug)
                    self.assertGreaterEqual(article.content.count('<img '), 2, slug)
                    self.assertTrue(55 <= len(article.meta_title) <= 65, slug)
                    self.assertTrue(140 <= len(article.meta_description) <= 165, slug)
                    image_root = Path(__file__).resolve().parents[3] / 'frontend' / 'public'
                    for image_path in re.findall(r'<img[^>]+src="(/images/[^\"]+)"', article.content):
                        self.assertTrue((image_root / image_path.lstrip('/')).is_file(), image_path)


class SeedTSlotAccessoryCompatibilityTests(TestCase):
    def test_publish_command_creates_one_reviewable_article_and_is_idempotent(self):
        with tempfile.TemporaryDirectory() as media_dir:
            with override_settings(MEDIA_ROOT=media_dir):
                call_command('publish_t_slot_accessory_compatibility')
                call_command('publish_t_slot_accessory_compatibility')

                article = Article.objects.get(slug='t-slot-profile-accessory-compatibility-guide')
                self.assertEqual(Article.objects.count(), 1)
                self.assertEqual(article.status, 'published')
                self.assertIn('T-Slot Aluminium Profile Compatibility', article.title)
                self.assertIn('/images/article-t-slot-interface-map.svg', article.content)
                self.assertIn('/images/article-t-slot-rfq-checklist.svg', article.content)
                self.assertIn('/en/products/?category=3', article.content)
                self.assertGreaterEqual(len(re.sub(r'<[^>]+>', ' ', article.content).split()), 1000)
                self.assertEqual(article.content.count('<figure>'), 2)
                self.assertTrue(article.tags.exists())
                self.assertTrue(Path(media_dir, article.featured_image.name).is_file())
                source_markup = MarkupCounter(article.content).counts
                image_root = Path(__file__).resolve().parents[3] / 'frontend' / 'public'
                for language in ('zh', 'es', 'pt'):
                    translations = translation_service._load_translations_from_file('article', language)
                    for field in ('title', 'excerpt', 'content', 'meta_title', 'meta_description', 'meta_keywords'):
                        self.assertTrue(translations.get(f'{field}_16'), f'{language}: {field}_16 is missing')
                    localized_content = translations['content_16']
                    localized_markup = MarkupCounter(localized_content).counts
                    self.assertEqual(localized_markup, source_markup, language)
                    localized_text = re.sub(r'<[^>]+>', ' ', localized_content).split()
                    if language == 'zh':
                        self.assertGreaterEqual(len(''.join(localized_text)), 2200)
                    else:
                        self.assertGreaterEqual(len(localized_text), 1000)
                    for image_path in re.findall(r'<img[^>]+src="(/images/[^"]+)"', localized_content):
                        self.assertTrue((image_root / image_path.lstrip('/')).is_file(), image_path)


class ArticleLocalizationTests(TestCase):
    def test_article_detail_lists_only_languages_with_a_full_translation(self):
        article = Article.objects.create(
            id=9999,
            title='Translation availability test',
            slug='translation-availability-test',
            content='<p>English source content.</p>',
            excerpt='Test excerpt.',
            status='published',
        )
        response = APIClient().get(f'/api/articles/by-slug/{article.slug}/?lang=zh')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['available_languages'], ['en'])

    def test_english_article_list_exposes_seo_fields_for_static_metadata(self):
        with tempfile.TemporaryDirectory() as media_dir:
            with override_settings(MEDIA_ROOT=media_dir):
                call_command('seed_lingye_news')
                response = APIClient().get('/api/articles/?lang=en')

                self.assertEqual(response.status_code, 200)
                article = response.data['results'][0]
                for field in ('meta_title', 'meta_description', 'meta_keywords'):
                    self.assertTrue(article[field], f'{field} is missing from the English list API')

    def test_all_published_articles_have_localized_copy_and_seo_fields(self):
        with tempfile.TemporaryDirectory() as media_dir:
            with override_settings(MEDIA_ROOT=media_dir):
                call_command('seed_lingye_news')

                articles = list(Article.objects.filter(status='published').order_by('id'))
                for language in ('zh', 'es', 'pt'):
                    with self.subTest(language=language):
                        for article in articles:
                            for field in (
                                'title', 'excerpt', 'content',
                                'meta_title', 'meta_description', 'meta_keywords',
                            ):
                                localized = translation_service.get_translated_text(
                                    'article', article.id, field, language
                                )
                                self.assertTrue(localized, f'{language}: {field}_{article.id} is missing')
                                self.assertNotEqual(
                                    localized,
                                    getattr(article, field),
                                    f'{language}: {field}_{article.id} is still the English source',
                                )

                            if article.id >= 12:
                                localized_content = translation_service.get_translated_text(
                                    'article', article.id, 'content', language
                                )
                                localized_text = re.sub(r'<[^>]+>', ' ', localized_content).split()
                                if language == 'zh':
                                    self.assertGreaterEqual(len(''.join(localized_text)), 2200)
                                else:
                                    self.assertGreaterEqual(len(localized_text), 1000)
                                self.assertLessEqual(
                                    len(translation_service.get_translated_text(
                                        'article', article.id, 'meta_title', language
                                    )),
                                    65,
                                )

                            source_markup = MarkupCounter(article.content).counts
                            translated_markup = MarkupCounter(
                                translation_service.get_translated_text(
                                    'article', article.id, 'content', language
                                )
                            ).counts
                            for tag in ('figure', 'figcaption', 'img', 'p', 'h2', 'h3', 'ul', 'ol', 'li', 'table', 'tr', 'th', 'td', 'a', 'code'):
                                self.assertEqual(
                                    translated_markup[tag],
                                    source_markup[tag],
                                    f'{language}: article {article.id} changed {tag} structure',
                                )

                        translations = translation_service._load_translations_from_file('article', language)
                        for tag_id in range(1, 15):
                            self.assertTrue(translations.get(f'tag_{tag_id}'), f'{language}: tag_{tag_id} is missing')

                        response = APIClient().get(f'/api/articles/?lang={language}')
                        self.assertEqual(response.status_code, 200)
                        api_articles = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data

                        self.assertEqual(len(api_articles), len(articles))
                        for localized_article in api_articles:
                            for field in (
                                'title', 'excerpt', 'content',
                                'meta_title', 'meta_description', 'meta_keywords',
                            ):
                                self.assertTrue(
                                    localized_article[field],
                                    f"{language}: API omitted {field} for article {localized_article['id']}",
                                )
                            for tag in localized_article['tags']:
                                self.assertEqual(
                                    tag['name'],
                                    translations[f"tag_{tag['id']}"],
                                    f"{language}: API tag {tag['id']} is not localized",
                                )
