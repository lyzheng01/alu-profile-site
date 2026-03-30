#!/usr/bin/env python3
import os
import sys
import django
from django.utils.text import slugify

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aluminum.settings')
django.setup()

from apps.news.models import AluminumBlogTopic


def build_topics(limit: int = 200):
    intents = [
        "Supplier Guide",
        "Manufacturer Checklist",
        "OEM Buying Guide",
        "Procurement Playbook",
        "Importer FAQ",
    ]

    products = [
        "Aluminum Profiles",
        "Industrial Aluminum Extrusions",
        "Architectural Aluminum Sections",
        "Door and Window Aluminum Profiles",
        "Aluminum Tile Trims",
        "Aluminum Skirting Profiles",
        "Custom Aluminum Profiles",
        "Anodized Aluminum Profiles",
        "Powder Coated Aluminum Profiles",
        "6063 T5 Aluminum Profiles",
    ]

    angles = [
        "for Construction Projects",
        "for Wholesale Buyers",
        "for OEM Orders",
        "for Import Procurement",
        "for Large-Scale Projects",
        "for Coastal Applications",
        "for Commercial Buildings",
        "for Residential Developments",
        "for Fast Delivery Planning",
        "for Quality Control",
    ]

    topics = []
    for intent in intents:
        for product in products:
            for angle in angles:
                title = f"{product} {intent} {angle}"
                keyword = product.lower()
                topics.append((title, keyword))
                if len(topics) >= limit:
                    return topics
    return topics


def main():
    target = 200
    topics = build_topics(limit=target)
    created = 0
    existed = 0

    for idx, (title, keyword) in enumerate(topics, start=1):
        slug = slugify(title)[:255]
        _, is_created = AluminumBlogTopic.objects.get_or_create(
            slug=slug,
            defaults={
                'title': title,
                'primary_keyword': keyword,
                'status': 'pending',
                'priority': idx,
                'notes': 'Auto seeded topic pool for scheduled daily publishing.',
            },
        )
        if is_created:
            created += 1
        else:
            existed += 1

    total = AluminumBlogTopic.objects.count()
    pending = AluminumBlogTopic.objects.filter(status='pending').count()
    print(f"OK: seeded={len(topics)}, created={created}, existed={existed}, total={total}, pending={pending}")


if __name__ == '__main__':
    main()
