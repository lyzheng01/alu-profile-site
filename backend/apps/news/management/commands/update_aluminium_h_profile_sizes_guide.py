"""Update the H-profile sizing guide across all published languages."""

import sqlite3
import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction

from apps.news.models import Article
from apps.news.management.commands.publish_aluminium_h_profile_sizes_guide import (
    LANGUAGES,
    SLUG,
    read_localized_draft,
)
from apps.products.services import translation_service


class Command(BaseCommand):
    help = "Update the H-profile sizing guide and localized SEO content."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, **options):
        root = Path(settings.BASE_DIR).parent
        localized = {
            language: read_localized_draft(language)
            for language in LANGUAGES
        }
        article = Article.objects.filter(slug=SLUG, status="published").first()
        if article is None:
            raise CommandError(f"Published article not found: {SLUG}")

        if options["dry_run"]:
            for language, (title, _, content) in localized.items():
                self.stdout.write(
                    f"{language}: {title} ({content.count('<img')} images, "
                    f"{len(content)} rendered characters)"
                )
            return

        backup_dir = root / "backups" / "20261031_h_profile_multilingual_update"
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
            article.title = title
            article.content = content
            article.excerpt = metadata["Excerpt"]
            article.meta_title = metadata["SEO title"]
            article.meta_description = metadata["Meta description"]
            article.meta_keywords = metadata.get("Meta keywords", article.meta_keywords)
            article.save(
                update_fields=[
                    "title",
                    "content",
                    "excerpt",
                    "meta_title",
                    "meta_description",
                    "meta_keywords",
                    "updated_at",
                ]
            )
            for language in ("zh", "es", "pt"):
                title, metadata, content = localized[language]
                translations = translation_service._load_translations_from_file("article", language)
                for field, value in {
                    "title": title,
                    "content": content,
                    "excerpt": metadata["Excerpt"],
                    "meta_title": metadata["SEO title"],
                    "meta_description": metadata["Meta description"],
                    "meta_keywords": LANGUAGES[language]["meta_keywords"],
                }.items():
                    translations[f"{field}_{article.id}"] = value
                if not translation_service._save_translations_to_file("article", language, translations):
                    raise CommandError(f"Could not save {language} article translation")

        self.stdout.write(
            self.style.SUCCESS(
                f"Updated article {article.id} content and SEO metadata in en, zh, es and pt."
            )
        )
