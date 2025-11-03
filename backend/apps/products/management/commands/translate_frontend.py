from django.core.management.base import BaseCommand
from apps.products.services import translation_service


class Command(BaseCommand):
    help = '预翻译所有前端内容到所有支持的语言'

    def add_arguments(self, parser):
        parser.add_argument(
            '--language',
            type=str,
            help='指定要翻译的语言代码（如：en, es, fr等）',
        )
        parser.add_argument(
            '--all-languages',
            action='store_true',
            help='翻译到所有支持的语言',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='强制重新翻译，即使文件已存在',
        )

    def handle(self, *args, **options):
        # 支持的语言列表
        supported_languages = ['en', 'es', 'pt', 'fr', 'de', 'it', 'ru', 'hi']
        
        if options['language']:
            # 翻译到指定语言
            target_lang = options['language']
            if target_lang not in supported_languages:
                self.stdout.write(
                    self.style.ERROR(f'不支持的语言: {target_lang}')
                )
                return
            
            self.translate_frontend_content(target_lang, options['force'])
            
        elif options['all_languages']:
            # 翻译到所有语言
            for lang in supported_languages:
                self.stdout.write(f'正在翻译前端内容到 {lang}...')
                self.translate_frontend_content(lang, options['force'])
                self.stdout.write(
                    self.style.SUCCESS(f'前端内容 {lang} 翻译完成')
                )
        else:
            # 默认翻译到英文
            self.translate_frontend_content('en', options['force'])

    def translate_frontend_content(self, target_lang, force=False):
        """翻译前端内容到指定语言"""
        try:
            # 获取中文内容
            zh_content = translation_service.get_frontend_content('', 'zh-CN')
            
            if not isinstance(zh_content, dict):
                self.stdout.write(
                    self.style.ERROR('无法获取中文内容')
                )
                return
            
            # 检查是否已有翻译文件
            if not force:
                existing_translations = translation_service._load_translations_from_file('frontend', target_lang)
                if existing_translations:
                    self.stdout.write(
                        self.style.WARNING(f'前端内容 {target_lang} 翻译已存在，跳过翻译')
                    )
                    return
            
            # 开始翻译
            translated_content = {}
            total_keys = len(zh_content.keys())
            
            for i, key in enumerate(zh_content.keys(), 1):
                self.stdout.write(f'翻译进度: {i}/{total_keys} - {key}')
                translated_content[key] = translation_service.translate_frontend_content(key, target_lang)
                
                # 每翻译10个键保存一次
                if i % 10 == 0:
                    translation_service._save_translations_to_file('frontend', target_lang, translated_content)
                    self.stdout.write(f'已保存 {i}/{total_keys} 个翻译')
            
            # 最终保存
            translation_service._save_translations_to_file('frontend', target_lang, translated_content)
            
            self.stdout.write(
                self.style.SUCCESS(f'前端内容 {target_lang} 翻译完成，共翻译 {len(translated_content)} 个键')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'翻译前端内容到 {target_lang} 失败: {e}')
            ) 