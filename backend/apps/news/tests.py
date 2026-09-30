import tempfile
from pathlib import Path

from django.core.management import call_command
from django.test import TestCase, override_settings

from .models import Article, AluminumBlogTopic


class SeedLingyeNewsTests(TestCase):
    def test_command_publishes_eleven_articles_with_covers_and_is_idempotent(self):
        with tempfile.TemporaryDirectory() as media_dir:
            with override_settings(MEDIA_ROOT=media_dir):
                call_command('seed_lingye_news')
                call_command('seed_lingye_news')

                articles = Article.objects.filter(status='published')
                self.assertEqual(articles.count(), 11)
                self.assertTrue(all(article.content and article.excerpt for article in articles))
                self.assertTrue(all(article.tags.exists() for article in articles))
                self.assertTrue(all(Path(media_dir, article.featured_image.name).is_file() for article in articles))
                self.assertEqual(AluminumBlogTopic.objects.filter(status='published').count(), 11)

                expected_slugs = {
                    '6061-vs-6063-aluminium-alloy-selection',
                    'aluminium-extrusion-cross-section-die-design-guide',
                    'aluminium-extrusion-process-from-billet-to-profile',
                    'cnc-machined-aluminium-profile-tolerances-inspection',
                    'aluminium-heat-sink-profile-design-guide',
                    'aluminium-solar-mounting-profile-design-checklist',
                }
                self.assertTrue(expected_slugs.issubset(set(articles.values_list('slug', flat=True))))
