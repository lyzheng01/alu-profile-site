"""Publish the reviewed four-language extrusion drawing guide to LingYe Aluminum."""

import html
import re
import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from apps.news.models import AluminumBlogTopic, Article, Tag
from apps.products.services import translation_service
from apps.news.management.commands.publish_thermal_break_window_rfq_guide import render_markdown


SLUG = "aluminum-extrusion-drawing-tolerances"
BASE_NAME = "2026-10-16-aluminum-extrusion-drawing-tolerances"
KEYWORD = "aluminum extrusion drawing tolerances"
ROOT = Path(settings.BASE_DIR).parent
LANGUAGES = {
    "en": {
        "title": "3 Checks to Mark on an Aluminum Extrusion Drawing Before You Request a Quote",
        "excerpt": "Separate cross-section fit dimensions, straightness and twist. This visual guide includes a copy-ready RFQ note.",
        "meta_title": "Aluminum Extrusion Drawing Tolerances: 3 Checks",
        "meta_description": "Separate fit dimensions, straightness and twist on your aluminum extrusion drawing. See four visuals and copy a practical RFQ note.",
        "meta_keywords": "aluminum extrusion drawing tolerances, extrusion straightness, profile twist, aluminum profile drawing, extrusion inspection",
        "tags": ("Aluminium Extrusion", "RFQ", "Engineering"),
        "localized_tags": ("Aluminium Extrusion", "RFQ", "Engineering"),
    },
    "zh": {
        "excerpt": "把铝型材截面配合尺寸、直线度和扭拧度分开标注。附四张图解和可直接复制的询价备注。",
        "meta_title": "铝型材图纸公差：询价前先标清这3项",
        "meta_description": "了解铝型材截面尺寸、直线度与扭拧度的区别，查看检测图解，并复制实用的询价备注模板。",
        "meta_keywords": "铝型材图纸公差，铝型材直线度，型材扭拧度，铝型材检测，铝型材询价",
        "localized_tags": ("铝型材", "询价", "工程技术"),
    },
    "es": {
        "excerpt": "Separa las cotas de ajuste de la sección, la rectitud y la torsión. Incluye cuatro imágenes y una nota RFQ lista para copiar.",
        "meta_title": "Tolerancias de extrusión de aluminio: 3 controles",
        "meta_description": "Separa ajuste, rectitud y torsión en el plano del perfil. Consulta cuatro imágenes y copia una nota práctica para solicitar cotización.",
        "meta_keywords": "tolerancias de extrusión de aluminio, rectitud de perfiles, torsión de perfiles, plano de perfil de aluminio, inspección",
        "localized_tags": ("Perfiles de aluminio", "Solicitud de cotización", "Ingeniería"),
    },
    "pt": {
        "excerpt": "Separe as dimensões de encaixe da seção, a retilineidade e a torção. Inclui quatro imagens e uma nota de cotação pronta para copiar.",
        "meta_title": "Tolerâncias de extrusão de alumínio: 3 verificações",
        "meta_description": "Separe encaixe, retilineidade e torção no desenho do perfil. Veja quatro imagens e copie uma nota prática para solicitar cotação.",
        "meta_keywords": "tolerâncias de extrusão de alumínio, retilineidade de perfil, torção de perfil, desenho de perfil de alumínio, inspeção",
        "localized_tags": ("Perfis de alumínio", "Cotação", "Engenharia"),
    },
}
IMAGE_ALLOWLIST = {
    "extrusion-tolerance-inspection-photo.png",
    "extrusion-tolerance-checks.svg",
    "extrusion-fit-dimensions.svg",
    "extrusion-straightness-twist-measurement.svg",
}


def read_localized_draft(language):
    suffix = "" if language == "en" else f"-{language}"
    path = ROOT / "docs" / "blog-drafts" / f"{BASE_NAME}{suffix}.md"
    source = path.read_text(encoding="utf-8")
    lines = source.splitlines()
    title_match = next((re.match(r"^#\s+(.+)$", line) for line in lines if line.startswith("# ")), None)
    if not title_match:
        raise ValueError(f"Missing article title: {path}")

    content_lines = []
    index = 0
    image_count = 0
    while index < len(lines):
        line = lines[index]
        if line.startswith("# "):
            index += 1
            continue
        if line.startswith(("**Status:**", "**状态：**", "**Estado:**", "**SEO title:**", "**Meta description:**", "**Images:**", "**建议链接：**")):
            index += 1
            continue
        image = re.fullmatch(r"!\[([^\]]+)\]\((/images/[^)]+)\)", line.strip())
        if image:
            alt, image_path = image.groups()
            name = image_path.rsplit("/", 1)[-1]
            if name not in IMAGE_ALLOWLIST:
                raise ValueError(f"Image is not approved for this article: {image_path}")
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

    if image_count != 4:
        raise ValueError(f"Expected four editorial images in {language}; found {image_count}")
    rendered = render_markdown("\n".join(content_lines))
    if rendered.count("<figure>") != 4 or "![" in rendered:
        raise ValueError(f"Image rendering failed for {language}")
    return title_match.group(1), rendered


class Command(BaseCommand):
    help = "Publish the reviewed aluminum extrusion drawing tolerance guide in en, zh, es and pt."

    @transaction.atomic
    def handle(self, *args, **options):
        localized = {language: read_localized_draft(language) for language in LANGUAGES}
        photo = ROOT / "frontend" / "public" / "images" / "extrusion-tolerance-inspection-photo.png"
        if not photo.is_file():
            raise FileNotFoundError(f"Missing featured image: {photo}")

        title, content = localized["en"]
        metadata = LANGUAGES["en"]
        article, _ = Article.objects.update_or_create(
            slug=SLUG,
            defaults={
                "title": title,
                "content": content,
                "excerpt": metadata["excerpt"],
                "status": "published",
                "is_featured": False,
                "meta_title": metadata["meta_title"],
                "meta_description": metadata["meta_description"],
                "meta_keywords": metadata["meta_keywords"],
            },
        )

        cover_name = f"{SLUG}.png"
        media_dir = Path(settings.MEDIA_ROOT) / "articles"
        media_dir.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(photo, media_dir / cover_name)
        article.featured_image.name = f"articles/{cover_name}"

        base_tags = LANGUAGES["en"]["tags"]
        tag_objects = []
        for tag_name in base_tags:
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

        AluminumBlogTopic.objects.update_or_create(
            slug=SLUG,
            defaults={
                "title": title,
                "primary_keyword": KEYWORD,
                "status": "published",
                "article": article,
                "notes": "Visual buyer guide; separates cross-section fit dimensions, straightness and twist; localized in four languages.",
            },
        )
        self.stdout.write(self.style.SUCCESS(f"Published {SLUG} in en, zh, es and pt (article {article.id})"))
