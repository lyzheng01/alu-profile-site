from django.core.management.base import BaseCommand
from apps.about.models import CompanyInfo


class Command(BaseCommand):
    help = 'Initialize basic company information'

    def handle(self, *args, **options):
        # Basic information
        basic_info = [
            ('company_name', 'Company Name', 'basic'),
            ('company_description', 'Company Description', 'basic'),
            ('company_vision', 'Company Vision', 'basic'),
            ('company_mission', 'Company Mission', 'basic'),
        ]
        
        # Contact information
        contact_info = [
            ('company_address', 'Company Address', 'contact'),
            ('company_phone', 'Contact Phone', 'contact'),
            ('company_email', 'Email Address', 'contact'),
            ('company_whatsapp', 'WhatsApp', 'contact'),
        ]
        
        # Social media
        social_info = [
            ('company_website', 'Website', 'social'),
            ('company_facebook', 'Facebook', 'social'),
            ('company_linkedin', 'LinkedIn', 'social'),
        ]
        
        # Statistics
        stats_info = [
            ('years_experience', 'Years Established', 'stats'),
            ('products_count', 'Number of Products', 'stats'),
            ('countries_served', 'Countries Served', 'stats'),
        ]
        
        all_info = basic_info + contact_info + social_info + stats_info
        
        created_count = 0
        for key, value, info_type in all_info:
            obj, created = CompanyInfo.objects.get_or_create(
                key=key,
                defaults={
                    'value': value,
                    'info_type': info_type,
                    'order': created_count
                }
            )
            if created:
                created_count += 1
                self.stdout.write(f'Created: {key} = {value}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully initialized {created_count} company info records')
        ) 