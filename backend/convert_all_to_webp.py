#!/usr/bin/env python3
"""
批量将 media 目录下所有子目录的图片转换为 WEBP 格式
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
        
        return True, original_size, webp_size, compression_ratio
    except Exception as e:
        return False, 0, 0, 0

def convert_directory(directory_path, quality=85, verbose=True):
    """
    转换目录下的所有图片为 WEBP 格式
    
    Args:
        directory_path: 目录路径
        quality: 压缩质量 (1-100)
        verbose: 是否显示详细信息
    """
    directory = Path(directory_path)
    if not directory.exists():
        if verbose:
            print(f"错误: 目录不存在 {directory_path}")
        return 0, 0, 0, 0
    
    # 支持的图片格式
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp'}
    
    # 查找所有图片文件
    image_files = []
    for ext in image_extensions:
        image_files.extend(directory.glob(f'*{ext}'))
        image_files.extend(directory.glob(f'*{ext.upper()}'))
    
    if not image_files:
        return 0, 0, 0, 0
    
    converted_count = 0
    failed_count = 0
    total_original_size = 0
    total_webp_size = 0
    
    for img_path in image_files:
        # 生成输出路径（保持原文件名，只改变扩展名）
        output_path = img_path.with_suffix('.webp')
        
        # 如果 WEBP 文件已存在，跳过
        if output_path.exists():
            if verbose:
                print(f"⚠ {os.path.basename(output_path)} 已存在，跳过")
            continue
        
        # 转换图片
        success, orig_size, webp_size, ratio = convert_to_webp(img_path, output_path, quality)
        if success:
            converted_count += 1
            total_original_size += orig_size
            total_webp_size += webp_size
            if verbose:
                print(f"✓ {os.path.basename(img_path)} -> {os.path.basename(output_path)}")
                print(f"  {orig_size / 1024:.2f} KB -> {webp_size / 1024:.2f} KB ({ratio:.1f}% 压缩)")
        else:
            failed_count += 1
            if verbose:
                print(f"✗ 转换失败 {os.path.basename(img_path)}")
    
    return converted_count, failed_count, total_original_size, total_webp_size

def convert_all_media_directories(media_root, quality=85, exclude_dirs=None):
    """
    转换 media 目录下所有子目录的图片
    
    Args:
        media_root: media 根目录路径
        quality: 压缩质量
        exclude_dirs: 要排除的目录列表
    """
    if exclude_dirs is None:
        exclude_dirs = []
    
    media_path = Path(media_root)
    if not media_path.exists():
        print(f"错误: media 目录不存在 {media_root}")
        return
    
    # 获取所有子目录
    subdirs = [d for d in media_path.iterdir() if d.is_dir() and d.name not in exclude_dirs]
    
    if not subdirs:
        print("未找到需要转换的子目录")
        return
    
    print(f"找到 {len(subdirs)} 个子目录需要转换")
    print(f"压缩质量: {quality}\n")
    print("=" * 60)
    
    total_converted = 0
    total_failed = 0
    total_original_size = 0
    total_webp_size = 0
    
    for subdir in sorted(subdirs):
        print(f"\n📁 处理目录: {subdir.name}")
        print("-" * 60)
        
        converted, failed, orig_size, webp_size = convert_directory(
            subdir, quality=quality, verbose=True
        )
        
        total_converted += converted
        total_failed += failed
        total_original_size += orig_size
        total_webp_size += webp_size
        
        if converted > 0:
            total_ratio = (1 - total_webp_size / total_original_size) * 100 if total_original_size > 0 else 0
            print(f"\n目录 {subdir.name} 统计:")
            print(f"  成功: {converted} 个")
            print(f"  失败: {failed} 个")
            if orig_size > 0:
                print(f"  原始总大小: {orig_size / 1024 / 1024:.2f} MB")
                print(f"  WEBP总大小: {webp_size / 1024 / 1024:.2f} MB")
                print(f"  压缩率: {(1 - webp_size / orig_size) * 100:.1f}%")
    
    print("\n" + "=" * 60)
    print("\n📊 总体统计:")
    print(f"  成功转换: {total_converted} 个文件")
    print(f"  转换失败: {total_failed} 个文件")
    if total_original_size > 0:
        print(f"  原始总大小: {total_original_size / 1024 / 1024:.2f} MB")
        print(f"  WEBP总大小: {total_webp_size / 1024 / 1024:.2f} MB")
        overall_ratio = (1 - total_webp_size / total_original_size) * 100
        print(f"  总体压缩率: {overall_ratio:.1f}%")
        print(f"  节省空间: {(total_original_size - total_webp_size) / 1024 / 1024:.2f} MB")

if __name__ == '__main__':
    # 默认 media 目录
    media_root = '/www/wwwroot/Aluminum/backend/media'
    
    # 质量参数（可选）
    quality = 85
    if len(sys.argv) > 1:
        try:
            quality = int(sys.argv[1])
            if not 1 <= quality <= 100:
                print("警告: 质量参数应在 1-100 之间，使用默认值 85")
                quality = 85
        except ValueError:
            print("警告: 无效的质量参数，使用默认值 85")
    
    # 排除已转换的目录（可选）
    exclude_dirs = ['articles']  # articles 已经转换过了
    
    print("开始批量转换 media 目录下的所有图片为 WEBP 格式...")
    print(f"Media 根目录: {media_root}")
    print(f"排除目录: {exclude_dirs}\n")
    
    convert_all_media_directories(media_root, quality=quality, exclude_dirs=exclude_dirs)

