#!/usr/bin/env python3
"""
批量将图片转换为 WEBP 格式
保持原文件名，只改变扩展名
"""
import os
import sys
from pathlib import Path
from PIL import Image

def convert_to_webp(input_path, output_path, quality=85):
    """
    将图片转换为 WEBP 格式
    
    Args:
        input_path: 输入图片路径
        output_path: 输出 WEBP 路径
        quality: 压缩质量 (1-100, 默认85)
    """
    try:
        # 打开图片
        with Image.open(input_path) as img:
            # 如果是 RGBA 模式，保持透明度
            if img.mode in ('RGBA', 'LA'):
                img.save(output_path, 'WEBP', quality=quality, method=6)
            else:
                # RGB 模式转换为 RGB（确保兼容性）
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                img.save(output_path, 'WEBP', quality=quality, method=6)
        
        # 获取文件大小对比
        original_size = os.path.getsize(input_path)
        webp_size = os.path.getsize(output_path)
        compression_ratio = (1 - webp_size / original_size) * 100
        
        print(f"✓ {os.path.basename(input_path)} -> {os.path.basename(output_path)}")
        print(f"  原始大小: {original_size / 1024:.2f} KB")
        print(f"  WEBP大小: {webp_size / 1024:.2f} KB")
        print(f"  压缩率: {compression_ratio:.1f}%")
        return True
    except Exception as e:
        print(f"✗ 转换失败 {os.path.basename(input_path)}: {str(e)}")
        return False

def convert_directory(directory_path, quality=85, delete_original=False):
    """
    转换目录下的所有图片为 WEBP 格式
    
    Args:
        directory_path: 目录路径
        quality: 压缩质量 (1-100)
        delete_original: 是否删除原始文件
    """
    directory = Path(directory_path)
    if not directory.exists():
        print(f"错误: 目录不存在 {directory_path}")
        return
    
    # 支持的图片格式
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp'}
    
    # 查找所有图片文件
    image_files = []
    for ext in image_extensions:
        image_files.extend(directory.glob(f'*{ext}'))
        image_files.extend(directory.glob(f'*{ext.upper()}'))
    
    if not image_files:
        print(f"在 {directory_path} 中未找到图片文件")
        return
    
    print(f"找到 {len(image_files)} 个图片文件")
    print(f"开始转换为 WEBP 格式 (质量: {quality})...\n")
    
    converted_count = 0
    failed_count = 0
    
    for img_path in image_files:
        # 生成输出路径（保持原文件名，只改变扩展名）
        output_path = img_path.with_suffix('.webp')
        
        # 如果 WEBP 文件已存在，跳过
        if output_path.exists():
            print(f"⚠ {os.path.basename(output_path)} 已存在，跳过")
            continue
        
        # 转换图片
        if convert_to_webp(img_path, output_path, quality):
            converted_count += 1
            # 如果转换成功且需要删除原文件
            if delete_original:
                try:
                    img_path.unlink()
                    print(f"  已删除原始文件: {os.path.basename(img_path)}")
                except Exception as e:
                    print(f"  警告: 无法删除原始文件: {str(e)}")
        else:
            failed_count += 1
        print()
    
    print(f"\n转换完成!")
    print(f"成功: {converted_count} 个")
    print(f"失败: {failed_count} 个")
    print(f"总计: {len(image_files)} 个")

if __name__ == '__main__':
    # 默认转换 articles 目录
    default_dir = '/www/wwwroot/Aluminum/backend/media/articles'
    
    if len(sys.argv) > 1:
        target_dir = sys.argv[1]
    else:
        target_dir = default_dir
    
    # 质量参数（可选）
    quality = 85
    if len(sys.argv) > 2:
        try:
            quality = int(sys.argv[2])
            if not 1 <= quality <= 100:
                print("警告: 质量参数应在 1-100 之间，使用默认值 85")
                quality = 85
        except ValueError:
            print("警告: 无效的质量参数，使用默认值 85")
    
    # 是否删除原文件（可选，默认不删除）
    delete_original = False
    if len(sys.argv) > 3 and sys.argv[3].lower() in ('true', '1', 'yes', 'delete'):
        delete_original = True
        print("⚠ 警告: 将删除原始图片文件!")
    
    convert_directory(target_dir, quality=quality, delete_original=delete_original)

