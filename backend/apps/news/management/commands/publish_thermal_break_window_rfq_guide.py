import html
import re
import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from apps.news.models import AluminumBlogTopic, Article, Tag


SLUG = 'thermal-break-window-profile-rfq-guide'
TITLE = 'Thermal-Break Aluminium Window Profiles: What Buyers Should Specify Before an RFQ'
KEYWORD = 'thermal break aluminium window profiles'
META_DESCRIPTION = 'Prepare a clearer thermal-break window profile RFQ with section drawings, glazing interfaces, finishes, performance evidence and delivery requirements.'


def inline_markup(value):
    value = re.sub(r'<a href="([^"]+)">([^<]+)</a>', r'[\2](\1)', value)
    value = html.escape(value, quote=False)
    value = re.sub(r'\[([^\]]+)\]\((https?://[^)]+|/[^)]+)\)', r'<a href="\2">\1</a>', value)
    value = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', value)
    value = re.sub(r'\*([^*]+)\*', r'<em>\1</em>', value)
    return value


def render_markdown(source):
    source_lines = source.splitlines()
    lines = []
    index = 0
    while index < len(source_lines):
        if not source_lines[index].strip().startswith('|'):
            lines.append(source_lines[index])
            index += 1
            continue
        rows = []
        while index < len(source_lines) and source_lines[index].strip().startswith('|'):
            cells = [cell.strip() for cell in source_lines[index].strip().strip('|').split('|')]
            if not all(re.fullmatch(r':?-{3,}:?', cell) for cell in cells):
                rows.append(cells)
            index += 1
        if rows:
            header = ''.join(f'<th>{inline_markup(cell)}</th>' for cell in rows[0])
            body = ''.join('<tr>' + ''.join(f'<td>{inline_markup(cell)}</td>' for cell in row) + '</tr>' for row in rows[1:])
            lines.extend([f'<table><thead><tr>{header}</tr></thead><tbody>{body}</tbody></table>', ''])
    blocks = []
    paragraph = []
    list_items = []
    list_tag = None
    raw_block = []

    def flush_paragraph():
        if paragraph:
            blocks.append(f'<p>{inline_markup(" ".join(paragraph))}</p>')
            paragraph.clear()

    def flush_list():
        nonlocal list_tag
        if list_items:
            blocks.append(f'<{list_tag}>' + ''.join(f'<li>{inline_markup(item)}</li>' for item in list_items) + f'</{list_tag}>')
            list_items.clear()
            list_tag = None

    in_raw = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('<figure') or stripped.startswith('<table'):
            flush_paragraph()
            flush_list()
            if stripped.startswith('<table') and '</table>' in stripped:
                blocks.append(line)
                continue
            in_raw = True
            raw_block = [line]
            continue
        if in_raw:
            raw_block.append(line)
            if stripped == '</figure>' or stripped == '</table>':
                blocks.append(''.join(raw_block))
                raw_block = []
                in_raw = False
            continue
        if not stripped or stripped.startswith('**Status:**') or stripped.startswith('**Primary keyword:**') or stripped.startswith('**Supporting topics:**') or stripped.startswith('**Excerpt:**') or stripped.startswith('**SEO title:**') or stripped.startswith('**Meta description:**') or stripped.startswith('**Meta keywords:**'):
            flush_paragraph()
            flush_list()
            continue
        if stripped.startswith('# '):
            flush_paragraph(); flush_list()
            continue
        if stripped.startswith('## '):
            flush_paragraph(); flush_list()
            blocks.append(f'<h2>{inline_markup(stripped[3:])}</h2>')
            continue
        if stripped.startswith('### '):
            flush_paragraph(); flush_list()
            blocks.append(f'<h3>{inline_markup(stripped[4:])}</h3>')
            continue
        if stripped.startswith('> '):
            flush_paragraph(); flush_list()
            blocks.append(f'<p><em>{inline_markup(stripped[2:])}</em></p>')
            continue
        match = re.match(r'^(\d+)\.\s+(.*)$', stripped)
        if match or stripped.startswith('- '):
            flush_paragraph()
            tag = 'ol' if match else 'ul'
            if list_tag and list_tag != tag:
                flush_list()
            list_tag = tag
            list_items.append(match.group(2) if match else stripped[2:])
            continue
        flush_list()
        paragraph.append(stripped)
    flush_paragraph()
    flush_list()
    return '\n'.join(blocks)


class Command(BaseCommand):
    help = 'Publish the thermal-break window profile RFQ guide without touching other articles.'

    @transaction.atomic
    def handle(self, *args, **options):
        project_root = Path(settings.BASE_DIR).parent
        draft = project_root / 'docs' / 'blog-drafts' / '2026-10-11-thermal-break-window-profile-rfq-guide.md'
        source_image = project_root / 'frontend' / 'public' / 'images' / 'thermal-break-window-system.webp'
        if not draft.is_file() or not source_image.is_file():
            raise FileNotFoundError('The reviewed article draft or featured image is missing.')

        cover_name = f'{SLUG}.webp'
        media_dir = Path(settings.MEDIA_ROOT) / 'articles'
        media_dir.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source_image, media_dir / cover_name)

        article, _ = Article.objects.update_or_create(
            slug=SLUG,
            defaults={
                'title': TITLE,
                'content': render_markdown(draft.read_text(encoding='utf-8')),
                'excerpt': 'A buyer-side checklist for specifying thermal-break window profiles, interfaces, performance evidence and quotation scope.',
                'status': 'published',
                'is_featured': False,
                'meta_title': 'Thermal-Break Window Profiles: RFQ Guide',
                'meta_description': META_DESCRIPTION,
                'meta_keywords': KEYWORD,
            },
        )
        article.featured_image.name = f'articles/{cover_name}'
        article.save(update_fields=['featured_image', 'updated_at'])

        tags = []
        for name in ('RFQ', 'Aluminium Extrusion'):
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
                'notes': 'Buyer-side sourcing guide; reviewed for technical scope and supplier-role accuracy.',
            },
        )
        self.stdout.write(self.style.SUCCESS(f'Published {SLUG} (article {article.id})'))
