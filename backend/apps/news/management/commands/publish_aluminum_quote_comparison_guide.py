import re
import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from apps.news.models import AluminumBlogTopic, Article, Tag
from apps.products.services import translation_service
from .publish_thermal_break_window_rfq_guide import render_markdown


SLUG = 'compare-aluminum-extrusion-quotes-landed-cost'
KEYWORD = 'compare aluminum extrusion quotes'
ROOT = Path(settings.BASE_DIR).parent
BASE_NAME = '2026-10-13-compare-aluminum-extrusion-quotes-landed-cost'
LANGUAGES = {
    'en': {
        'title': 'How to Compare Aluminum Extrusion Quotes: Wall Thickness, Weight and Landed Cost',
        'meta_title': 'Compare Aluminum Extrusion Quotes: Wall Thickness & Landed Cost',
        'meta_description': 'Compare aluminum profile quotes by wall thickness, weight per metre, finish, tooling, machining, freight, customs duties and landed cost.',
        'meta_keywords': 'compare aluminum extrusion quotes, aluminum profile wall thickness, extrusion weight per metre, aluminum import duty, landed cost',
        'tag_names': ('Aluminium Extrusion', 'RFQ', 'Purchasing'),
    },
    'zh': {
        'meta_keywords': '铝型材报价比较，铝型材壁厚，铝型材每米重量，铝型材进口关税，到岸成本',
        'tag_names': ('铝型材', '询价', '采购指南'),
    },
    'es': {
        'meta_keywords': 'comparar cotizaciones de perfiles de aluminio, espesor de perfiles, peso por metro, arancel de importación, coste puesto en destino',
        'tag_names': ('Perfiles de aluminio', 'RFQ', 'Compras'),
    },
    'pt': {
        'meta_keywords': 'comparar cotação de perfil de alumínio, espessura de perfil, peso por metro, tarifa de importação, custo posto no destino',
        'tag_names': ('Perfis de alumínio', 'RFQ', 'Compras'),
    },
}


def read_localized_draft(language):
    suffix = f'-{language}' if language != 'en' else ''
    path = ROOT / 'docs' / 'blog-drafts' / f'{BASE_NAME}{suffix}.md'
    if not path.is_file():
        raise FileNotFoundError(f'Missing localized article draft: {path}')
    source = path.read_text(encoding='utf-8')
    lines = source.splitlines()
    title_match = next((re.match(r'^#\s+(.+)$', line) for line in lines if line.startswith('# ')), None)
    if not title_match:
        raise ValueError(f'Article title missing in {path}')
    metadata = {}
    body = []
    for line in lines:
        match = re.match(r'^\*\*(Excerpt|SEO title|Meta description|Meta keywords):\*\*\s*(.*)$', line)
        if match:
            metadata[match.group(1)] = match.group(2).strip()
        elif not line.startswith('# '):
            body.append(line)
    for field in ('Excerpt', 'SEO title', 'Meta description'):
        if not metadata.get(field):
            raise ValueError(f'{field} is missing in {path}')
    return title_match.group(1), metadata, render_markdown('\n'.join(body))


class Command(BaseCommand):
    help = 'Publish the localized aluminum extrusion quotation comparison guide.'

    @transaction.atomic
    def handle(self, *args, **options):
        localized = {language: read_localized_draft(language) for language in LANGUAGES}
        image_name = 'article-extrusion-die-tooling.webp'
        image_source = ROOT / 'frontend' / 'public' / 'images' / image_name
        if not image_source.is_file():
            raise FileNotFoundError(f'Missing featured image: {image_source}')

        title, metadata, content = localized['en']
        excerpt = metadata['Excerpt']
        meta_title = metadata['SEO title']
        meta_description = metadata['Meta description']
        article, _ = Article.objects.update_or_create(
            slug=SLUG,
            defaults={
                'title': title,
                'content': content,
                'excerpt': excerpt,
                'status': 'published',
                'is_featured': False,
                'meta_title': meta_title,
                'meta_description': meta_description,
                'meta_keywords': LANGUAGES['en']['meta_keywords'],
            },
        )

        cover_name = f'{SLUG}.webp'
        media_dir = Path(settings.MEDIA_ROOT) / 'articles'
        media_dir.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(image_source, media_dir / cover_name)
        article.featured_image.name = f'articles/{cover_name}'
        article.save(update_fields=['featured_image', 'updated_at'])

        for language in ('zh', 'es', 'pt'):
            localized_title, localized_meta, localized_content = localized[language]
            translations = translation_service._load_translations_from_file('article', language)
            for field, value in {
                'title': localized_title,
                'excerpt': localized_meta['Excerpt'],
                'content': localized_content,
                'meta_title': localized_meta['SEO title'],
                'meta_description': localized_meta['Meta description'],
                'meta_keywords': LANGUAGES[language]['meta_keywords'],
            }.items():
                translations[f'{field}_{article.id}'] = value

            tags = []
            for english_name, localized_name in zip(LANGUAGES['en']['tag_names'], LANGUAGES[language]['tag_names']):
                tag, _ = Tag.objects.get_or_create(name=english_name, defaults={'slug': slugify(english_name)})
                translations[f'tag_{tag.id}'] = localized_name
                tags.append(tag)
            translation_service._save_translations_to_file('article', language, translations)
            if language == 'zh':
                article.tags.set(tags)

        article.tags.set([
            Tag.objects.get(name=name)
            for name in LANGUAGES['en']['tag_names']
        ])
        AluminumBlogTopic.objects.update_or_create(
            slug=SLUG,
            defaults={
                'title': title,
                'primary_keyword': KEYWORD,
                'status': 'published',
                'article': article,
                'notes': 'Localized buyer guide; wall thickness is not treated as a standalone price formula and import duties are destination-specific.',
            },
        )
        self.stdout.write(self.style.SUCCESS(f'Published {SLUG} (article {article.id}) in en, zh, es and pt'))
