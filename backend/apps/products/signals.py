from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Product, Category
from .services import translation_service


@receiver(post_save, sender=Product)
def auto_translate_product(sender, instance, created, **kwargs):
    """产品保存时自动翻译"""
    if created or instance.is_active:  # 新创建或激活的产品
        try:
            translation_service.auto_translate_on_save(instance, 'product')
        except Exception as e:
            print(f"产品自动翻译失败 ID {instance.id}: {e}")


@receiver(post_save, sender=Category)
def auto_translate_category(sender, instance, created, **kwargs):
    """分类保存时自动翻译"""
    if created or instance.is_active:  # 新创建或激活的分类
        try:
            translation_service.auto_translate_on_save(instance, 'category')
        except Exception as e:
            print(f"分类自动翻译失败 ID {instance.id}: {e}") 