from django.core.management.base import BaseCommand

from apps.products.models import ProductTemplate


COMMON_TEMPLATES = [
    {
        "name": "Window and Door Aluminium Profile",
        "type_param": "For window and door systems",
        "surface_treatment": "Anodized, Powder Coated, Electrophoresis, Wood Grain",
        "grade": "6063 Series",
        "temper": "T5, T6",
        "lead_time": "7-15 Days",
    },
    {
        "name": "Industrial T-Slot Aluminium Profile",
        "type_param": "For industrial framing, automation, and workstations",
        "surface_treatment": "Mill Finished, Silver Anodized, Black Anodized",
        "grade": "6061 / 6063 Series",
        "temper": "T5, T6",
        "lead_time": "7-15 Days",
    },
    {
        "name": "Tile Trim and Decorative Aluminium Profile",
        "type_param": "For tile trim, decoration, edge protection, and finishing",
        "surface_treatment": "Anodized, Brushed, Polished, Powder Coated",
        "grade": "6063 Series",
        "temper": "T5",
        "lead_time": "7-15 Days",
    },
    {
        "name": "Tube and Common Aluminium Profile",
        "type_param": "For square tube, round tube, angle, channel, and common profiles",
        "surface_treatment": "Mill Finished, Anodized, Powder Coated",
        "grade": "6061 / 6063 Series",
        "temper": "T5, T6",
        "lead_time": "7-15 Days",
    },
    {
        "name": "Custom OEM Aluminium Extrusion",
        "type_param": "For custom drawings, OEM extrusion, and project profiles",
        "surface_treatment": "Mill Finished, Anodized, Powder Coated, Wood Grain",
        "grade": "6061 / 6063 / 6082 Series",
        "temper": "T5, T6",
        "lead_time": "10-20 Days",
    },
]


class Command(BaseCommand):
    help = "Seed common aluminum product template presets."

    def handle(self, *args, **options):
        created_count = 0

        for template_data in COMMON_TEMPLATES:
            _, created = ProductTemplate.objects.get_or_create(
                name=template_data["name"],
                defaults=template_data,
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f"Seeded {created_count} product template presets.")
        )
