"""Publish the reviewed four-language U-channel sizing guide."""

import html
import re
import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils.text import slugify

from apps.news.models import AluminumBlogTopic, Article, Tag
from apps.products.services import translation_service
from apps.news.management.commands.publish_thermal_break_window_rfq_guide import render_markdown


SLUG = "aluminium-u-channel-sizes-guide"
KEYWORD = "aluminium u channel sizes"
BASE_NAME = "2026-10-20-aluminium-u-channel-sizes-guide"
ROOT = Path(settings.BASE_DIR).parent
IMAGE_NAMES = (
    "aluminium-u-channel-sizes-guide.webp",
    "aluminium-u-channel-section-dimensions.svg",
)
LANGUAGES = {
    "en": {
        "meta_keywords": "aluminium u channel sizes, aluminium channel dimensions, u channel wall thickness, aluminium u section, aluminium extrusion drawing",
        "tag_names": ("Aluminium Extrusion", "Profile Selection", "Engineering Buyer Guide"),
    },
    "zh": {
        "meta_keywords": "铝合金U型槽尺寸，铝型材U槽尺寸，U型槽壁厚，铝合金槽型材，铝型材图纸",
        "tag_names": ("铝型材", "型材选型", "工程采购指南"),
    },
    "es": {
        "meta_keywords": "medidas canal U aluminio, dimensiones perfil U aluminio, espesor canal aluminio, perfil extruido aluminio, plano de extrusión",
        "tag_names": ("Perfiles de aluminio", "Selección de perfiles", "Guía de compra técnica"),
    },
    "pt": {
        "meta_keywords": "medidas canal U alumínio, dimensões perfil U alumínio, espessura canal de alumínio, perfil extrudado, desenho de extrusão",
        "tag_names": ("Perfis de alumínio", "Seleção de perfis", "Guia técnico de compra"),
    },
}


def read_localized_draft(language):
    suffix = "" if language == "en" else f"-{language}"
    path = ROOT / "docs" / "blog-drafts" / f"{BASE_NAME}{suffix}.md"
    if not path.is_file():
        raise CommandError(f"Missing localized draft: {path}")
    lines = path.read_text(encoding="utf-8-sig").splitlines()
    title_match = next((re.match(r"^#\s+(.+)$", line) for line in lines if line.startswith("# ")), None)
    if not title_match:
        raise CommandError(f"Article title is missing in {path}")

    metadata = {}
    body = []
    for line in lines:
        match = re.match(r"^\*\*(Excerpt|SEO title|Meta description|Meta keywords):\*\*\s*(.*)$", line)
        if match:
            metadata[match.group(1)] = match.group(2).strip()
        elif not line.startswith("# ") and not line.startswith("**状态：**"):
            body.append(line)

    for field in ("Excerpt", "SEO title", "Meta description"):
        if not metadata.get(field):
            raise CommandError(f"{field} is missing in {path}")
    image_refs = re.findall(r"!\[([^\]]*)\]\((/images/[^)]+)\)", "\n".join(body))
    expected = {f"/images/{name}" for name in IMAGE_NAMES}
    if len(image_refs) != 2 or {path for _, path in image_refs} != expected:
        raise CommandError(f"Expected exactly the approved two images in {path}")
    content_lines = []
    index = 0
    while index < len(body):
        image = re.fullmatch(r"!\[([^\]]*)\]\((/images/[^)]+)\)", body[index].strip())
        if not image:
            content_lines.append(body[index])
            index += 1
            continue
        alt, image_path = image.groups()
        caption = ""
        if index + 1 < len(body):
            caption_match = re.fullmatch(r"\*([^*]+)\*", body[index + 1].strip())
            if caption_match:
                caption = caption_match.group(1)
                index += 1
        content_lines.extend([
            "<figure>",
            f'<img src="{html.escape(image_path, quote=True)}" alt="{html.escape(alt, quote=True)}" loading="lazy" style="display:block;width:100%;height:auto;border-radius:12px" />',
            f"<figcaption>{html.escape(caption)}</figcaption>" if caption else "",
            "</figure>",
            "",
        ])
        index += 1
    content = render_markdown("\n".join(content_lines))
    if content.count("<img") != 2:
        raise CommandError(f"Expected two rendered images in {language}; found {content.count('<img')}")
    return title_match.group(1), metadata, content


class Command(BaseCommand):
    help = "Publish the reviewed U-channel sizing guide in English, Chinese, Spanish and Portuguese."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Validate localized drafts and assets without publishing.")

    def handle(self, *args, **options):
        localized = {language: read_localized_draft(language) for language in LANGUAGES}
        for image_name in IMAGE_NAMES:
            image_path = ROOT / "frontend" / "public" / "images" / image_name
            if not image_path.is_file():
                raise CommandError(f"Missing approved article image: {image_path}")

        if Article.objects.filter(slug=SLUG).exists() or AluminumBlogTopic.objects.filter(slug=SLUG).exists():
            raise CommandError(f"Slug already exists; refusing to overwrite: {SLUG}")

        if options["dry_run"]:
            self.stdout.write(f"Validated {len(localized)} language drafts, {len(IMAGE_NAMES)} images, and free slug {SLUG}.")
            for language, (title, metadata, content) in localized.items():
                self.stdout.write(f"{language}: {title} ({len(content)} rendered characters)")
            return

        with transaction.atomic():
            title, metadata, content = localized["en"]
            article = Article.objects.create(
                slug=SLUG,
                title=title,
                content=content,
                excerpt=metadata["Excerpt"],
                status="published",
                is_featured=False,
                meta_title=metadata["SEO title"],
                meta_description=metadata["Meta description"],
                meta_keywords=LANGUAGES["en"]["meta_keywords"],
            )

            media_dir = Path(settings.MEDIA_ROOT) / "articles"
            media_dir.mkdir(parents=True, exist_ok=True)
            cover_target = media_dir / f"{SLUG}.webp"
            shutil.copyfile(ROOT / "frontend" / "public" / "images" / IMAGE_NAMES[0], cover_target)
            article.featured_image.name = f"articles/{cover_target.name}"
            article.save(update_fields=["featured_image", "updated_at"])

            english_tags = LANGUAGES["en"]["tag_names"]
            tags = [Tag.objects.get_or_create(name=name, defaults={"slug": slugify(name)})[0] for name in english_tags]
            article.tags.set(tags)

            for language in ("zh", "es", "pt"):
                localized_title, localized_meta, localized_content = localized[language]
                translations = translation_service._load_translations_from_file("article", language)
                for field, value in {
                    "title": localized_title,
                    "excerpt": localized_meta["Excerpt"],
                    "content": localized_content,
                    "meta_title": localized_meta["SEO title"],
                    "meta_description": localized_meta["Meta description"],
                    "meta_keywords": LANGUAGES[language]["meta_keywords"],
                }.items():
                    translations[f"{field}_{article.id}"] = value
                for tag, translated_tag in zip(tags, LANGUAGES[language]["tag_names"]):
                    translations[f"tag_{tag.id}"] = translated_tag
                if not translation_service._save_translations_to_file("article", language, translations):
                    raise CommandError(f"Could not save {language} article translations")

            AluminumBlogTopic.objects.create(
                slug=SLUG,
                title=title,
                primary_keyword=KEYWORD,
                status="published",
                article=article,
                notes="GSC-informed buyer guide for aluminium U-channel sizing; explains measurement points and RFQ details without claiming a universal size chart.",
            )

        self.stdout.write(self.style.SUCCESS(f"Published {SLUG} in en, zh, es and pt (article {article.id})"))
