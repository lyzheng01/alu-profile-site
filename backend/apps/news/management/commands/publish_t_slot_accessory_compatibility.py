import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from apps.news.models import AluminumBlogTopic, Article, Tag
from .publish_thermal_break_window_rfq_guide import render_markdown


SLUG = 't-slot-profile-accessory-compatibility-guide'
TITLE = 'T-Slot Aluminium Profile Compatibility: How to Check Slots, Fasteners and Accessories Before Ordering'
KEYWORD = 'T-slot aluminium profile compatibility'
META_DESCRIPTION = 'Check T-slot profile, nut, bolt and bracket interfaces before ordering. Use a sample-fit workflow and a copy-ready RFQ checklist.'
EXCERPT = 'Learn how to verify T-slot profile, fastener, bracket and connector interfaces, test a representative assembly, and prepare a clearer accessory RFQ.'


class Command(BaseCommand):
    help = 'Publish the T-slot profile and accessory compatibility guide.'

    @transaction.atomic
    def handle(self, *args, **options):
        project_root = Path(settings.BASE_DIR).parent
        draft = project_root / 'docs' / 'blog-drafts' / '2026-10-12-t-slot-profile-accessory-compatibility.md'
        source_image = project_root / 'backend' / 'catalog_assets' / '2020-aluminium-t-slot.jpg'
        if not draft.is_file() or not source_image.is_file():
            raise FileNotFoundError('The article draft or T-slot profile cover image is missing.')

        cover_name = f'{SLUG}.jpg'
        media_dir = Path(settings.MEDIA_ROOT) / 'articles'
        media_dir.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source_image, media_dir / cover_name)

        article, _ = Article.objects.update_or_create(
            slug=SLUG,
            defaults={
                'title': TITLE,
                'content': render_markdown(draft.read_text(encoding='utf-8')),
                'excerpt': EXCERPT,
                'status': 'published',
                'is_featured': False,
                'meta_title': 'T-Slot Profile Compatibility: Buyer Guide',
                'meta_description': META_DESCRIPTION,
                'meta_keywords': f'{KEYWORD}, T-slot accessories, T-slot nuts, aluminium framing connectors',
            },
        )
        article.featured_image.name = f'articles/{cover_name}'
        article.save(update_fields=['featured_image', 'updated_at'])

        tags = []
        for name in ('T-Slot', 'Aluminium Extrusion', 'RFQ'):
            tag, _ = Tag.objects.get_or_create(name=name, defaults={'slug': slugify(name)})
            tags.append(tag)
        article.tags.set(tags)
        AluminumBlogTopic.objects.update_or_create(
            title=TITLE,
            defaults={
                'slug': SLUG,
                'primary_keyword': KEYWORD,
                'status': 'published',
                'article': article,
                'notes': 'Buyer-side guide; avoids unsupported dimensions and cross-brand compatibility claims.',
            },
        )
        self.stdout.write(self.style.SUCCESS(f'Published {SLUG} (article {article.id})'))
