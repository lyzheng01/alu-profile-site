#!/usr/bin/env python
"""
Create a NEWS article: "Aluminum Profiles 101: Fundamental Overview and Key Application Fields"
for SEO about basic introduction & application fields of aluminum profiles.
"""
import os
import sys
import django
from django.utils import timezone
from django.utils.text import slugify

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aluminum.settings')
django.setup()

from apps.news.models import Article, Tag  # noqa: E402


def get_or_create_tags():
    tag_names = [
        'Aluminum Profiles',
        'Aluminum Extrusion',
        'Industrial Aluminum',
        'Construction Materials',
        'Transportation Solutions',
        'Manufacturing Technology',
    ]
    tags = []
    for name in tag_names:
        slug = slugify(name)
        tag, created = Tag.objects.get_or_create(
            name=name,
            defaults={"slug": slug},
        )
        tags.append(tag)
        print(f"{'[NEW ]' if created else '[EXIST]'} Tag: {name} ({slug})")
    return tags


def create_article():
    title = "Aluminum Profiles 101: Fundamental Overview and Key Application Fields"
    slug = slugify(title)

    # avoid duplicate
    article, created = Article.objects.get_or_create(
        slug=slug,
        defaults={
            "title": title,
            "content": "",
        },
    )
    if not created:
        print(f"Article already exists: id={article.id}, slug={article.slug}")
        return article

    excerpt = (
        "Gain a comprehensive understanding of aluminum profiles, including their properties, "
        "extrusion process, finishing methods, and the major industries that rely on them. "
        "This SEO-friendly article explains why aluminum profiles are vital for modern construction, "
        "transportation, consumer products, and industrial automation."
    )

    # HTML content copied from docs/aluminum-profile-intro-news-article.md
    content = """<h1>Aluminum Profiles 101: Fundamental Overview and Key Application Fields</h1>

<p>Aluminum profiles, also known as aluminum extrusions, are engineered cross-sectional shapes made from high-quality aluminum alloys. Their strength-to-weight ratio, excellent corrosion resistance, and design flexibility make them a preferred material for thousands of structural and decorative applications. This article explains how aluminum profiles are produced, highlights their core advantages, and explores the industries that benefit the most from this versatile material.</p>

<h2>Understanding the Aluminum Extrusion Process</h2>

<p>The extrusion process begins with heating a cylindrical aluminum billet and forcing it through a precision die that matches the desired profile shape. Modern extrusion presses, CNC-controlled tooling, and automated handling systems deliver consistent dimensional accuracy while maintaining tight tolerances. Manufacturers often supplement extrusion with machining, drilling, tapping, punching, welding, and assembly to deliver finished components.</p>

<h3>Popular Aluminum Alloys and Tempers</h3>

<ul>
<li><strong>6063-T5/T6:</strong> Widely used for architectural profiles, curtain walls, and interior design elements thanks to its superior surface finish.</li>
<li><strong>6061-T6:</strong> Preferred for structural and mechanical applications that require higher strength.</li>
<li><strong>6005/6082:</strong> Frequently chosen for transportation, mechanical equipment, and load-bearing frames.</li>
</ul>

<h2>Key Advantages of Aluminum Profiles</h2>

<ul>
<li><strong>Lightweight yet strong:</strong> Aluminum weighs roughly one-third as much as steel, enabling easier handling and reduced shipping costs.</li>
<li><strong>Corrosion resistant:</strong> The natural oxide layer protects the surface, while anodizing and powder coating deliver additional protection.</li>
<li><strong>Excellent thermal and electrical conductivity:</strong> Ideal for heat sinks, LED housings, and electrical enclosures.</li>
<li><strong>Design versatility:</strong> Extrusions can incorporate multiple functions—channels, ribs, flanges, and decorative elements—within a single piece.</li>
<li><strong>Recyclable and sustainable:</strong> Aluminum retains its properties through repeated recycling, supporting circular-economy initiatives.</li>
</ul>

<h2>Major Application Fields</h2>

<h3>1. Building and Construction</h3>

<p>Architects and contractors rely on aluminum profiles for window frames, doors, curtain walls, façades, skylights, handrails, and shading systems. Extrusions deliver sleek aesthetics, tight tolerances, and weather resistance, helping projects achieve LEED and other green-building certifications.</p>

<h3>2. Transportation and Mobility</h3>

<p>Lightweight profiles lower the overall mass of vehicles, improving energy efficiency and extending driving range. Common applications include electric vehicle battery trays, bus and rail body structures, truck trailers, marine vessels, and aerospace components.</p>

<h3>3. Industrial Equipment and Automation</h3>

<p>Factory layouts, machine guards, workstations, conveyors, and robotic cells all benefit from modular aluminum profile systems. Engineers can rapidly build and reconfigure structures by combining standard connectors, brackets, and accessories.</p>

<h3>4. Consumer Electronics and Lighting</h3>

<p>Extruded aluminum housings dissipate heat for LED fixtures, audio equipment, smart home devices, and appliances. Precision machining and CNC finishing enable tight tolerances and premium finishes suitable for consumer-facing products.</p>

<h3>5. Renewable Energy and Infrastructure</h3>

<p>Solar panel frames, mounting systems, wind turbine components, and energy storage enclosures often require aluminum profiles to balance strength, corrosion resistance, and low maintenance costs.</p>

<h2>Surface Treatment and Finishing Options</h2>

<ul>
<li><strong>Anodizing:</strong> Enhances corrosion resistance, color consistency, and hardness while delivering a luxurious metallic appearance.</li>
<li><strong>Powder Coating:</strong> Provides a durable, UV-resistant finish with virtually unlimited color possibilities.</li>
<li><strong>Mechanical Finishes:</strong> Brushing, polishing, sandblasting, and shot peening create unique textures that improve aesthetics and tactile feel.</li>
</ul>

<h2>Quality Standards and Certification</h2>

<p>Reputable manufacturers comply with ISO 9001 quality management, ISO 14001 environmental standards, and industry-specific requirements (ASTM, EN, AAMA, or automotive certifications). Full traceability, dimensional reports, and mechanical testing help customers verify performance before assembly.</p>

<h2>Choosing the Right Aluminum Profile Partner</h2>

<p>When selecting a supplier, consider extrusion capacity, die design expertise, surface finishing capabilities, machining and fabrication services, quality assurance, and global logistics experience. A reliable partner will offer OEM/ODM support, rapid prototyping, and technical consultation from concept through mass production.</p>

<h2>Conclusion</h2>

<p>Aluminum profiles combine mechanical performance, lightweight characteristics, and design freedom, making them essential for modern construction, transportation, automation, and consumer technologies. By partnering with a trusted extrusion manufacturer, businesses can unlock innovative solutions that enhance product durability, sustainability, and market appeal.</p>
"""

    meta_title = "Aluminum Profiles 101: Basic Introduction & Application Fields"
    meta_description = (
        "Learn the fundamentals of aluminum profiles, the extrusion process, key advantages, "
        "and the main application fields in construction, transportation, industry, and consumer products."
    )
    meta_keywords = (
        "aluminum profiles, aluminum extrusion, aluminum profile applications, "
        "architectural aluminum, industrial aluminum profiles, custom extrusion"
    )

    article.title = title
    article.content = content
    article.excerpt = excerpt
    article.status = 'published'
    article.is_featured = True
    article.meta_title = meta_title
    article.meta_description = meta_description
    article.meta_keywords = meta_keywords
    article.published_at = timezone.now()
    article.save()

    print(f"Created article: id={article.id}, slug={article.slug}")
    return article


def main():
    print("Creating aluminum profile intro NEWS article...")
    tags = get_or_create_tags()
    article = create_article()
    article.tags.set(tags)
    print(f"Bound {article.tags.count()} tags to article")
    print("Done.")


if __name__ == '__main__':
    main()
