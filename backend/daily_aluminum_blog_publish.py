#!/usr/bin/env python3
import base64
import io
import json
import os
import re
import sys
import time
import uuid
from datetime import datetime
from pathlib import Path

import django
import requests
from django.core.files import File
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "aluminum.settings")
django.setup()

from apps.news.models import AluminumBlogTopic, Article  # noqa: E402

GRSAI_API_KEY = os.getenv("GRSAI_API_KEY") or os.getenv("OPENAI_API_KEY", "")
GRSAI_BASE_URL = (os.getenv("GRSAI_BASE_URL") or "https://grsaiapi.com").rstrip("/")
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


def call_image_api_grsai(prompt: str) -> bytes:
    if not GRSAI_API_KEY:
        raise RuntimeError("Missing GRSAI API key")
    headers = {"Authorization": f"Bearer {GRSAI_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": "nano-banana-fast",
        "prompt": f"{prompt}\n\nNegative prompt: text, watermark, logo, blurry, low quality, distorted",
        "aspectRatio": "16:9",
        "shutProgress": True,
    }
    resp = requests.post(f"{GRSAI_BASE_URL}/v1/draw/nano-banana", headers=headers, json=payload, timeout=(10, 120))
    resp.raise_for_status()

    text = resp.text.strip()
    data_lines = []
    for line in text.splitlines():
        line = line.strip()
        if line.startswith("data:"):
            payload_line = line[5:].strip()
            if payload_line and payload_line not in ("[DONE]", "DONE"):
                data_lines.append(payload_line)
    candidate = json.loads(data_lines[-1] if data_lines else text)
    task_id = candidate.get("id") or (candidate.get("data") or {}).get("id") or candidate.get("taskId")
    status = (candidate.get("status") or (candidate.get("data") or {}).get("status") or "").lower()
    if status == "succeeded":
        urls = [x.get("url") for x in (candidate.get("results") or []) if isinstance(x, dict) and x.get("url")]
        if urls:
            raw = requests.get(urls[0], timeout=30).content
            return _resize_and_compress(raw)
    if not task_id:
        raise RuntimeError("No GrsAI task id")
    for _ in range(60):
        time.sleep(2)
        r2 = requests.post(f"{GRSAI_BASE_URL}/v1/draw/result", headers=headers, json={"id": task_id}, timeout=30)
        r2.raise_for_status()
        d2 = r2.json()
        status = (d2.get("status") or (d2.get("data") or {}).get("status") or "").lower()
        if status == "succeeded":
            urls = [x.get("url") for x in ((d2.get("results") or (d2.get("data") or {}).get("results") or [])) if isinstance(x, dict) and x.get("url")]
            if not urls:
                raise RuntimeError("GrsAI finished without image url")
            raw = requests.get(urls[0], timeout=30).content
            return _resize_and_compress(raw)
        if status in ("failed", "error", "cancelled", "canceled"):
            raise RuntimeError(f"GrsAI image failed: {status}")
    raise RuntimeError("GrsAI image timeout")


def _resize_and_compress(raw: bytes, max_width: int = 1536, quality: int = 82) -> bytes:
    img = Image.open(io.BytesIO(raw)).convert("RGB")
    if img.width > max_width:
        ratio = max_width / img.width
        img = img.resize((max_width, int(img.height * ratio)), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, "WEBP", quality=quality, method=6)
    return buf.getvalue()


def generate_images(slug: str, count: int = 4) -> list[str]:
    all_prompts = [
        "Ultra-detailed industrial photo of aluminum profile cross-sections and extrusion die details on a clean inspection table, metallic texture, accurate geometry, manufacturing realism, no text, no watermark",
        "Wide-angle modern aluminum extrusion factory line with conveyors and QC inspection station, engineers checking profile dimensions, bright neutral lighting, photorealistic, no text, no watermark",
        "Close-up of aluminum billet preparation area in extrusion plant, raw aluminum ingots being loaded, industrial setting, sharp focus, no text, no watermark",
        "Photorealistic aluminum surface treatment facility with anodizing tanks and powder coating line, organized wet area with reflective surfaces, professional industrial photography, no text, no watermark",
        "Factory floor quality control inspectors using digital measurement tools to check aluminum profile tolerances, calipers and gauges visible, bright workshop lighting, no text, no watermark",
        "Stacked and shrink-wrapped aluminum profiles ready for container shipping, wooden pallets, protective corner guards, logistics warehouse background, no text, no watermark",
    ]
    selected_prompts = all_prompts[:count]

    saved = []
    for idx, prompt in enumerate(selected_prompts, 1):
        img_bytes = call_image_api_grsai(prompt)
        img_bytes = _resize_and_compress(img_bytes)
        filename = f"{slug}-ai-{idx}.webp"
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
        image_paths = generate_images(slug, count=5)

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

        # Save all images into content at section boundaries
        img_alt_map = [
            "Aluminum Profile Cross-Sections and Die Details",
            "Modern Aluminum Extrusion Production Line",
            "Aluminum Billet Preparation for Extrusion",
            "Surface Treatment - Anodizing and Powder Coating",
            "Quality Control Inspection of Aluminum Profiles",
            "Packaged Aluminum Profiles Ready for Shipping",
        ]

        content = article.content
        # Split content into parts by h2 headings to find insertion points
        h2_pattern = re.compile(r'<h2>\d+\.\s.*?</h2>')
        parts = h2_pattern.split(content)

        # Insert images after each major section (between h2 blocks)
        img_insert_positions = []
        for i, part in enumerate(parts):
            if i < len(image_paths):
                img_rel = f"/media/articles/{Path(image_paths[i]).name}"
                img_tag = f'<p style="text-align:center;margin:30px 0"><img src="{img_rel}" alt="{img_alt_map[i]}" style="max-width:100%;height:auto;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);"></p>'
                img_insert_positions.append((part, img_tag))

        # Rebuild content: insert images after each h2 section, keeping FAQ/RFQ at end
        # Find where FAQs start
        faq_start = content.find("<h2>FAQs</h2>")
        if faq_start == -1:
            faq_start = content.find("Request for Quotation")

        main_content = content[:faq_start] if faq_start > 0 else content
        faq_section = content[faq_start:] if faq_start > 0 else ""

        # Split main content into h2 sections
        h2_matches = list(re.finditer(r'<h2>[\d\.]+\s[^<]+</h2>', main_content))
        if h2_matches:
            # Insert images between h2 sections
            final_sections = []
            for i, match in enumerate(h2_matches):
                start = match.start()
                end = match.end()
                header = main_content[start:end]

                # Get text between previous h2 header and this one
                prev_end = end
                if i == 0:
                    # Content before first h2 (the <h1> title)
                    intro = main_content[:start]
                    final_sections.append(intro)
                    # Insert featured image after intro
                    if image_paths:
                        img_rel = f"/media/articles/{Path(image_paths[0]).name}"
                        img_tag = f'<div style="margin:24px 0;text-align:center;"><img src="{img_rel}" alt="{img_alt_map[0]}" style="max-width:100%;height:auto;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);"></div>'
                        final_sections.append(img_tag)

                # Get body text between current header and next header
                if i + 1 < len(h2_matches):
                    next_match = h2_matches[i + 1]
                    body_text = main_content[end:next_match.start()]
                    body_and_header = header + body_text
                    final_sections.append(body_and_header)

                    # Insert image after each section (except the last one before FAQ)
                    if i + 2 < len(image_paths):
                        img_idx = i + 1
                        img_rel = f"/media/articles/{Path(image_paths[img_idx]).name}"
                        img_tag = f'<div style="margin:24px 0;text-align:center;"><img src="{img_rel}" alt="{img_alt_map[img_idx]}" style="max-width:100%;height:auto;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);"></div>'
                        final_sections.append(img_tag)
                else:
                    # Last h2 section - get to end of main content
                    body_text = main_content[end:faq_start]
                    final_sections.append(header + body_text)

                # Also handle content between last h2 and FAQ
                if i == len(h2_matches) - 1 and faq_section:
                    pass  # already handled above

            final_content = "".join(final_sections)
            if faq_section:
                final_content += faq_section
            content = final_content

        # Set featured image from first generated image
        if image_paths:
            first_img_name = Path(image_paths[0]).name
            with open(image_paths[0], "rb") as f:
                article.featured_image.save(first_img_name, File(f), save=False)

        article.content = content
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
