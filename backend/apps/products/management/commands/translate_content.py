from django.core.management.base import BaseCommand
from apps.products.models import Product, Category
from apps.inquiry.models import Inquiry, ContactInfo
from apps.about.models import CompanyInfo, Advantage, Certificate
from apps.news.models import Article
from apps.products.services import translation_service


class Command(BaseCommand):
    help = '翻译内容到指定语言'

    def add_arguments(self, parser):
        parser.add_argument(
            '--language',
            type=str,
            default='zh',
            help='目标语言代码（默认：zh）',
        )
        parser.add_argument(
            '--model',
            type=str,
            choices=['product', 'category', 'article', 'contact_info', 'company_info', 'advantage', 'certificate', 'all'],
            default='all',
            help='要翻译的模型类型（默认：all）',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='强制重新翻译，即使已存在翻译',
        )
        parser.add_argument(
            '--all-languages',
            action='store_true',
            help='翻译到所有支持的语言',
        )

    def handle(self, *args, **options):
        language = options['language']
        model_type = options['model']
        force = options['force']
        all_languages = options['all_languages']

        # 支持的语言列表（排除英语，因为英语是源语言）
        supported_languages = ['zh', 'es', 'pt', 'fr', 'de', 'it', 'ru', 'hi']

        if all_languages:
            # 翻译到所有语言
            for lang in supported_languages:
                self.stdout.write(f'正在翻译到 {lang}...')
                self.translate_content(lang, model_type, force)
        else:
            # 翻译到指定语言
            self.translate_content(language, model_type, force)

    def translate_content(self, language, model_type, force=False):
        """翻译指定类型的内容"""
        try:
            if model_type == 'product' or model_type == 'all':
                self.translate_products(language, force)
            
            if model_type == 'category' or model_type == 'all':
                self.translate_categories(language, force)
            
            if model_type == 'article' or model_type == 'all':
                self.translate_articles(language, force)
            
            if model_type == 'contact_info' or model_type == 'all':
                self.translate_contact_info(language, force)
            
            if model_type == 'company_info' or model_type == 'all':
                self.translate_company_info(language, force)
            
            if model_type == 'advantage' or model_type == 'all':
                self.translate_advantages(language, force)
            
            if model_type == 'certificate' or model_type == 'all':
                self.translate_certificates(language, force)

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'翻译失败: {e}')
            )

    def translate_products(self, language, force=False):
        """翻译产品"""
        products = Product.objects.filter(is_active=True)
        if products.exists():
            self.stdout.write(f'正在翻译 {products.count()} 个产品到 {language}...')
            translation_service.translate_model_batch('product', products, language, force)
            self.stdout.write(
                self.style.SUCCESS(f'产品翻译完成: {language}')
            )
        else:
            self.stdout.write('没有找到需要翻译的产品')

    def translate_categories(self, language, force=False):
        """翻译分类"""
        categories = Category.objects.filter(is_active=True)
        if categories.exists():
            self.stdout.write(f'正在翻译 {categories.count()} 个分类到 {language}...')
            translation_service.translate_model_batch('category', categories, language, force)
            self.stdout.write(
                self.style.SUCCESS(f'分类翻译完成: {language}')
            )
        else:
            self.stdout.write('没有找到需要翻译的分类')

    def translate_articles(self, language, force=False):
        """翻译文章（资讯）"""
        articles = Article.objects.filter(status='published')
        if articles.exists():
            self.stdout.write(f'正在翻译 {articles.count()} 篇文章到 {language}...')
            translation_service.translate_model_batch('article', articles, language, force)
            self.stdout.write(
                self.style.SUCCESS(f'文章翻译完成: {language}')
            )
        else:
            self.stdout.write('没有找到需要翻译的文章')

    def translate_contact_info(self, language, force=False):
        """翻译联系信息"""
        contact_info = ContactInfo.objects.filter(is_active=True)
        if contact_info.exists():
            self.stdout.write(f'正在翻译 {contact_info.count()} 个联系信息到 {language}...')
            translation_service.translate_model_batch('contact_info', contact_info, language, force)
            self.stdout.write(
                self.style.SUCCESS(f'联系信息翻译完成: {language}')
            )
        else:
            self.stdout.write('没有找到需要翻译的联系信息')

    def translate_company_info(self, language, force=False):
        """翻译公司信息"""
        company_info = CompanyInfo.objects.filter(is_active=True)
        if company_info.exists():
            self.stdout.write(f'正在翻译 {company_info.count()} 个公司信息到 {language}...')
            translation_service.translate_model_batch('company_info', company_info, language, force)
            self.stdout.write(
                self.style.SUCCESS(f'公司信息翻译完成: {language}')
            )
        else:
            self.stdout.write('没有找到需要翻译的公司信息')

    def translate_advantages(self, language, force=False):
        """翻译企业优势"""
        advantages = Advantage.objects.filter(is_active=True)
        if advantages.exists():
            self.stdout.write(f'正在翻译 {advantages.count()} 个企业优势到 {language}...')
            translation_service.translate_model_batch('advantage', advantages, language, force)
            self.stdout.write(
                self.style.SUCCESS(f'企业优势翻译完成: {language}')
            )
        else:
            self.stdout.write('没有找到需要翻译的企业优势')

    def translate_certificates(self, language, force=False):
        """翻译证书信息"""
        certificates = Certificate.objects.filter(is_active=True)
        if certificates.exists():
            self.stdout.write(f'正在翻译 {certificates.count()} 个证书到 {language}...')
            translation_service.translate_model_batch('certificate', certificates, language, force)
            self.stdout.write(
                self.style.SUCCESS(f'证书翻译完成: {language}')
            )
        else:
            self.stdout.write('没有找到需要翻译的证书') 