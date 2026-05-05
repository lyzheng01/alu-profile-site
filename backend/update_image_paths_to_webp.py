#!/usr/bin/env python3
"""
批量更新数据库中的图片路径为 WEBP 格式
使用前请先备份数据库！
"""
import os
import django
import sys

# 设置 Django 环境
sys.path.insert(0, '/www/wwwroot/Aluminum/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aluminum.settings')
django.setup()

from django.db import transaction
from apps.products.models import Category, SubCategory, ProductImage
from apps.news.models import Article
from apps.about.models import FactoryImage

def convert_path_to_webp(image_path):
    """将图片路径转换为 WEBP 格式"""
    if not image_path:
        return None
    
    # 支持的格式
    extensions = ['.jpg', '.jpeg', '.png', '.gif']
    for ext in extensions:
        if image_path.lower().endswith(ext):
            return image_path.rsplit('.', 1)[0] + '.webp'
    
    # 如果已经是 webp 或其他格式，返回原值
    return image_path

def check_webp_exists(media_root, image_path):
    """检查 WEBP 文件是否存在"""
    if not image_path:
        return False
    
    webp_path = convert_path_to_webp(image_path)
    if webp_path == image_path:  # 没有转换
        return True
    
    full_path = os.path.join(media_root, webp_path)
    return os.path.exists(full_path)

def update_model_images(model_class, field_name, media_root, dry_run=True):
    """更新指定模型的图片路径"""
    print(f"\n=== 处理 {model_class.__name__}.{field_name} ===")
    
    # 获取所有有图片的记录
    filter_kwargs = {f'{field_name}__isnull': False}
    exclude_kwargs = {field_name: ''}
    objects = model_class.objects.filter(**filter_kwargs).exclude(**exclude_kwargs)
    
    total = objects.count()
    updated = 0
    skipped = 0
    failed = 0
    
    print(f"找到 {total} 条记录")
    
    for obj in objects:
        image_field = getattr(obj, field_name)
        if not image_field:
            continue
        
        current_path = image_field.name
        webp_path = convert_path_to_webp(current_path)
        
        # 如果路径没有变化，跳过
        if webp_path == current_path:
            skipped += 1
            continue
        
        # 检查 WEBP 文件是否存在
        if not check_webp_exists(media_root, current_path):
            print(f"  ⚠ 跳过: {current_path} (WEBP 文件不存在)")
            failed += 1
            continue
        
        # 更新路径
        if dry_run:
            print(f"  [DRY RUN] {current_path} -> {webp_path}")
        else:
            try:
                # 直接更新数据库字段
                model_class.objects.filter(pk=obj.pk).update(**{field_name: webp_path})
                print(f"  ✓ {current_path} -> {webp_path}")
                updated += 1
            except Exception as e:
                print(f"  ✗ 更新失败: {current_path} - {str(e)}")
                failed += 1
    
    return total, updated, skipped, failed

def main():
    from django.conf import settings
    
    media_root = settings.MEDIA_ROOT
    print(f"Media 根目录: {media_root}")
    print("\n" + "="*60)
    print("⚠️  警告：此脚本将修改数据库中的图片路径！")
    print("="*60)
    
    # 检查是否为 dry run
    dry_run = True
    if len(sys.argv) > 1 and sys.argv[1] == '--execute':
        dry_run = False
        print("\n⚠️  执行模式：将实际修改数据库！")
        response = input("确认继续？(yes/no): ")
        if response.lower() != 'yes':
            print("已取消")
            return
    else:
        print("\n🔍 预览模式（dry run）：不会实际修改数据库")
        print("   要实际执行，请运行: python update_image_paths_to_webp.py --execute")
    
    print("\n" + "="*60)
    
    total_stats = {'total': 0, 'updated': 0, 'skipped': 0, 'failed': 0}
    
    # 更新各个模型
    with transaction.atomic():
        # Category
        stats = update_model_images(Category, 'image', media_root, dry_run)
        total_stats['total'] += stats[0]
        total_stats['updated'] += stats[1]
        total_stats['skipped'] += stats[2]
        total_stats['failed'] += stats[3]
        
        # SubCategory
        stats = update_model_images(SubCategory, 'image', media_root, dry_run)
        total_stats['total'] += stats[0]
        total_stats['updated'] += stats[1]
        total_stats['skipped'] += stats[2]
        total_stats['failed'] += stats[3]
        
        # ProductImage
        stats = update_model_images(ProductImage, 'image', media_root, dry_run)
        total_stats['total'] += stats[0]
        total_stats['updated'] += stats[1]
        total_stats['skipped'] += stats[2]
        total_stats['failed'] += stats[3]
        
        # Article
        stats = update_model_images(Article, 'featured_image', media_root, dry_run)
        total_stats['total'] += stats[0]
        total_stats['updated'] += stats[1]
        total_stats['skipped'] += stats[2]
        total_stats['failed'] += stats[3]
        
        # FactoryImage
        stats = update_model_images(FactoryImage, 'image', media_root, dry_run)
        total_stats['total'] += stats[0]
        total_stats['updated'] += stats[1]
        total_stats['skipped'] += stats[2]
        total_stats['failed'] += stats[3]
        
        if dry_run:
            # 在 dry run 模式下，回滚事务
            transaction.set_rollback(True)
    
    # 打印统计
    print("\n" + "="*60)
    print("📊 统计结果:")
    print(f"  总记录数: {total_stats['total']}")
    print(f"  已更新: {total_stats['updated']}")
    print(f"  已跳过: {total_stats['skipped']}")
    print(f"  失败: {total_stats['failed']}")
    print("="*60)
    
    if dry_run:
        print("\n💡 这是预览模式，数据库未被修改")
        print("   要实际执行，请运行: python update_image_paths_to_webp.py --execute")

if __name__ == '__main__':
    main()

