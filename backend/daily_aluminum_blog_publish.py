#!/usr/bin/env python3
import base64
import json
import os
import re
import sys
import uuid
from datetime import datetime
from pathlib import Path
from urllib import request

import django
from django.core.files import File
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "aluminum.settings")
django.setup()

from apps.news.models import AluminumBlogTopic, Article  # noqa: E402

API_KEY = os.getenv("GRSAI_API_KEY") or os.getenv("OPENAI_API_KEY", "")
API_URL = os.getenv("GRSAI_API_URL", "https://api.openai.com/v1/images/generations")
SITE_URL = "https://lingyealu.cn"
MEDIA_DIR = BASE_DIR / "media" / "articles"
MEDIA_DIR.mkdir(parents=True, exist_ok=True)


def make_slug(title: str) -> str:
    base = slugify(title)[:190] or f"aluminum-blog-{uuid.uuid4().hex[:8]}"
    slug = base
    i = 2
    while Article.objects.filter(slug=slug).exists():
        suffix = f"-{i}"
        slug = f"{base[:200-len(suffix)]}{suffix}"
        i += 1
    return slug


def generate_article(topic_title: str, keyword: str) -> dict:
    kw = keyword.strip() or "aluminum profile"
    title = topic_title.strip()

    sections = [
        ("Market context and why this topic matters", 190),
        ("How aluminum profile design affects performance", 210),
        ("Material, temper, and surface treatment decisions", 210),
        ("Extrusion process controls and dimensional consistency", 210),
        ("Factory quality control workflow for export orders", 190),
        ("RFQ checklist for buyers and project engineers", 220),
    ]

    paragraphs = []
    total_words = 0
    for idx, (h2, target_words) in enumerate(sections, 1):
        body = (
            f"<h2>{idx}. {h2}</h2>"
            f"<p>{kw.title()} projects succeed when teams define engineering targets before price comparison. "
            "For aluminum profiles, key variables include section geometry, wall thickness, tolerance bands, and post-processing requirements. "
            "Buyers that start with a clear requirement matrix can align suppliers on the same baseline, reduce design drift, and avoid hidden rework. "
            "In practical sourcing, this means turning concept drawings into measurable acceptance criteria and linking those criteria to production checkpoints. "
            "When the supplier and buyer validate the same checkpoints, lead-time risk drops and installation reliability improves across batches. "
            "This discipline is especially important for overseas orders where replacement cycles are slow and freight cost is high.</p>"
            "<p>From an execution standpoint, aluminum profile manufacturing is not only about running an extrusion press. "
            "It is an integrated flow that includes die engineering, billet quality verification, process window control, straightening, aging, surface treatment, and shipment protection. "
            "Each stage influences the final fit, finish, and field performance. "
            "For this reason, experienced buyers ask for process evidence instead of relying on one perfect sample. "
            "They review traceability records, in-line dimensional inspection frequency, and nonconformance handling rules. "
            "A supplier capable of transparent data sharing typically delivers more stable output, which protects project schedules and reduces claim rates.</p>"
        )
        words = len(re.findall(r"[A-Za-z0-9'-]+", re.sub(r"<[^>]+>", " ", body)))
        if words < target_words:
            extra = (
                "<p>Another practical point is communication speed during engineering changes. "
                "When profile geometry is revised, the supplier should quickly assess die impact, unit cost shift, and timeline implications, then return a controlled revision plan. "
                "Fast, structured feedback helps procurement teams keep momentum while preserving technical integrity. "
                "Over the full project lifecycle, this responsiveness often matters as much as headline unit price because it prevents cascading delays in fabrication and site installation.</p>"
            )
            body += extra
            words += len(re.findall(r"[A-Za-z0-9'-]+", re.sub(r"<[^>]+>", " ", extra)))
        paragraphs.append(body)
        total_words += words

    faq = f"""
<h2>FAQs</h2>
<h3>1) What information should I include in an RFQ for {kw}?</h3>
<p>Include profile drawings, alloy and temper, surface treatment target, tolerance requirements, order quantity by phase, and destination port. This allows accurate costing and realistic lead-time planning.</p>
<h3>2) Which alloy and temper are most common for architectural profiles?</h3>
<p>6063-T5 and 6063-T6 are common because they balance extrudability, appearance quality, and mechanical performance. The final choice should match load and corrosion requirements.</p>
<h3>3) How can buyers reduce dimensional inconsistency risk?</h3>
<p>Use first-article approval, define sampling rules for in-process inspection, and request batch traceability records. Stable die maintenance and process control are critical for repeatability.</p>
<h3>4) What is the best way to validate supplier quality before mass order?</h3>
<p>Start with a pilot lot and perform joint inspection on dimensions, finish, and packaging. Convert findings into written acceptance criteria for the production contract.</p>
<h2>Request for Quotation (RFQ)</h2>
<p>Planning a {kw} project? Send your drawing, alloy and temper requirement, finish standard, quantity, and delivery window to LingYe Aluminum. Our engineering team will return a practical quotation, production plan, and QC checkpoints for your approval.</p>
"""
    content = f"<h1>{title}</h1>" + "".join(paragraphs) + faq
    excerpt = (
        f"A practical buyer guide to {kw}, covering cross-section design, extrusion controls, quality inspection, and RFQ planning for stable delivery."
    )

    words_final = len(re.findall(r"[A-Za-z0-9'-]+", re.sub(r"<[^>]+>", " ", content)))
    if words_final < 1200:
        raise RuntimeError(f"Generated article below 1200 words: {words_final}")

    meta_title = f"{title[:58]} | Aluminum Profile Guide"
    meta_description = (
        f"Learn how to source {kw} with confidence: profile design, extrusion details, factory QC, and RFQ tips for reliable aluminum supply."
    )[:190]
    meta_keywords = ", ".join(
        [kw, "aluminum profile", "aluminum extrusion", "factory QC", "RFQ", "LingYe Aluminum"]
    )[:199]

    return {
        "title": title,
        "content": content,
        "excerpt": excerpt,
        "meta_title": meta_title,
        "meta_description": meta_description,
        "meta_keywords": meta_keywords,
        "word_count": words_final,
    }


def call_image_api(prompt: str) -> bytes:
    if not API_KEY:
        raise RuntimeError("Missing GRSAI/OpenAI API key")

    payload = {
        "model": "gpt-image-1",
        "prompt": prompt,
        "size": "1536x1024",
        "quality": "high",
        "response_format": "b64_json",
    }
    data = json.dumps(payload).encode("utf-8")
    req = request.Request(
        API_URL,
        data=data,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with request.urlopen(req, timeout=120) as resp:
        raw = resp.read().decode("utf-8")
    obj = json.loads(raw)
    if not obj.get("data"):
        raise RuntimeError(f"Image API empty response: {raw[:300]}")
    b64 = obj["data"][0].get("b64_json")
    if not b64:
        raise RuntimeError(f"Image API missing b64_json: {raw[:300]}")
    return base64.b64decode(b64)


def generate_images(slug: str) -> list[str]:
    prompts = [
        "Ultra-detailed industrial photo of aluminum profile cross-sections and extrusion die details on a clean inspection table, metallic texture, accurate geometry, manufacturing realism, no text, no watermark",
        "Wide-angle modern aluminum extrusion factory line with conveyors and QC inspection station, engineers checking profile dimensions, bright neutral lighting, photorealistic, no text, no watermark",
    ]

    saved = []
    for idx, prompt in enumerate(prompts, 1):
        img_bytes = call_image_api(prompt)
        filename = f"{slug}-ai-{idx}.png"
        filepath = MEDIA_DIR / filename
        with open(filepath, "wb") as f:
            f.write(img_bytes)
        saved.append(str(filepath))
    return saved


def publish() -> dict:
    with transaction.atomic():
        topic = (
            AluminumBlogTopic.objects.select_for_update()
            .filter(status="pending")
            .order_by("priority", "id")
            .first()
        )
        if not topic:
            return {"status": "exhausted", "message": "topic pool exhausted"}

        topic.status = "processing"
        topic.save(update_fields=["status", "updated_at"])

    try:
        keyword = topic.primary_keyword or topic.title
        article_data = generate_article(topic.title, keyword)
        slug = make_slug(article_data["title"])
        image_paths = generate_images(slug)

        article, created = Article.objects.get_or_create(
            slug=slug,
            defaults={
                "title": article_data["title"],
                "content": article_data["content"],
                "excerpt": article_data["excerpt"],
                "status": "published",
                "meta_title": article_data["meta_title"],
                "meta_description": article_data["meta_description"],
                "meta_keywords": article_data["meta_keywords"],
                "published_at": timezone.now(),
            },
        )

        if not created:
            article.title = article_data["title"]
            article.content = article_data["content"]
            article.excerpt = article_data["excerpt"]
            article.status = "published"
            article.meta_title = article_data["meta_title"]
            article.meta_description = article_data["meta_description"]
            article.meta_keywords = article_data["meta_keywords"]
            article.published_at = article.published_at or timezone.now()

        with open(image_paths[0], "rb") as f:
            article.featured_image.save(Path(image_paths[0]).name, File(f), save=False)
        article.save()

        topic.article = article
        topic.status = "published"
        topic.save(update_fields=["article", "status", "updated_at"])

        return {
            "status": "ok",
            "topic": topic.title,
            "slug": article.slug,
            "url": f"{SITE_URL}/news/{article.slug}/",
            "image_paths": image_paths,
            "published_at": article.published_at.astimezone().isoformat(),
            "word_count": article_data["word_count"],
        }
    except Exception as exc:
        AluminumBlogTopic.objects.filter(id=topic.id).update(status="pending")
        return {
            "status": "failed",
            "topic": topic.title,
            "reason": str(exc),
        }


if __name__ == "__main__":
    result = publish()
    print(json.dumps(result, ensure_ascii=True))
