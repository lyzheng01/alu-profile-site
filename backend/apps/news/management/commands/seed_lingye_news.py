import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from apps.news.models import AluminumBlogTopic, Article, Tag


ARTICLES = [
    {
        'title': '2020 vs 3030 vs 4040 vs 4545 T-Slot Profiles: How to Choose',
        'slug': 'choose-2020-3030-4040-4545-t-slot-profiles',
        'keyword': 'T-slot aluminium profile sizes',
        'excerpt': 'Compare common 2020, 3030, 4040 and 4545 T-slot profile families by frame envelope, load path, available connectors and project constraints.',
        'image': '4040-aluminium-t-slot.png',
        'tags': ['T-Slot', 'Aluminium Extrusion'],
        'meta_description': 'A practical guide to selecting 2020, 3030, 4040 or 4545 T-slot aluminium profiles, with compatibility checks for slots and connectors.',
        'content': '''<p>Choosing a T-slot profile is not simply a matter of picking the largest section. The right starting point is the frame envelope, the loads it must carry, how it will be assembled and whether compatible connectors are available.</p>
<h2>Start with the nominal section</h2>
<p>The numbers in 2020, 3030, 4040 and 4545 commonly describe nominal outside dimensions in millimetres. A 2020 member is compact and useful where space and low mass matter. 3030 provides a wider section for general frames. 4040 and 4545 offer larger envelopes for applications that need a stiffer structure or more mounting faces.</p>
<p>These names do not define every detail. Slot opening, slot depth, core geometry, alloy, temper and dimensional tolerances can differ between profile families and suppliers.</p>
<h2>Match the section to the frame</h2>
<ul><li><strong>2020:</strong> compact enclosures, guards, light-duty fixtures and small equipment frames.</li><li><strong>3030:</strong> medium-size fixtures, workstations and modular structures where more mounting room is useful.</li><li><strong>4040:</strong> machine frames, larger guards and supports where the design benefits from a larger section.</li><li><strong>4545:</strong> projects with a larger structural envelope or a need for additional mounting faces.</li></ul>
<p>These are starting points, not load ratings. Span, unsupported length, joint design, load direction, vibration and safety factors all affect performance. Have the design checked for the actual operating conditions.</p>
<h2>Check compatibility before ordering</h2>
<p>Confirm the slot width and profile series against the intended T-nuts, brackets, end fasteners and panels. Two profiles with the same outside dimensions may not accept the same hardware. If the frame combines profiles from different sources, request section drawings and verify the interfaces before cutting or assembly.</p>
<h2>A useful RFQ checklist</h2>
<p>Send the profile series or section drawing, required cut lengths, quantity, finish, connector requirements and the frame's intended use. For a custom section, include a dimensioned drawing and identify critical interfaces. This gives the supplier enough context to check fit and manufacturing details before an order is placed.</p>
<p>The best profile is the smallest compatible section that satisfies the documented design requirements, not automatically the heaviest one.</p>''',
    },
    {
        'title': 'Planning a T-Slot Aluminium Frame: Loads, Joints and a Drawing Checklist',
        'slug': 'planning-a-t-slot-aluminium-frame',
        'keyword': 'T-slot aluminium frame design',
        'excerpt': 'Plan a modular T-slot frame around real loads, spans, joints and service needs, then make the drawing clear enough to review and quote.',
        'image': '3030-series-aluminium-t-slot.jpg',
        'tags': ['T-Slot', 'Design Guide'],
        'meta_description': 'A practical checklist for T-slot frame planning, including load cases, profile spans, connector details, panels and drawing notes.',
        'content': '''<p>A reliable modular frame begins with the job it needs to do. Before selecting extrusion or connectors, write down what the frame supports, how people or equipment interact with it, and what must remain adjustable after installation.</p>
<h2>Define the load cases</h2>
<p>Record the weight and position of equipment, panels, doors and accessories. Note whether loads are static, moving, impact-related or repeated. Include the direction of each load and any forces introduced by opening doors, sliding components or attached machinery.</p>
<p>Profile size alone cannot establish frame capacity. Member span, orientation, joints, anchoring, deflection limits and the condition of the supporting floor or structure all matter. For load-bearing or safety-related equipment, have a qualified engineer review the design and specify suitable safety factors.</p>
<h2>Think about joints and access</h2>
<p>Choose connections that suit the assembly sequence and the expected service access. Internal fasteners can keep faces clear, while external brackets can make adjustment or field assembly more straightforward. Confirm connector compatibility with the exact slot geometry and leave access for tools and fasteners.</p>
<p>Plan panel grooves, doors, hinges, cable routes and levelling feet early. Adding these details after the frame is sized can force rework or create inaccessible fasteners.</p>
<h2>Make the drawing reviewable</h2>
<ul><li>Overall dimensions and member cut lengths.</li><li>Profile series or section drawings, including slot orientation.</li><li>Connector type, fastener direction and any required machining.</li><li>Panel material, thickness, edge treatment and installation method.</li><li>Finish, quantity, tolerances and any cosmetic faces.</li><li>Assembly view, revision number and destination requirements.</li></ul>
<h2>Review before release</h2>
<p>Check that every joint can be assembled in sequence, that fasteners remain reachable and that the frame can be moved or anchored as planned. Identify interfaces that must align with other equipment and mark them as critical dimensions. When the drawing changes, update its revision so quotation and production refer to the same design.</p>
<p>A clear design package helps the supplier raise compatibility questions before manufacture. It also makes later changes easier to track and verify.</p>''',
    },
    {
        'title': 'Aluminium Extrusion RFQ Checklist: What to Include with Your Drawing',
        'slug': 'aluminium-extrusion-rfq-checklist',
        'keyword': 'aluminium extrusion RFQ checklist',
        'excerpt': 'A concise checklist for requesting an aluminium extrusion quote, covering drawings, alloy, temper, finish, quantities and downstream processing.',
        'image': 'custom-profile2.jpg',
        'tags': ['RFQ', 'Aluminium Extrusion'],
        'meta_description': 'Prepare a clearer aluminium extrusion RFQ with profile drawings, alloy and temper, tolerances, finish, lengths, quantities and machining notes.',
        'content': '''<p>A quote request is easier to assess when the supplier can see both the profile and how it will be used. A complete package reduces avoidable assumptions and makes supplier responses easier to compare.</p>
<h2>1. Identify the profile</h2>
<p>Attach a dimensioned cross-section drawing with units, wall thicknesses, critical dimensions and tolerances. Mark the revision clearly. A PDF is convenient for review; include a native CAD file such as STEP or DWG when available and appropriate. For an existing standard profile, state its series and provide the supplier's reference drawing if you have one.</p>
<h2>2. State material requirements</h2>
<p>Specify the alloy and temper if they are already defined by the design. If they are not, describe the functional requirements and ask the supplier to propose an option for engineering approval. Do not assume that similar-looking profiles have identical mechanical properties.</p>
<h2>3. Describe the order quantity and delivery form</h2>
<ul><li>Estimated annual demand and initial order quantity.</li><li>Required cut lengths, acceptable length variation and whether bars or cut pieces are needed.</li><li>Packaging, labelling and delivery destination.</li><li>Target schedule or required delivery window, if known.</li></ul>
<h2>4. Specify finish and processing</h2>
<p>State the surface finish and colour reference where relevant, and identify which faces are cosmetic or mating surfaces. List secondary operations such as cutting, drilling, tapping, CNC machining, deburring or protective film. Attach drawings for machined parts and define inspection points for critical features.</p>
<h2>5. Explain interfaces and approval needs</h2>
<p>Show how the extrusion connects to fasteners, panels, seals or other components. Include connector references or mating-part drawings where fit is critical. Note whether a sample, first-article review, inspection record or other approval step is required before a production order.</p>
<h2>Before sending</h2>
<p>Check that drawing units, revision, quantities and finish requirements agree across all files. Separate confirmed requirements from open questions. A short note describing the application can help the supplier flag a mismatch, but it does not replace design validation for structural or safety-critical parts.</p>
<p>With these details in one package, both sides can clarify scope earlier and compare quotations on a more consistent basis.</p>''',
    },
    {
        'title': 'Anodizing, Powder Coating or Wood Grain? Selecting an Aluminium Finish',
        'slug': 'selecting-an-aluminium-profile-finish',
        'keyword': 'aluminium profile surface finishes',
        'excerpt': 'Compare common aluminium profile finishes by appearance, intended environment, maintenance and project constraints before specifying a surface treatment.',
        'image': 'wood-grain.jpg',
        'tags': ['Surface Finishing', 'Aluminium Extrusion'],
        'meta_description': 'Compare anodizing, powder coating and wood-grain finishes for aluminium profiles, and learn what to confirm before ordering.',
        'content': '''<p>The finish affects more than colour. It can influence appearance, cleaning, fit at interfaces and how consistently multiple batches match. Select it with the application and the mating parts in mind.</p>
<h2>Anodizing</h2>
<p>Anodizing forms an oxide layer as part of the aluminium surface. It is commonly selected for a clean metallic appearance and architectural or equipment applications. Colour and appearance can vary with alloy, extrusion surface and batch. Confirm the available colour range, sample approval method and any masking requirements with the supplier.</p>
<h2>Powder coating</h2>
<p>Powder coating provides a broad palette of colours and surface effects. It can suit projects where a uniform painted appearance is important. Confirm the specified colour reference, gloss or texture, coating coverage and protection of threaded or close-fit areas. If profiles from separate batches must match, agree on a sample or approved reference.</p>
<h2>Wood-grain appearance</h2>
<p>Wood-grain finishes are used when a timber-like visual effect is desired while retaining an aluminium profile. They are often considered for doors, windows and interior details. Pattern direction, colour variation and coordination across adjoining lengths should be reviewed on representative samples before production.</p>
<h2>Choose by the whole assembly</h2>
<ul><li>Describe the indoor or outdoor environment and expected cleaning routine.</li><li>Identify faces visible after assembly and faces that must mate closely.</li><li>Check whether fastener slots, drilled holes or cut ends need additional treatment.</li><li>Request confirmation of finish availability for the selected alloy, profile and order size.</li><li>Approve a physical sample when colour or texture is important.</li></ul>
<p>Finish names alone do not define performance. If a project has requirements for corrosion exposure, colour tolerance, coating thickness or a named standard, state them explicitly and confirm how they will be measured and documented.</p>
<p>Sharing the profile drawing, use environment, colour reference and sample expectations early gives the supplier a clearer basis for checking the finish before production.</p>''',
    },
    {
        'title': 'A Clear Project Cooperation Workflow for Custom Aluminium Profiles',
        'slug': 'custom-aluminium-profile-project-workflow',
        'keyword': 'custom aluminium profile project workflow',
        'excerpt': 'A transparent project workflow for custom aluminium profiles, from inquiry and drawing review to sample approval, production coordination and shipment documents.',
        'image': 'cnc-parts2.webp',
        'tags': ['Project Cooperation', 'Aluminium Extrusion'],
        'meta_description': 'See the typical stages of a custom aluminium profile project and the drawings, approvals and decisions to align at each step.',
        'content': '''<p>Custom extrusion projects involve more than a profile drawing. Clear ownership of specifications, revisions and approvals helps keep the buyer and supplier aligned from inquiry through delivery.</p>
<h2>1. Share the application and requirements</h2>
<p>Start with a section drawing or CAD file, alloy and temper requirements, finish, target lengths, estimated quantities and destination. Explain the application and identify critical dimensions or visible faces. If some requirements are still open, list them as questions rather than leaving them implicit.</p>
<h2>2. Review feasibility and quotation scope</h2>
<p>The supplier reviews the section and requested processing, then clarifies assumptions, open dimensions and the scope included in the quotation. Confirm whether the proposal covers extrusion only or also includes cutting, machining, finishing, packing or delivery. Tooling, minimum quantities, lead times and samples should be confirmed for the specific project rather than assumed.</p>
<h2>3. Align drawings and approvals</h2>
<p>Keep a revision-controlled drawing set. Review any proposed changes to wall thickness, tolerances, interfaces or finish before approval. Where fit, colour or appearance matters, agree whether a sample or first-article check is needed and what acceptance criteria apply.</p>
<h2>4. Coordinate production and inspection</h2>
<p>Before a production order is released, confirm the approved revision, quantity, finish, cut lengths, packing instructions and delivery details. Agree on inspection records or checkpoints required by the purchase order. If a schedule or specification changes, document the change and its impact before proceeding.</p>
<h2>5. Close the loop on delivery</h2>
<p>Confirm labels, bundle or carton details, shipping documents and the receiving contact. After delivery, record any fit or finish feedback against the relevant drawing revision so future orders have a clear reference.</p>
<p>At Lingye Aluminum, this is a practical coordination framework for custom-profile inquiries. The exact process, services, samples and inspection documents depend on the confirmed quotation, order scope and project agreement. No customer reference or project result should be inferred from this general workflow.</p>''',
    },
]


class Command(BaseCommand):
    help = 'Publish the five reviewed Lingye aluminium industry articles.'

    @transaction.atomic
    def handle(self, *args, **options):
        asset_dir = Path(settings.BASE_DIR) / 'catalog_assets'
        media_dir = Path(settings.MEDIA_ROOT) / 'articles'
        media_dir.mkdir(parents=True, exist_ok=True)

        for data in ARTICLES:
            cover_name = f"{data['slug']}{Path(data['image']).suffix}"
            cover_path = media_dir / cover_name
            shutil.copyfile(asset_dir / data['image'], cover_path)

            article, _ = Article.objects.update_or_create(
                slug=data['slug'],
                defaults={
                    'title': data['title'],
                    'content': data['content'],
                    'excerpt': data['excerpt'],
                    'status': 'published',
                    'is_featured': False,
                    'meta_title': data['title'],
                    'meta_description': data['meta_description'],
                    'meta_keywords': data['keyword'],
                },
            )
            article.featured_image.name = f"articles/{cover_name}"
            article.save(update_fields=['featured_image', 'updated_at'])

            tags = []
            for name in data['tags']:
                tag, _ = Tag.objects.get_or_create(
                    name=name,
                    defaults={'slug': slugify(name)},
                )
                tags.append(tag)
            article.tags.set(tags)

            topic, _ = AluminumBlogTopic.objects.update_or_create(
                title=data['title'],
                defaults={
                    'slug': data['slug'],
                    'primary_keyword': data['keyword'],
                    'status': 'published',
                    'article': article,
                    'notes': 'Editorial article manually reviewed; not AI-generated customer case material.',
                },
            )
            self.stdout.write(f"Published: {article.slug} (topic {topic.id})")

        self.stdout.write(self.style.SUCCESS('Published 5 Lingye news articles.'))
