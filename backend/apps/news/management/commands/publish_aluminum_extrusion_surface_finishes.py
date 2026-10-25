"""Publish the reviewed four-language aluminum extrusion surface finishes guide."""

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


SLUG = "aluminum-extrusion-surface-finishes"
BASE_NAME = "2026-10-18-aluminum-extrusion-surface-finishes"
KEYWORD = "aluminum extrusion surface finishes"
ROOT = Path(settings.BASE_DIR).parent
LANGUAGES = {
    "en": {
        "title": "How to Choose an Aluminum Extrusion Finish: Anodizing, Powder Coating or Woodgrain",
        "excerpt": "Compare anodizing, powder coating and woodgrain transfer for aluminum profiles, with practical selection and RFQ checks.",
        "meta_title": "Aluminum Extrusion Finishes: Anodizing vs Powder Coating vs Woodgrain",
        "meta_description": "Compare anodizing, powder coating and woodgrain transfer for aluminum profiles. Review appearance, applications and the details to confirm in an RFQ.",
        "meta_keywords": "aluminum extrusion finishes, aluminum anodizing, powder coating aluminum profiles, woodgrain aluminum extrusion, aluminum finish selection",
        "tags": ("Aluminum Extrusion Finishes", "Surface Finish Selection", "Engineering Buyer Guide"),
        "localized_tags": ("Aluminum Extrusion Finishes", "Surface Finish Selection", "Engineering Buyer Guide"),
    },
    "zh": {
        "title": "铝型材表面处理怎么选？阳极氧化、粉末喷涂与木纹转印对比",
        "excerpt": "对比铝型材阳极氧化、粉末喷涂和木纹转印的外观、适用场景与询价要点。",
        "meta_title": "铝型材表面处理怎么选：阳极氧化、粉末喷涂、木纹转印",
        "meta_description": "对比铝型材阳极氧化、粉末喷涂和木纹转印的外观、适用场景与询价要点，帮助采购和设计团队明确表面处理要求。",
        "meta_keywords": "铝型材表面处理，铝型材阳极氧化，铝型材粉末喷涂，铝型材木纹转印，表面处理选型",
        "localized_tags": ("铝型材表面处理", "表面处理选型", "工程采购指南"),
    },
    "es": {
        "title": "¿Cómo elegir el acabado de un perfil de aluminio? Anodizado, pintura en polvo o efecto madera",
        "excerpt": "Compare anodizado, pintura en polvo y transferencia de efecto madera para perfiles de aluminio, con consejos prácticos para cotizar.",
        "meta_title": "Acabados para perfiles de aluminio: anodizado, pintura en polvo y efecto madera",
        "meta_description": "Compare anodizado, pintura en polvo y transferencia de efecto madera para perfiles de aluminio. Revise su apariencia, uso y requisitos para una solicitud de cotización.",
        "meta_keywords": "acabados para perfiles de aluminio, anodizado de aluminio, pintura en polvo aluminio, perfil aluminio efecto madera, selección de acabados",
        "localized_tags": ("Acabados de perfiles de aluminio", "Selección de acabados", "Guía para compradores técnicos"),
    },
    "pt": {
        "title": "Como escolher o acabamento de um perfil de alumínio: anodização, pintura a pó ou efeito madeira",
        "excerpt": "Compare anodização, pintura a pó e transferência de efeito madeira para perfis de alumínio, com orientações práticas para cotação.",
        "meta_title": "Acabamentos para perfis de alumínio: anodização, pintura a pó e efeito madeira",
        "meta_description": "Compare anodização, pintura a pó e transferência de efeito madeira para perfis de alumínio. Veja aparência, aplicações e requisitos para solicitar uma cotação.",
        "meta_keywords": "acabamentos para perfis de alumínio, anodização de alumínio, pintura a pó alumínio, perfil de alumínio efeito madeira, seleção de acabamento",
        "localized_tags": ("Acabamentos de perfis de alumínio", "Seleção de acabamentos", "Guia para compradores técnicos"),
    },
}
IMAGE_ALLOWLIST = {
    "aluminum-extrusion-finishes-comparison.webp",
    "aluminum-extrusion-finish-sample-inspection.webp",
}


def read_localized_draft(language):
    suffix = "" if language == "en" else f"-{language}"
    path = ROOT / "docs" / "blog-drafts" / f"{BASE_NAME}{suffix}.md"
    source = path.read_text(encoding="utf-8-sig")
    lines = source.splitlines()
    title_match = next((re.match(r"^#\s+(.+)$", line) for line in lines if line.startswith("# ")), None)
    if not title_match:
        raise CommandError(f"Missing article title: {path}")

    content_lines = []
    index = 0
    image_count = 0
    while index < len(lines):
        line = lines[index]
        if line.startswith("# "):
            index += 1
            continue
        if line.startswith(("**Status:**", "**状态：**", "**Estado:**", "**SEO title:**", "**Meta description:**", "**建议链接：**")):
            index += 1
            continue
        image = re.fullmatch(r"!\[([^\]]+)\]\((/images/[^)]+)\)", line.strip())
        if image:
            alt, image_path = image.groups()
            name = image_path.rsplit("/", 1)[-1]
            if name not in IMAGE_ALLOWLIST:
                raise CommandError(f"Image is not approved for this article: {image_path}")
            caption = ""
            if index + 1 < len(lines):
                caption_match = re.fullmatch(r"\*([^*]+)\*", lines[index + 1].strip())
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
            image_count += 1
            index += 1
            continue
        content_lines.append(line)
        index += 1

    if image_count != 2:
        raise CommandError(f"Expected two editorial images in {language}; found {image_count}")
    rendered = render_markdown("\n".join(content_lines))
    if rendered.count("<figure>") != 2 or "![" in rendered:
        raise CommandError(f"Image rendering failed for {language}")
    return title_match.group(1), rendered


class Command(BaseCommand):
    help = "Publish the reviewed four-language aluminum extrusion surface finishes guide."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Validate drafts and show the publish plan without changing data.")

    def handle(self, *args, **options):
        localized = {language: read_localized_draft(language) for language in LANGUAGES}
        for image_name in IMAGE_ALLOWLIST:
            if not (ROOT / "frontend" / "public" / "images" / image_name).is_file():
                raise CommandError(f"Missing website image: {image_name}")

        if Article.objects.filter(slug=SLUG).exists() or AluminumBlogTopic.objects.filter(slug=SLUG).exists():
            raise CommandError(f"Slug already exists; refusing to overwrite: {SLUG}")

        cover = ROOT / "frontend" / "public" / "images" / "aluminum-extrusion-finishes-comparison.webp"
        media_dir = Path(settings.MEDIA_ROOT) / "articles"
        cover_target = media_dir / f"{SLUG}.webp"
        if cover_target.exists():
            raise CommandError(f"Cover image already exists; refusing to overwrite: {cover_target}")

        if options["dry_run"]:
            self.stdout.write(f"Validated {len(localized)} language drafts, {len(IMAGE_ALLOWLIST)} images, and free slug {SLUG}.")
            for language, (title, content) in localized.items():
                self.stdout.write(f"{language}: {title} ({len(content)} rendered characters)")
            return

        with transaction.atomic():
            title, content = localized["en"]
            metadata = LANGUAGES["en"]
            article = Article.objects.create(
                slug=SLUG,
                title=title,
                content=content,
                excerpt=metadata["excerpt"],
                status="published",
                is_featured=False,
                meta_title=metadata["meta_title"],
                meta_description=metadata["meta_description"],
                meta_keywords=metadata["meta_keywords"],
            )

            media_dir.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(cover, cover_target)
            article.featured_image.name = f"articles/{cover_target.name}"

            tag_objects = []
            for tag_name in metadata["tags"]:
                tag, _ = Tag.objects.get_or_create(name=tag_name, defaults={"slug": slugify(tag_name)})
                tag_objects.append(tag)
            article.tags.set(tag_objects)
            article.save()

            for language in ("zh", "es", "pt"):
                translated_title, translated_content = localized[language]
                meta = LANGUAGES[language]
                translations = translation_service._load_translations_from_file("article", language)
                for field, value in {
                    "title": translated_title,
                    "content": translated_content,
                    "excerpt": meta["excerpt"],
                    "meta_title": meta["meta_title"],
                    "meta_description": meta["meta_description"],
                    "meta_keywords": meta["meta_keywords"],
                }.items():
                    translations[f"{field}_{article.id}"] = value
                for tag, localized_name in zip(tag_objects, meta["localized_tags"]):
                    translations[f"tag_{tag.id}"] = localized_name
                if not translation_service._save_translations_to_file("article", language, translations):
                    raise OSError(f"Could not save {language} article translations")

            AluminumBlogTopic.objects.create(
                slug=SLUG,
                title=title,
                primary_keyword=KEYWORD,
                status="published",
                article=article,
                notes="Buyer guide comparing anodizing, powder coating, and woodgrain finish selection; four languages and two optimized photos.",
            )

        self.stdout.write(self.style.SUCCESS(f"Published {SLUG} in en, zh, es and pt (article {article.id})"))
