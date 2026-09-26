from pathlib import Path
import shutil

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models.signals import post_save

from apps.products.models import Category, Product, ProductImage
from apps.products.signals import auto_translate_category, auto_translate_product


CATALOG = [
    {
        'category': ('Cabinet & Wardrobe Profiles', 'cabinet-profiles', 'Aluminium profiles for cabinet doors, wardrobes, and handleless interior systems.'),
        'products': [
            ('Glass Door Frame Profiles', 'glass-door-frame-profiles', 'Aluminium framing profiles for glass cabinet and wardrobe doors. Select the section and finish to suit the panel, hardware, and installation detail.', 'Framing section for glass panels; panel compatibility and frame geometry confirmed by drawing.', 'Cabinet doors; wardrobe fronts; interior partitions.', 'Glass-retaining channel; frame geometry matched to panel and hardware; finish selected for the interior scheme.', 'glass-door-frame-profile.webp'),
            ('Wardrobe Aluminium Profiles', 'wardrobe-aluminium-profiles', 'A range of aluminium sections for wardrobe doors and interior storage systems. Final profile dimensions and panel fit are confirmed against the project drawing.', 'Profile section and panel fit confirmed by drawing; surface finish selected per project.', 'Wardrobe doors; closet systems; interior joinery.', 'Multiple section styles for wardrobe construction; panel fit, joint details, and finish coordinated to the door design.', 'wardrobe-detail.png'),
            ('Gola Handleless Cabinet Profiles', 'gola-handleless-cabinet-profiles', 'Gola-style aluminium channels designed for handleless cabinet layouts. Share cabinet construction details to check the suitable section and installation position.', 'Channel geometry, cabinet interface, and finish confirmed by drawing.', 'Kitchen cabinets; bathroom vanities; handleless furniture.', 'Recessed grip channel; clean handleless appearance; cabinet interface and installation position checked to drawing.', 'gola-profile.webp'),
            ('Wardrobe Handle Profiles', 'wardrobe-handle-profiles', 'Integrated aluminium handle sections for wardrobe and cabinet doors, with profile selection based on door thickness and hardware arrangement.', 'Door thickness and handle interface confirmed by drawing; finish options by request.', 'Sliding wardrobes; hinged cabinets; fitted furniture.', 'Integrated grip profile; door-edge fit coordinated with panel thickness and hardware arrangement.', 'wardrobe-handle.png'),
        ],
    },
    {
        'category': ('Industrial Aluminium Profiles', 'industrial-profiles', 'Extruded sections and machining options for equipment, enclosures, and industrial assemblies.'),
        'products': [
            ('Aluminium Heat Sink Profiles', 'aluminium-heat-sink-profiles', 'Fin-shaped extrusion concepts for thermal-management assemblies. Thermal performance depends on the final geometry, alloy, airflow, and operating conditions and should be validated for each design.', 'Fin geometry, alloy, dimensions, and thermal requirements reviewed from drawing.', 'Power electronics; LED housings; control equipment.', 'Extended fin geometry for heat-transfer assemblies; thermal performance validated against the full operating design.', 'heat-sink-profile.jpg'),
            ('Custom CNC Aluminium Profiles', 'custom-cnc-aluminium-profiles', 'Custom extruded sections with secondary CNC machining planned around the supplied drawing. Feature positions and tolerances are confirmed during quotation review.', 'Extrusion section and machining features follow approved drawing; tolerances to be agreed.', 'Automation equipment; machine frames; custom assemblies.', 'Extrusion and secondary machining planned together; hole positions and interfaces reviewed against customer drawings.', 'cnc-axis.webp'),
            ('Aluminium Enclosure Profiles', 'aluminium-enclosure-profiles', 'Aluminium enclosure sections and housings for equipment builds. Confirm the enclosure layout, interface dimensions, and environmental requirements before specification.', 'Housing dimensions, interface, and finish confirmed for the project.', 'Electrical controls; instrumentation; equipment housings.', 'Housing-style sections for equipment packaging; panel interfaces and enclosure layout defined per assembly.', 'enclosure.jpg'),
            ('CNC Machined Aluminium Components', 'cnc-machined-aluminium-components', 'Machined aluminium components produced to a customer drawing, with material and finish details reviewed before order confirmation.', 'Material, critical dimensions, machining notes, and finish specified by drawing.', 'Industrial machinery; fixtures; equipment components.', 'Drawing-led component machining; critical dimensions and finishing notes identified before order confirmation.', 'cnc-parts2.webp'),
        ],
    },
    {
        'category': ('T-Slot Framing Profiles', 't-slot-profiles', 'Modular T-slot extrusion references for configurable frames and equipment structures.'),
        'products': [
            ('2020 T-Slot Aluminium Profile', '2020-t-slot-aluminium-profile', 'A nominal 20 × 20 series framing profile for compact modular structures. Slot dimensions, connector fit, and series compatibility must be checked against the selected drawing.', 'Nominal series: 20 × 20; slot and accessory compatibility by drawing.', 'Compact machine frames; guards; benches; fixtures.', 'Compact 20-series framing format; confirm slot opening, connector family, and section drawing before assembly.', '2020-aluminium-t-slot.jpg'),
            ('3030 T-Slot Aluminium Profile', '3030-t-slot-aluminium-profile', 'A nominal 30 × 30 series profile for modular framing applications. Confirm the slot standard and connector system before combining components.', 'Nominal series: 30 × 30; slot and accessory compatibility by drawing.', 'Equipment frames; workstations; machine enclosures.', '30-series framing format; slot and accessory compatibility checked against the chosen system drawing.', '3030-series-aluminium-t-slot.jpg'),
            ('4040 T-Slot Aluminium Profile', '4040-t-slot-aluminium-profile', 'A nominal 40 × 40 series profile for general modular structures. Exact section, slot opening, and load requirements are confirmed from the selected profile drawing.', 'Nominal series: 40 × 40; section and load requirements by drawing.', 'Automation frames; production equipment; workstations.', '40-series modular section; final slot geometry and structural suitability confirmed for the application.', '4040-aluminium-t-slot.png'),
            ('4545 T-Slot Aluminium Profile', '4545-t-slot-aluminium-profile', 'A nominal 45 × 45 series profile for modular assemblies requiring a larger section. Verify system compatibility and structural design for the intended application.', 'Nominal series: 45 × 45; slot and system compatibility by drawing.', 'Machine frames; safety guards; modular structures.', '45-series framing format for larger modular assemblies; verify mating hardware and structural design before use.', '4545-series-aluminium-t-slot.jpg'),
        ],
    },
    {
        'category': ('Window & Door Profiles', 'windows-doors', 'Window, door, curtain-wall, and regional system profiles with configuration confirmed to project drawings.'),
        'products': [
            ('Custom Window & Door Extrusions', 'custom-window-door-extrusions', 'Custom aluminium sections for window and door systems. Submit section drawings, hardware interfaces, finish, and target market requirements for a fit review.', 'System dimensions, hardware interface, alloy, temper, and finish confirmed by drawing.', 'Residential and commercial windows; doors; project-specific systems.', 'Drawing-based system matching; hardware interfaces and glazing details reviewed with the section.', 'custom-profile2.jpg'),
            ('Curtain Wall Aluminium Profiles', 'curtain-wall-aluminium-profiles', 'Extrusion references for curtain-wall and facade assemblies. Structural design, glazing interface, drainage, and local code compliance remain project-specific and require qualified review.', 'Section, glazing interface, structural criteria, and finish set by project documents.', 'Commercial facades; curtain walls; glazed building envelopes.', 'Facade sections planned around glazing, drainage, and connection details; structural compliance remains project-specific.', 'curtain-design.webp'),
            ('South America Window & Door Profiles', 'south-america-window-door-extrusions', 'A regional product entry point for buyers sourcing window and door extrusions for South American projects. Profiles are selected to the customer’s system drawings and applicable local requirements.', 'Country, system series, dimensions, hardware, and finish to be confirmed per project.', 'Window and door fabricators; distributors; construction projects across South America.', 'Regional enquiry support with system selection based on destination market, local series, and customer drawings.', 'chile-aluminium-profile.webp'),
            ('Africa Window & Door Profiles', 'africa-window-door-extrusions', 'A regional product entry point for window and door extrusion enquiries for African markets. Share the target country, system drawing, quantity, and finish so requirements can be reviewed accurately.', 'Country, system series, dimensions, hardware, and finish to be confirmed per project.', 'Window and door fabricators; distributors; construction projects across African markets.', 'Regional enquiry support with country-specific system details and finish requirements checked before specification.', 'window-profile.webp'),
        ],
    },
    {
        'category': ('Standard Aluminium Profiles', 'standard-aluminium-profiles', 'Common aluminium sections for fabrication and general structural use; dimensions are confirmed by order specification.'),
        'products': [
            ('Aluminium U Channel', 'aluminium-u-channel', 'U-section aluminium profiles for edge protection, framing, and general fabrication. Specify outside dimensions, wall thickness, alloy, and finish.', 'Leg width, base width, wall thickness, length, alloy, and finish by specification.', 'Frames; trims; guides; fabrication assemblies.', 'Open U-section for edge capture and guided assemblies; specify leg and base dimensions with wall thickness.', 'u-channel2.jpg'),
            ('Aluminium H Profile', 'aluminium-h-profile', 'H-section profiles used to join or support compatible panels and sections. Confirm mating dimensions, wall thickness, and intended loading before selection.', 'Section dimensions, wall thickness, alloy, and finish by drawing.', 'Panel joining; partitions; structural and fabrication work.', 'Two-channel H section for panel joining; mating thickness and engagement depth matched to the assembly.', 'h-profile.jpeg'),
            ('Aluminium Square Tube', 'aluminium-square-tube', 'Hollow square aluminium sections for fabrication and frame construction. Wall thickness, alloy, temper, and cut length are selected for the application.', 'Outside dimensions, wall thickness, length, alloy, and temper by specification.', 'Frames; supports; furniture; general fabrication.', 'Closed hollow square section; specify outside size, wall thickness, cut length, and required material condition.', 'square-tube-alt.jpg'),
            ('Aluminium Flat Bar', 'aluminium-flat-bar', 'Flat aluminium bar stock for brackets, spacers, strips, and general fabrication. Confirm width, thickness, length, material, and finish for each order.', 'Width, thickness, length, alloy, temper, and finish by specification.', 'Brackets; spacers; trims; workshop fabrication.', 'Solid rectangular section for simple cut and fabricated parts; width and thickness set by application.', 'flat-bar.jpg'),
        ],
    },
]


class Command(BaseCommand):
    help = 'Create or update the five-category LingYe catalog and its 20 illustrated products.'

    def handle(self, *args, **options):
        asset_root = Path(__file__).resolve().parents[4] / 'catalog_assets'
        media_root = Path(settings.MEDIA_ROOT)
        missing = [item[6] for group in CATALOG for item in group['products'] if not (asset_root / item[6]).is_file()]
        if missing:
            raise CommandError(f'Missing catalog image assets: {", ".join(missing)}')

        post_save.disconnect(auto_translate_category, sender=Category)
        post_save.disconnect(auto_translate_product, sender=Product)
        try:
            with transaction.atomic():
                count = 0
                for category_order, group in enumerate(CATALOG, start=1):
                    category_name, category_slug, category_description = group['category']
                    category, _ = Category.objects.update_or_create(
                        slug=category_slug,
                        defaults={'name': category_name, 'description': category_description, 'order': category_order, 'is_active': True},
                    )
                    for product_order, item in enumerate(group['products'], start=1):
                        name, slug, description, specifications, applications, features, image_name = item
                        image_relative = f'products/catalog/{image_name}'
                        image_target = media_root / image_relative
                        image_target.parent.mkdir(parents=True, exist_ok=True)
                        shutil.copy2(asset_root / image_name, image_target)
                        product, _ = Product.objects.update_or_create(
                            slug=slug,
                            defaults={
                                'category': category,
                                'name': name,
                                'description': description,
                                'features': features,
                                'applications': applications,
                                'specifications': specifications,
                                'range_param': 'Project-specific; confirm by drawing or specification',
                                'type_param': name,
                                'surface_treatment': 'To be confirmed by project specification',
                                'colors': 'To be confirmed by project specification',
                                'grade': 'To be confirmed by project specification',
                                'temper': 'To be confirmed by project specification',
                                'is_featured': product_order == 1,
                                'is_active': True,
                                'order': (category_order - 1) * 10 + product_order,
                            },
                        )
                        ProductImage.objects.update_or_create(
                            product=product,
                            order=1,
                            defaults={'image': image_relative, 'caption': name, 'is_primary': True},
                        )
                        count += 1
                    category.image.name = f'products/catalog/{group["products"][0][6]}'
                    category.save(update_fields=['image', 'updated_at'])
        finally:
            post_save.connect(auto_translate_category, sender=Category)
            post_save.connect(auto_translate_product, sender=Product)

        self.stdout.write(self.style.SUCCESS(f'LingYe catalog ready: {len(CATALOG)} categories, {count} products, {count} primary images.'))
