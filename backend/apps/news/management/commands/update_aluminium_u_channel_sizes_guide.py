"""Update the published U-channel guide with its reviewed image additions."""

import html
import re
import shutil
import sqlite3
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction
from apps.news.models import Article
from apps.products.services import translation_service
from apps.news.management.commands.publish_thermal_break_window_rfq_guide import render_markdown

SLUG = "aluminium-u-channel-sizes-guide"
BASE_NAME = "2026-10-20-aluminium-u-channel-sizes-guide"
LANGUAGES = ("en", "zh", "es", "pt")
EXPECTED_IMAGES = {
    "/images/aluminium-u-channel-sizes-guide.webp",
    "/images/aluminium-u-channel-section-dimensions.svg",
    "/images/aluminium-u-channel-extrusion-process.webp",
    "/images/aluminium-u-channel-opening-measurement.webp",
    "/images/aluminium-u-channel-fit-comparison.webp",
}


def load_content(root, language):
    suffix = "" if language == "en" else f"-{language}"
    path = root / "docs" / "blog-drafts" / f"{BASE_NAME}{suffix}.md"
    if not path.is_file():
        raise CommandError(f"Missing article draft for {language}")
    lines = path.read_text(encoding="utf-8-sig").splitlines()
    body = [line for line in lines if not line.startswith("# ") and not line.startswith("**状态：**") and not re.match(r"^\*\*(Excerpt|SEO title|Meta description|Meta keywords):\*", line)]
    found = set()
    output = []
    i = 0
    while i < len(body):
        match = re.fullmatch(r"!\[([^\]]*)\]\((/images/[^)]+)\)", body[i].strip())
        if not match:
            output.append(body[i])
            i += 1
            continue
        alt, image_path = match.groups()
        if image_path not in EXPECTED_IMAGES:
            raise CommandError(f"Unexpected image reference in {path}: {image_path}")
        found.add(image_path)
        local_asset = root / "frontend" / "public" / image_path.lstrip("/")
        if not local_asset.is_file():
            raise CommandError(f"Missing image asset: {local_asset}")
        caption = ""
        if i + 1 < len(body):
            caption_match = re.fullmatch(r"\*([^*]+)\*", body[i + 1].strip())
            if caption_match:
                caption = caption_match.group(1)
                i += 1
        output.extend([
            "<figure>",
            f'<img src="{html.escape(image_path, quote=True)}" alt="{html.escape(alt, quote=True)}" loading="lazy" style="display:block;width:100%;height:auto;border-radius:12px" />',
            f"<figcaption>{html.escape(caption)}</figcaption>" if caption else "",
            "</figure>",
            "",
        ])
        i += 1
    if found != EXPECTED_IMAGES:
        raise CommandError(f"Expected five distinct article images for {language}; found {len(found)}")
    content = render_markdown("\n".join(output))
    if content.count("<img") != 5:
        raise CommandError(f"Expected five rendered images for {language}; found {content.count('<img')}")
    return content


class Command(BaseCommand):
    help = "Update the published U-channel guide body with its reviewed five-image layout."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, **options):
        root = Path(settings.BASE_DIR).parent
        content_by_language = {lang: load_content(root, lang) for lang in LANGUAGES}
        article = Article.objects.filter(slug=SLUG, status="published").first()
        if article is None:
            raise CommandError(f"Published article not found: {SLUG}")
        if options["dry_run"]:
            self.stdout.write(f"Validated published article {article.id} and five images in {len(LANGUAGES)} language drafts.")
            return
        backup_dir = root / "backups" / "20261020_u_channel_images_update"
        backup_dir.mkdir(parents=True, exist_ok=True)
        if "sqlite" not in connection.settings_dict["ENGINE"]:
            raise CommandError("Automatic backup currently requires the configured SQLite database.")
        connection.ensure_connection()
        backup_db = sqlite3.connect(backup_dir / "database.sqlite3")
        connection.connection.backup(backup_db)
        backup_db.close()
        for language in LANGUAGES[1:]:
            translation_file = translation_service._get_translation_file_path("article", language)
            if translation_file.exists():
                shutil.copy2(translation_file, backup_dir / translation_file.name)
        with transaction.atomic():
            article.content = content_by_language["en"]
            article.save(update_fields=["content", "updated_at"])
            for language in LANGUAGES[1:]:
                translations = translation_service._load_translations_from_file("article", language)
                translations[f"content_{article.id}"] = content_by_language[language]
                if not translation_service._save_translations_to_file("article", language, translations):
                    raise CommandError(f"Could not save {language} article content")
        self.stdout.write(self.style.SUCCESS(f"Updated published article {article.id}; five images in en, zh, es and pt."))

