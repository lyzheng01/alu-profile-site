from pathlib import Path
import json
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
            ('2040 T-Slot Aluminium Profile', '2040-t-slot-aluminium-profile', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. This elongated-format framing reference may suit compact machine guards, equipment rails, or fixture layouts. LingYe coordinates project-specific sourcing; provide the section drawing, slot detail, alloy and temper requirements, finish, quantities, and destination market for review.', 'Section geometry, slot opening, alloy, temper, finish, and mating hardware are confirmed from project documents; no compatibility is implied by the series name.', 'Compact equipment frames; machine guards; fixture rails; modular supports.', 'Elongated framing reference for project review; connection family and panel interfaces are checked against submitted drawings.', '2040-t-slot-aluminium-profile.webp'),
            ('2060 T-Slot Aluminium Profile', '2060-t-slot-aluminium-profile', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. This rectangular framing reference can be considered for equipment structures and guided assemblies where the proposed section suits the layout. LingYe coordinates sourcing and specification review; provide drawings, target use, material and finish requirements, quantity, and delivery destination.', 'Final section, slot details, alloy, temper, finish, and accessory interfaces are project-specific and subject to drawing review.', 'Equipment frames; machine enclosures; modular workstations; guided supports.', 'Rectangular profile reference; layout and connector suitability are coordinated from the customer drawing.', '2060-t-slot-aluminium-profile.webp'),
            ('3060 T-Slot Aluminium Profile', '3060-t-slot-aluminium-profile', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. A rectangular T-slot profile reference for frame members, machine enclosures, or workstation structures. LingYe supports project sourcing coordination; send the cross-section, assembly drawing, alloy and temper, surface finish, order quantity, and destination for a specification review.', 'Dimensions, slot configuration, material condition, surface treatment, and system interfaces require confirmation against the approved project specification.', 'Machine frames; workstation structures; equipment enclosures; modular supports.', 'Rectangular frame-member concept; confirm the exact section and connector interface before combining components.', '3060-t-slot-aluminium-profile.webp'),
            ('4080 T-Slot Aluminium Profile', '4080-t-slot-aluminium-profile', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. This rectangular framing reference may be evaluated for larger equipment frames, machine bases, or support structures. LingYe coordinates sourcing requests rather than asserting a standard fit; provide drawings, intended application, material and finish requirements, quantity, and shipping destination.', 'Section dimensions, slot geometry, structural criteria, alloy, temper, and finish are determined from project documentation.', 'Equipment frames; machine bases; automation structures; support assemblies.', 'Rectangular structural reference; the project team must define interfaces and validate design suitability.', '4080-t-slot-aluminium-profile.webp'),
            ('5050 T-Slot Aluminium Profile', '5050-t-slot-aluminium-profile', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. A square-format T-slot profile reference for modular structures and equipment layouts. LingYe coordinates project-specific sourcing; share a section drawing, connector requirements, intended use, alloy and temper, finish, quantity, and destination market so the details can be reviewed.', 'Nominal family label is not a dimensional or compatibility guarantee; confirm actual section, slot, alloy, temper, and finish in project documents.', 'Modular frames; machine structures; workstations; equipment supports.', 'Square-format profile reference; confirm the actual mating system and structural design for the assembly.', '5050-t-slot-aluminium-profile.webp'),
            ('6060 T-Slot Aluminium Profile', '6060-t-slot-aluminium-profile', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. This square-section framing reference can be considered for equipment structures, guarded cells, or workstations. LingYe coordinates sourcing and supplier communication; provide the section and assembly drawings, application, material and finish requirements, quantity, and delivery destination.', 'Actual section, slot configuration, interfaces, alloy, temper, and finish are confirmed per approved drawing and project specification.', 'Equipment structures; machine guards; modular workstations; automation frames.', 'Square framing reference; hardware fit and design requirements must be checked against the selected system.', '6060-t-slot-aluminium-profile.webp'),
            ('8080 T-Slot Aluminium Profile', '8080-t-slot-aluminium-profile', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. A larger-format square framing reference for project teams evaluating modular equipment supports or machine structures. LingYe provides sourcing coordination, not an assumed standard fit; submit the cross-section, assembly needs, material and finish requirements, quantity, and destination.', 'Section and slot geometry, connection details, material condition, finish, and design criteria remain project-specific.', 'Machine structures; automation equipment; modular support frames; guarded assemblies.', 'Large-format profile concept; confirm connection interfaces and application design before specifying.', '8080-t-slot-aluminium-profile.webp'),
            ('9090 T-Slot Aluminium Profile', '9090-t-slot-aluminium-profile', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. This square framing reference may be reviewed for substantial modular assemblies when the specified section and system interfaces suit the design. LingYe coordinates project sourcing; provide drawings, use conditions, material and finish requirements, quantity, and destination market for review.', 'Family label does not define the finished section or system fit; confirm geometry, interfaces, alloy, temper, and finish from project documents.', 'Heavy equipment frames; automation structures; machine bases; modular supports.', 'Large-section framing reference; structural requirements and connector compatibility require project-level review.', '9090-t-slot-aluminium-profile.webp'),
            ('90-Degree External Corner Bracket', '90-degree-external-corner-bracket', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. An external corner-joining concept for assembling perpendicular frame members where the selected system permits it. LingYe coordinates sourcing against the assembly; provide profile sections, joint detail, fastener requirements, finish, quantity, and destination.', 'Bracket geometry, hole pattern, fasteners, finish, and profile fit must be checked against the assembly drawing; no series compatibility is assumed.', 'Right-angle frame joints; equipment frames; modular guards; workstations.', 'External corner connection concept; confirm mating faces and fastener arrangement before ordering.', '90-degree-external-corner-bracket.webp'),
            ('Three-Way Profile Connector', 'three-way-connector', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. A three-direction connection concept for frame nodes joining multiple members. LingYe coordinates project sourcing; submit the node layout, profile cross-sections, connection method, material and finish needs, quantity, and destination for review.', 'Number and orientation of connections, fastening method, profile interfaces, material, and finish are project-specific.', 'Frame intersections; equipment structures; modular enclosures; support assemblies.', 'Multi-direction joint reference; confirm all member interfaces and assembly clearances from drawings.', 'three-way-connector.webp'),
            ('Angle Bracket for Profile Assemblies', 'angle-bracket', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. An angled joining component reference for bracing or connecting members in a project-defined frame. LingYe coordinates sourcing to the joint detail; provide profile drawings, required angle and fastener arrangement, finish, quantity, and destination.', 'Angle, dimensions, hole positions, fasteners, coating, and compatible profile interfaces must be specified by the project.', 'Frame bracing; equipment supports; fixture joints; modular assemblies.', 'Angled connection concept; verify joint geometry and fastening access in the assembly design.', 'angle-bracket.webp'),
            ('Flat Joining Plate for T-Slot Frames', 'flat-joining-plate', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. A flat plate connection reference for joining or reinforcing members where the design calls for a plate-based joint. LingYe coordinates project sourcing; share member sections, joint layout, fastener details, material and finish, quantity, and delivery destination.', 'Plate outline, thickness, hole pattern, fasteners, finish, and mating interfaces require drawing-level confirmation.', 'Frame joints; extensions; equipment supports; modular structures.', 'Plate-based joining concept; confirm overlap, fastener access, and member interfaces for the assembly.', 'flat-joining-plate.webp'),
            ('T-Slot Nut', 't-slot-nut', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. A slot-retained fastening component reference for attaching brackets or fixtures to a compatible extrusion system. LingYe coordinates sourcing against the chosen profile; provide slot details, thread and fastener requirements, application, material or finish needs, quantity, and destination.', 'Slot shape, insertion method, thread, material, finish, and profile compatibility must be confirmed; no slot standard is implied.', 'Bracket attachment; fixtures; guards; adjustable equipment accessories.', 'Captive or insertable nut concept; confirm slot and fastener interfaces before specifying.', 't-slot-nut.webp'),
            ('T-Bolt for Profile Connections', 't-bolt', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. A bolt-form fastening reference intended for a project-defined slot connection. LingYe coordinates sourcing with the profile and joint specification; provide slot geometry, required thread and length, mating hardware, finish, quantity, and destination.', 'Bolt dimensions, thread, head geometry, material, finish, and slot fit are confirmed from project documentation.', 'Profile joints; brackets; fixtures; adjustable frame components.', 'Slot-fastener concept; verify the bolt head, thread, and mating parts against the selected assembly.', 't-bolt.webp'),
            ('Profile Anchor Fastener Set', 'anchor-fastener-set', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. A fastening-set reference for securing a profile assembly to a project-defined base or support. LingYe coordinates sourcing; provide the base and profile details, installation drawing, substrate, fastener requirements, finish, quantity, and destination.', 'Set contents, fixing method, substrate suitability, material, finish, and dimensions must be confirmed by project review.', 'Equipment anchoring; frame bases; machine supports; installation assemblies.', 'Base-fixing concept; confirm substrate and installation requirements with the responsible design team.', 'anchor-fastener-set.webp'),
            ('Aluminium Profile End Cap', 'profile-end-cap', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. An end-cover component reference for finishing an exposed profile opening or protecting an assembly edge. LingYe coordinates sourcing to the profile outline; provide the section drawing, fit and retention needs, material or color, quantity, and delivery destination.', 'End-cap outline, retention method, material, color, and fit are confirmed against the exact profile section.', 'Exposed profile ends; frame finishing; equipment and furniture assemblies.', 'Profile-end finishing concept; confirm section perimeter and installation method before selection.', 'profile-end-cap.webp'),
            ('Panel Fastener for Profile Frames', 'panel-fastener', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. A panel-retention hardware reference for attaching enclosure or guard panels to a project-defined frame. LingYe coordinates sourcing; provide panel material and thickness, frame section, retention detail, finish, quantity, and destination.', 'Panel interface, retention method, fastener geometry, material, and finish must be set from the assembly drawing.', 'Machine guards; equipment covers; modular enclosures; partition panels.', 'Panel attachment concept; check panel edges, access, and frame interfaces in the assembly design.', 'panel-fastener.webp'),
            ('Hinge for Profile Assemblies', 'hinge', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. A hinge hardware reference for access doors or movable panels in a profile-based assembly. LingYe coordinates project sourcing; provide door or panel details, mounting interfaces, movement needs, material and finish, quantity, and destination.', 'Hinge geometry, mounting pattern, material, finish, and movement requirements are confirmed for the specific assembly.', 'Access doors; machine guards; equipment enclosures; inspection panels.', 'Movable-panel hardware concept; confirm mounting surfaces and required opening arrangement from drawings.', 'hinge.webp'),
            ('Leveling Foot for Equipment Frames', 'leveling-foot', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. An adjustable support-foot reference for positioning a frame on a project-defined floor or base. LingYe coordinates sourcing; provide frame interface, base conditions, adjustment needs, material and finish, quantity, and destination.', 'Mounting interface, adjustment range, base contact, material, and finish require project-specific confirmation.', 'Workstations; equipment frames; machine supports; adjustable fixtures.', 'Adjustable support concept; confirm mounting and floor-contact requirements for the intended installation.', 'leveling-foot.webp'),
            ('Caster Wheel for Mobile Frames', 'caster-wheel', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. A mobility hardware reference for frames designed to move during their intended use. LingYe coordinates sourcing; provide mounting details, floor conditions, movement and braking requirements, frame layout, quantity, and destination.', 'Mounting plate or stem, wheel material, brake arrangement, environmental suitability, and design loads must be specified and reviewed.', 'Mobile workstations; movable fixtures; equipment carts; service frames.', 'Mobile-frame hardware concept; confirm the application and responsible design criteria before selection.', 'caster-wheel.webp'),
        ],
    },
    {
        'category': ('Window & Door Profiles', 'windows-doors', 'Window, door, curtain-wall, and regional system profiles with configuration confirmed to project drawings.'),
        'products': [
            ('Custom Window & Door Extrusions', 'custom-window-door-extrusions', 'Custom aluminium sections for window and door systems. Submit section drawings, hardware interfaces, finish, and target market requirements for a fit review.', 'System dimensions, hardware interface, alloy, temper, and finish confirmed by drawing.', 'Residential and commercial windows; doors; project-specific systems.', 'Drawing-based system matching; hardware interfaces and glazing details reviewed with the section.', 'custom-profile2.jpg'),
            ('Curtain Wall Aluminium Profiles', 'curtain-wall-aluminium-profiles', 'Extrusion references for curtain-wall and facade assemblies. Structural design, glazing interface, drainage, and local code compliance remain project-specific and require qualified review.', 'Section, glazing interface, structural criteria, and finish set by project documents.', 'Commercial facades; curtain walls; glazed building envelopes.', 'Facade sections planned around glazing, drainage, and connection details; structural compliance remains project-specific.', 'curtain-design.webp'),
            ('South America Window & Door Profiles', 'south-america-window-door-extrusions', 'A regional product entry point for buyers sourcing window and door extrusions for South American projects. Profiles are selected to the customer’s system drawings and applicable local requirements.', 'Country, system series, dimensions, hardware, and finish to be confirmed per project.', 'Window and door fabricators; distributors; construction projects across South America.', 'Regional enquiry support with system selection based on destination market, local series, and customer drawings.', 'chile-aluminium-profile.webp'),
            ('Africa Window & Door Profiles', 'africa-window-door-extrusions', 'A regional product entry point for window and door extrusion enquiries for African markets. Share the target country, system drawing, quantity, and finish so requirements can be reviewed accurately.', 'Country, system series, dimensions, hardware, and finish to be confirmed per project.', 'Window and door fabricators; distributors; construction projects across African markets.', 'Regional enquiry support with country-specific system details and finish requirements checked before specification.', 'window-profile.webp'),
            ('Sliding Window System Profiles', 'sliding-window-system', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. A product-system reference for window projects using sliding sashes and project-selected hardware. LingYe coordinates sourcing and supplier communication; provide elevations, section drawings, glazing details, hardware interfaces, finish, target market, quantity, and destination.', 'Sash and frame sections, glazing, track and hardware interfaces, alloy, temper, finish, and market requirements are confirmed per project.', 'Residential sliding windows; apartment projects; commercial window packages.', 'Sliding-system reference; coordinate frame, sash, glazing, drainage, and hardware details from project documents.', 'sliding-window-system.webp'),
            ('Casement Window System Profiles', 'casement-window-system', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. A system reference for outward- or inward-opening casement window projects, subject to the selected hardware and local design requirements. LingYe coordinates project sourcing; submit elevations, section drawings, glazing and hardware details, finish, quantity, and destination market.', 'Opening configuration, frame and sash interfaces, glazing, hardware, material, finish, and local requirements require project review.', 'Residential casement windows; renovation projects; commercial building windows.', 'Casement-system reference; confirm opening direction, hardware interfaces, and weather-management details from drawings.', 'casement-window-system.webp'),
            ('Thermal-Break Window System Profiles', 'thermal-break-window-system', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. A thermal-break system reference for projects specifying separated interior and exterior aluminium sections. LingYe coordinates sourcing only; provide system sections, thermal and glazing requirements, hardware interfaces, target market, finish, quantity, and destination for supplier review.', 'Thermal-break construction, material interfaces, glazing, hardware, and any thermal targets must be defined and verified for the project.', 'Building envelopes; residential windows; commercial window systems.', 'Thermal-break system concept; no thermal performance is represented by this illustration or entry.', 'thermal-break-window-system.webp'),
            ('Sliding Door System Profiles', 'sliding-door-system', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. A system reference for sliding door assemblies, with panel, track, and hardware choices defined by the project. LingYe coordinates sourcing; send opening details, sections, glazing or panel information, hardware requirements, finish, quantity, and destination market.', 'Door layout, frame and sash geometry, panel interface, track, hardware, alloy, temper, finish, and project criteria are confirmed by drawing.', 'Patio doors; residential openings; commercial sliding door projects.', 'Sliding-door concept; coordinate frame, panel, track, and installation interfaces from the approved drawings.', 'sliding-door-system.webp'),
            ('Folding Door System Profiles', 'folding-door-system', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. A folding-panel door system reference for openings where the project specifies linked movable leaves. LingYe coordinates supplier sourcing; provide opening elevations, panel arrangement, section drawings, hardware layout, finish, quantity, and destination for review.', 'Panel arrangement, hinge and guide interfaces, glazing, section geometry, material, finish, and operating requirements are project-specific.', 'Residential folding doors; balcony openings; commercial partitions.', 'Folding-system reference; confirm panel sequence, hardware, clearances, and installation details from project documents.', 'folding-door-system.webp'),
            ('Commercial Entrance and Shopfront System Profiles', 'commercial-entrance-shopfront-system', 'Illustrative reference only; final profile section and compatibility are confirmed against project drawings. A commercial entrance and shopfront system reference for glazed storefront or public-facing building projects. LingYe coordinates project sourcing; provide facade elevations, sections, glass and door details, hardware interfaces, local requirements, finish, quantities, and destination market.', 'Entrance layout, glazing, door hardware, section interfaces, material, finish, and applicable project requirements must be reviewed by qualified parties.', 'Retail shopfronts; commercial entrances; glazed storefront projects.', 'Shopfront system concept; coordinate glazing, entry, thresholds, and adjoining facade details from project documents.', 'commercial-entrance-shopfront-system.webp'),
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

PRODUCT_LOCALES = ('en', 'zh', 'es', 'pt', 'de', 'fr', 'it', 'ru', 'hi')
TRANSLATED_FIELDS = (
    'name', 'description', 'features', 'applications', 'specifications',
    'range_param', 'type_param', 'surface_treatment', 'colors', 'grade', 'temper',
)
NEW_PRODUCT_SLUGS = {
    '2040-t-slot-aluminium-profile', '2060-t-slot-aluminium-profile',
    '3060-t-slot-aluminium-profile', '4080-t-slot-aluminium-profile',
    '5050-t-slot-aluminium-profile', '6060-t-slot-aluminium-profile',
    '8080-t-slot-aluminium-profile', '9090-t-slot-aluminium-profile',
    '90-degree-external-corner-bracket', 'three-way-connector', 'angle-bracket',
    'flat-joining-plate', 't-slot-nut', 't-bolt', 'anchor-fastener-set',
    'profile-end-cap', 'panel-fastener', 'hinge', 'leveling-foot', 'caster-wheel',
    'sliding-window-system', 'casement-window-system',
    'thermal-break-window-system', 'sliding-door-system', 'folding-door-system',
    'commercial-entrance-shopfront-system',
}


class Command(BaseCommand):
    help = 'Create or update the five-category LingYe catalog and its 46 illustrated products.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--translations-dir',
            default=str(Path(settings.BASE_DIR) / 'translations'),
            help='Directory where ID-keyed product locale files are written.',
        )

    def _load_catalog_sources(self):
        source_dir = Path(settings.BASE_DIR) / 'translations'
        sources = {}
        for locale in PRODUCT_LOCALES:
            source_path = source_dir / f'product_{locale}.json'
            try:
                with source_path.open(encoding='utf-8') as source_file:
                    source_data = json.load(source_file)
            except (OSError, json.JSONDecodeError) as exc:
                raise CommandError(f'Cannot read product translation source {locale}: {exc}') from exc

            catalog = source_data.get('_catalog_by_slug', {})
            for slug in sorted(NEW_PRODUCT_SLUGS):
                localized = catalog.get(slug, {}) if isinstance(catalog, dict) else {}
                missing = [
                    field for field in TRANSLATED_FIELDS
                    if not isinstance(localized.get(field), str) or not localized[field].strip()
                ]
                if missing:
                    raise CommandError(
                        f'Incomplete product translations for locale {locale}, slug {slug}: '
                        f'{", ".join(missing)}'
                    )
            sources[locale] = catalog
        return sources

    def _merge_catalog_translations(self, translations_dir, sources):
        output_dir = Path(translations_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        product_ids = dict(
            Product.objects.filter(slug__in=NEW_PRODUCT_SLUGS).values_list('slug', 'id')
        )
        for locale in PRODUCT_LOCALES:
            output_path = output_dir / f'product_{locale}.json'
            if output_path.exists():
                try:
                    with output_path.open(encoding='utf-8') as output_file:
                        output_data = json.load(output_file)
                except (OSError, json.JSONDecodeError) as exc:
                    raise CommandError(f'Cannot read product translation output {locale}: {exc}') from exc
            else:
                output_data = {}

            for slug, product_id in product_ids.items():
                translated = sources[locale][slug]
                for field in TRANSLATED_FIELDS:
                    output_data[f'{field}_{product_id}'] = translated[field]
            existing_catalog = output_data.get('_catalog_by_slug', {})
            output_data['_catalog_by_slug'] = {**existing_catalog, **sources[locale]}
            try:
                with output_path.open('w', encoding='utf-8') as output_file:
                    json.dump(output_data, output_file, ensure_ascii=False, indent=2)
                    output_file.write('\n')
            except OSError as exc:
                raise CommandError(f'Cannot write product translation output {locale}: {exc}') from exc

    def handle(self, *args, **options):
        translation_sources = self._load_catalog_sources()
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
                previous_category_max_order = -1
                for category_order, group in enumerate(CATALOG, start=1):
                    category_name, category_slug, category_description = group['category']
                    category, _ = Category.objects.update_or_create(
                        slug=category_slug,
                        defaults={'name': category_name, 'description': category_description, 'order': category_order, 'is_active': True},
                    )
                    order_base = max(
                        (category_order - 1) * 10,
                        previous_category_max_order + 1,
                    )
                    for product_order, item in enumerate(group['products'], start=1):
                        name, slug, description, specifications, applications, features, image_name = item
                        image_relative = f'products/catalog/{image_name}'
                        image_target = media_root / image_relative
                        image_target.parent.mkdir(parents=True, exist_ok=True)
                        if not image_target.exists():
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
                                'order': order_base + product_order,
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
                    previous_category_max_order = order_base + len(group['products'])
        finally:
            post_save.connect(auto_translate_category, sender=Category)
            post_save.connect(auto_translate_product, sender=Product)

        self._merge_catalog_translations(options['translations_dir'], translation_sources)

        self.stdout.write(self.style.SUCCESS(f'LingYe catalog ready: {len(CATALOG)} categories, {count} products, {count} primary images.'))
