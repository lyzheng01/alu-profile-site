"""Publish a four-language, drawing-first H-profile sizing guide."""

import html
import re
import shutil
import sqlite3
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction
from django.utils.text import slugify

from apps.news.models import AluminumBlogTopic, Article, Tag
from apps.products.services import translation_service
from apps.news.management.commands.publish_thermal_break_window_rfq_guide import render_markdown


SLUG = "aluminium-h-profile-sizes-guide"
KEYWORD = "aluminium h profile sizes"
BASE_NAME = "2026-10-21-aluminium-h-profile-sizes-guide"
ROOT = Path(settings.BASE_DIR).parent
LANGUAGES = {
    "en": {
        "meta_keywords": "aluminium h profile sizes, aluminium h section dimensions, h profile extrusion, h channel dimensions, aluminium extrusion drawing",
        "tags": ("Aluminium Extrusion", "Profile Selection", "Engineering Buyer Guide"),
    },
    "zh": {
        "meta_keywords": "铝合金H型材尺寸，H型材截面尺寸，铝型材H型材，H型材图纸，铝型材询价",
        "tags": ("铝型材", "型材选型", "工程采购指南"),
    },
    "es": {
        "meta_keywords": "medidas perfil H aluminio, dimensiones sección H aluminio, extrusión perfil H, canal H aluminio, plano de extrusión aluminio",
        "tags": ("Perfiles de aluminio", "Selección de perfiles", "Guía técnica de compra"),
    },
    "pt": {
        "meta_keywords": "medidas perfil H alumínio, dimensões seção H alumínio, extrusão perfil H, canal H alumínio, desenho de extrusão",
        "tags": ("Perfis de alumínio", "Seleção de perfis", "Guia técnico de compra"),
    },
}
IMAGE_NAMES = {
    "aluminium-h-profile-sizes-guide.webp",
    "aluminium-h-profile-dimensions.svg",
    "aluminium-h-profile-web-thickness-measurement.webp",
    "aluminium-h-profile-section-comparison.webp",
    "aluminium-h-profile-panel-joint.webp",
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

    references = re.findall(r"!\[([^\]]*)\]\((/images/[^)]+)\)", "\n".join(body))
    reference_names = [image_path.rsplit("/", 1)[-1] for _, image_path in references]
    if len(references) != len(IMAGE_NAMES) or set(reference_names) != IMAGE_NAMES:
        raise CommandError(f"Expected exactly five approved images in {path}")
    for image_name in IMAGE_NAMES:
        if not (ROOT / "frontend" / "public" / "images" / image_name).is_file():
            raise CommandError(f"Missing image asset: {image_name}")

    rendered_lines = []
    index = 0
    while index < len(body):
        image = re.fullmatch(r"!\[([^\]]*)\]\((/images/[^)]+)\)", body[index].strip())
        if not image:
            rendered_lines.append(body[index])
            index += 1
            continue
        alt, image_path = image.groups()
        caption = ""
        if index + 1 < len(body):
            caption_match = re.fullmatch(r"\*([^*]+)\*", body[index + 1].strip())
            if caption_match:
                caption = caption_match.group(1)
                index += 1
        rendered_lines.extend([
            "<figure>",
            f'<img src="{html.escape(image_path, quote=True)}" alt="{html.escape(alt, quote=True)}" loading="lazy" style="display:block;width:100%;height:auto;border-radius:12px" />',
            f"<figcaption>{html.escape(caption)}</figcaption>" if caption else "",
            "</figure>",
            "",
        ])
        index += 1

    content = render_markdown("\n".join(rendered_lines))
    if content.count("<img") != 5 or content.count("<figure>") != 5:
        raise CommandError(f"Expected five rendered figures in {language}")
    return title_match.group(1), metadata, content


class Command(BaseCommand):
    help = "Publish the aluminium H-profile sizing guide in English, Chinese, Spanish and Portuguese."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, **options):
        localized = {language: read_localized_draft(language) for language in LANGUAGES}
        if Article.objects.filter(slug=SLUG).exists() or AluminumBlogTopic.objects.filter(slug=SLUG).exists():
            raise CommandError(f"Slug already exists; refusing to overwrite: {SLUG}")

        if options["dry_run"]:
            self.stdout.write(f"Validated {len(localized)} language drafts, five images, and free slug {SLUG}.")
            for language, (title, _, content) in localized.items():
                self.stdout.write(f"{language}: {title} ({len(content)} rendered characters)")
            return

        backup_dir = ROOT / "backups" / "20261021_aluminium_h_profile_guide"
        backup_dir.mkdir(parents=True, exist_ok=True)
        if "sqlite" not in connection.settings_dict["ENGINE"]:
            raise CommandError("Automatic backup currently requires the configured SQLite database.")
        connection.ensure_connection()
        backup_db = sqlite3.connect(backup_dir / "database.sqlite3")
        connection.connection.backup(backup_db)
        backup_db.close()
        for language in ("zh", "es", "pt"):
            translation_file = translation_service._get_translation_file_path("article", language)
            if translation_file.exists():
                shutil.copy2(translation_file, backup_dir / translation_file.name)

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
            shutil.copyfile(ROOT / "frontend" / "public" / "images" / "aluminium-h-profile-sizes-guide.webp", cover_target)
            article.featured_image.name = f"articles/{cover_target.name}"
            article.save(update_fields=["featured_image", "updated_at"])

            tags = []
            for name in LANGUAGES["en"]["tags"]:
                tag, _ = Tag.objects.get_or_create(name=name, defaults={"slug": slugify(name)})
                tags.append(tag)
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
                for tag, translated_tag in zip(tags, LANGUAGES[language]["tags"]):
                    translations[f"tag_{tag.id}"] = translated_tag
                if not translation_service._save_translations_to_file("article", language, translations):
                    raise CommandError(f"Could not save {language} article translations")

            AluminumBlogTopic.objects.create(
                slug=SLUG,
                title=title,
                primary_keyword=KEYWORD,
                status="published",
                article=article,
                notes="GSC-informed H-profile sizing guide; explains drawing notation, mating-part clearances and RFQ details without claiming a universal size chart.",
            )

        self.stdout.write(self.style.SUCCESS(f"Published {SLUG} in en, zh, es and pt (article {article.id})."))
