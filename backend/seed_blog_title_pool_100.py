#!/usr/bin/env python3
import os
import sys
import django
from django.utils.text import slugify

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aluminum.settings')
django.setup()

from apps.news.models import Article, Tag

TITLES = [
    "How to Choose an Aluminum Profile Supplier for Construction Projects",
    "Industrial Aluminum Extrusion Manufacturer in China: What Buyers Should Check",
    "Custom Aluminum Profile Factory for OEM Orders: Full Buying Guide",
    "6063 T5 vs 6061 Aluminum Profiles: Which One Fits Your Project?",
    "Anodized vs Powder Coated Aluminum Profiles: Cost, Durability, and Use Cases",
    "Aluminum Tile Trim Supplier Guide for Wholesale Buyers",
    "Door and Window Aluminum Profile Manufacturer Selection Checklist",
    "MOQ, Lead Time, and Packaging: What Importers Need to Confirm Before Ordering",
    "Common Surface Treatments for Aluminum Profiles and Their Applications",
    "How to Reduce Defects in Aluminum Extrusion Procurement",
    "Aluminum Skirting Profile Manufacturer: Product Specs and Buyer FAQs",
    "How to Request a Fast and Accurate Aluminum Profile Quotation",
    "T5 vs T6 Temper in Aluminum Profiles: Mechanical Difference Explained",
    "Export Packaging Standards for Aluminum Profiles in Sea Shipment",
    "Architectural Aluminum Section Supplier: Key Specs for Facade Projects",
    "How to Evaluate a China Aluminum Profile Factory Before Mass Orders",
    "Aluminum Extrusion Tolerance Basics for Engineering Buyers",
    "Top 10 Questions to Ask Before Placing an OEM Aluminum Profile Order",
    "How to Match Alloy, Temper, and Finish for Outdoor Applications",
    "Aluminum Profile Procurement Timeline: From Drawing to Delivery",
    "Best Aluminum Profiles for Curtain Wall Systems",
    "How to Select Aluminum Profiles for Commercial Doors",
    "Aluminum Profile Quality Inspection Checklist for Importers",
    "Why Construction Buyers Prefer 6063 Aluminum Profiles",
    "How to Compare Aluminum Profile Quotes Across Suppliers",
    "How to Avoid Color Variation in Powder Coated Aluminum Profiles",
    "Anodizing Thickness Standards for Architectural Aluminum",
    "What Makes a Reliable Aluminum Profile Export Supplier",
    "Factory Audit Checklist for Aluminum Extrusion Suppliers",
    "How to Plan Safety Stock for Aluminum Profile Projects",
    "Aluminum Profile Applications in Modern Interior Design",
    "How to Source Aluminum Profiles for Hotel Projects",
    "How to Source Aluminum Profiles for Residential Projects",
    "How to Source Aluminum Profiles for Office Buildings",
    "Common Mistakes in Aluminum Profile Supplier Selection",
    "How to Reduce Procurement Cost for Aluminum Extrusions",
    "Aluminum Extrusion Dies: Design, Cost, and Lead Time",
    "How to Handle Urgent Aluminum Profile Orders",
    "Aluminum Profile Surface Defects and Root Causes",
    "How to Build Long-Term Partnerships with Aluminum Suppliers",
    "Global Aluminum Profile Market Trends in 2026",
    "What Importers Should Know About Aluminum Alloy Standards",
    "How to Choose the Right Finish for Aluminum Window Profiles",
    "How to Choose the Right Finish for Aluminum Door Profiles",
    "Can Aluminum Profiles Be Customized for Small MOQ Orders?",
    "How to Improve On-Time Delivery in Aluminum Profile Procurement",
    "Aluminum Profile Supplier KPI Framework for Procurement Teams",
    "How to Create RFQ Documents for Aluminum Extrusion Projects",
    "Aluminum Profile Logistics: Container Loading Best Practices",
    "How to Prevent Shipping Damage for Aluminum Profiles",
    "How to Verify Aluminum Profile Certificates and Test Reports",
    "Aluminum Profile Buying Guide for Distributors",
    "How to Select Aluminum Profiles for Solar Mounting Systems",
    "Aluminum Profile Buying Guide for Engineering Contractors",
    "What Is the Difference Between Mill Finish and Anodized Profiles",
    "How to Choose Aluminum Profiles for High Humidity Environments",
    "Best Aluminum Profile Options for Coastal Construction Projects",
    "How to Control Rework Risk in Aluminum Profile Orders",
    "Aluminum Profile Supplier Communication Checklist",
    "How to Improve Sample Approval Speed for Custom Profiles",
    "How to Choose Aluminum Profiles for Retail Store Fit-Out",
    "How to Select Decorative Aluminum Profiles for Interior Projects",
    "What Is a Good Lead Time for Custom Aluminum Extrusions?",
    "How to Balance Cost and Quality in Aluminum Profile Sourcing",
    "Aluminum Profile Supplier Scorecard Template",
    "How to Source Aluminum Profiles for Healthcare Buildings",
    "How to Source Aluminum Profiles for Education Facilities",
    "Aluminum Profile Extrusion Process Explained for Buyers",
    "What Buyers Should Know About Aluminum Profile Straightness",
    "How to Choose Aluminum Profiles for Large-Scale Renovation",
    "Aluminum Profile Packaging Types: Which One Is Right for Export?",
    "How to Reduce Claims in Aluminum Profile Imports",
    "How to Build a Backup Supplier Plan for Aluminum Profiles",
    "Top Surface Finish Choices for Architectural Aluminum in 2026",
    "How to Choose Aluminum Profiles for Public Infrastructure Projects",
    "How to Evaluate Capacity Claims from Aluminum Suppliers",
    "How to Create Technical Drawings for Aluminum Profile RFQ",
    "How to Choose a Supplier for Precision Aluminum Profiles",
    "Aluminum Profile Selection Guide for Procurement Beginners",
    "How to Manage Multi-Batch Aluminum Profile Deliveries",
    "How to Standardize Aluminum Profile Specifications Across Projects",
    "What Is the Best Alloy for Decorative Aluminum Profiles?",
    "How to Source Aluminum Profiles with Stable Color Consistency",
    "How to Choose Aluminum Profiles for Fire-Rated Applications",
    "How to Select Reliable Aluminum Profile Suppliers in Peak Season",
    "How to Build Annual Contracts with Aluminum Profile Factories",
    "What Affects Aluminum Extrusion Pricing Most?",
    "How to Prepare for Supplier Factory Visits in China",
    "How to Ensure Traceability in Aluminum Profile Procurement",
    "How to Evaluate New Aluminum Profile Suppliers Quickly",
    "Aluminum Profile FAQ for First-Time Import Buyers",
    "How to Select Aluminum Profiles for Smart Building Projects",
    "How to Source Green and Recyclable Aluminum Profiles",
    "How to Compare Anodizing Suppliers for Construction Profiles",
    "How to Improve RFQ Response Rate from Aluminum Factories",
    "How to Build a Monthly Procurement Plan for Aluminum Profiles",
    "How to Choose the Right Aluminum Profile Supplier for Long-Term Projects",
    "How to Create a Quality Agreement with Aluminum Profile Suppliers",
    "How to Choose Aluminum Profiles for Premium Residential Projects",
    "How to Build an Efficient Approval Workflow for Profile Samples",
]


def main():
    plan_tag, _ = Tag.objects.get_or_create(name='Content Plan', defaults={'slug': 'content-plan'})

    created = 0
    existed = 0
    for idx, title in enumerate(TITLES, start=1):
        slug = slugify(title)
        article, is_created = Article.objects.get_or_create(
            slug=slug,
            defaults={
                'title': title,
                'content': '<p>Content to be generated by daily automation.</p>',
                'excerpt': f'Draft title pool item #{idx} for scheduled blog publishing.',
                'status': 'draft',
                'is_featured': False,
                'meta_title': title[:200],
                'meta_description': f'Draft: {title}'[:500],
                'meta_keywords': 'aluminum profile, aluminum extrusion',
            },
        )
        article.tags.add(plan_tag)
        if is_created:
            created += 1
        else:
            existed += 1

    print(f'OK: total={len(TITLES)}, created={created}, existed={existed}')


if __name__ == '__main__':
    main()
