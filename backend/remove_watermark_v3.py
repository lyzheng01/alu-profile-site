#!/usr/bin/env python3
"""
去除图片上的"豆包AI生成"水印 - 激进修复版
直接使用周围区域的内容填充水印
"""
import os
from PIL import Image, ImageFilter
import numpy as np

def inpaint_aggressive(img_array, y_start, y_end, x_start, x_end):
    """
    使用更激进的修复方法：直接复制周围区域的内容
    """
    height, width = img_array.shape[:2]
    
    # 确保坐标在范围内
    y_start = max(0, y_start)
    y_end = min(height, y_end)
    x_start = max(0, x_start)
    x_end = min(width, x_end)
    
    region_height = y_end - y_start
    region_width = x_end - x_start
    
    if region_height <= 0 or region_width <= 0:
        return
    
    # 获取周围区域的大小
    padding = max(region_width, region_height) * 2
    
    # 方法1: 如果是角落区域，使用镜像填充
    # 检测是哪个角落
    is_top = y_start < height / 2
    is_bottom = y_end > height / 2
    is_left = x_start < width / 2
    is_right = x_end > width / 2
    
    # 获取参考区域（水印区域外的区域）
    if is_bottom and is_right:  # 右下角
        # 使用上方和左侧的区域
        ref_y_start = max(0, y_start - padding)
        ref_y_end = y_start
        ref_x_start = max(0, x_start - padding)
        ref_x_end = x_start
        
        if ref_y_end > ref_y_start and ref_x_end > ref_x_start:
            ref_region = img_array[ref_y_start:ref_y_end, ref_x_start:ref_x_end]
            # 将参考区域缩放到水印区域大小
            ref_img = Image.fromarray(ref_region)
            ref_resized = ref_img.resize((region_width, region_height), Image.Resampling.LANCZOS)
            img_array[y_start:y_end, x_start:x_end] = np.array(ref_resized)
            return
    
    if is_top and is_right:  # 右上角
        # 使用下方和左侧的区域
        ref_y_start = y_end
        ref_y_end = min(height, y_end + padding)
        ref_x_start = max(0, x_start - padding)
        ref_x_end = x_start
        
        if ref_y_end > ref_y_start and ref_x_end > ref_x_start:
            ref_region = img_array[ref_y_start:ref_y_end, ref_x_start:ref_x_end]
            ref_img = Image.fromarray(ref_region)
            ref_resized = ref_img.resize((region_width, region_height), Image.Resampling.LANCZOS)
            img_array[y_start:y_end, x_start:x_end] = np.array(ref_resized)
            return
    
    if is_top and is_left:  # 左上角
        # 使用下方和右侧的区域
        ref_y_start = y_end
        ref_y_end = min(height, y_end + padding)
        ref_x_start = x_end
        ref_x_end = min(width, x_end + padding)
        
        if ref_y_end > ref_y_start and ref_x_end > ref_x_start:
            ref_region = img_array[ref_y_start:ref_y_end, ref_x_start:ref_x_end]
            ref_img = Image.fromarray(ref_region)
            ref_resized = ref_img.resize((region_width, region_height), Image.Resampling.LANCZOS)
            img_array[y_start:y_end, x_start:x_end] = np.array(ref_resized)
            return
    
    # 默认方法：使用周围所有区域的平均值
    ref_y_start = max(0, y_start - padding)
    ref_y_end = min(height, y_end + padding)
    ref_x_start = max(0, x_start - padding)
    ref_x_end = min(width, x_end + padding)
    
    # 创建mask，排除水印区域
    ref_region = img_array[ref_y_start:ref_y_end, ref_x_start:ref_x_end].copy()
    mask_y_start = y_start - ref_y_start
    mask_y_end = y_end - ref_y_start
    mask_x_start = x_start - ref_x_start
    mask_x_end = x_end - ref_x_start
    
    # 排除水印区域
    mask = np.ones((ref_region.shape[0], ref_region.shape[1]), dtype=bool)
    mask[mask_y_start:mask_y_end, mask_x_start:mask_x_end] = False
    
    # 计算参考区域的平均颜色
    if np.any(mask):
        ref_pixels = ref_region[mask]
        avg_color = np.mean(ref_pixels.reshape(-1, 3), axis=0)
        
        # 使用平均颜色填充，但添加一些纹理
        # 获取参考区域的纹理
        ref_img = Image.fromarray(ref_region)
        blurred = ref_img.filter(ImageFilter.GaussianBlur(radius=5))
        blurred_array = np.array(blurred)
        
        # 在水印区域使用模糊后的纹理
        for i in range(region_height):
            for j in range(region_width):
                ref_y = mask_y_start + i
                ref_x = mask_x_start + j
                if 0 <= ref_y < blurred_array.shape[0] and 0 <= ref_x < blurred_array.shape[1]:
                    # 混合平均颜色和模糊纹理
                    img_array[y_start + i, x_start + j] = (
                        avg_color * 0.3 + blurred_array[ref_y, ref_x] * 0.7
                    ).astype(np.uint8)

def detect_watermark_regions(img_array):
    """
    检测所有可能的水印区域
    """
    height, width = img_array.shape[:2]
    regions = []
    
    corner_size = min(int(width * 0.3), int(height * 0.2))
    
    corners = [
        ('bottom_right', height - corner_size, height, width - corner_size, width),
        ('bottom_left', height - corner_size, height, 0, corner_size),
        ('top_right', 0, corner_size, width - corner_size, width),
        ('top_left', 0, corner_size, 0, corner_size),
    ]
    
    for name, y_start, y_end, x_start, x_end in corners:
        region = img_array[y_start:y_end, x_start:x_end]
        if region.size == 0:
            continue
            
        brightness = np.mean(region, axis=2)
        threshold = 180
        bright_mask = brightness > threshold
        
        if np.any(bright_mask):
            bright_pixels = np.sum(bright_mask)
            total_pixels = bright_mask.size
            bright_ratio = bright_pixels / total_pixels
            
            if bright_ratio > 0.05:
                bright_coords = np.where(bright_mask)
                if len(bright_coords[0]) > 0:
                    min_y = np.min(bright_coords[0])
                    max_y = np.max(bright_coords[0])
                    min_x = np.min(bright_coords[1])
                    max_x = np.max(bright_coords[1])
                    
                    margin = 20
                    region_y_start = y_start + max(0, min_y - margin)
                    region_y_end = y_start + min(corner_size, max_y + margin + 1)
                    region_x_start = x_start + max(0, min_x - margin)
                    region_x_end = x_start + min(corner_size, max_x + margin + 1)
                    
                    regions.append((region_y_start, region_y_end, region_x_start, region_x_end, name))
                    print(f"检测到水印区域 ({name}): ({region_y_start}, {region_y_end}, {region_x_start}, {region_x_end})")
    
    return regions

def remove_watermark(image_path, output_path=None):
    """
    去除图片上的水印
    """
    if output_path is None:
        output_path = image_path
    
    img = Image.open(image_path)
    width, height = img.size
    print(f"图片尺寸: {width}x{height}")
    
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    img_array = np.array(img)
    
    watermark_regions = detect_watermark_regions(img_array)
    
    if not watermark_regions:
        print("未检测到水印区域")
        return
    
    for y_start, y_end, x_start, x_end, name in watermark_regions:
        print(f"正在修复区域 {name}...")
        inpaint_aggressive(img_array, y_start, y_end, x_start, x_end)
    
    result_img = Image.fromarray(img_array)
    result_img.save(output_path, quality=95)
    print(f"✓ 已处理图片: {image_path}")

if __name__ == '__main__':
    image_path = '/www/wwwroot/Aluminum/backend/media/factory_images/首页图片1.png'
    
    if not os.path.exists(image_path):
        print(f"错误: 图片文件不存在: {image_path}")
        exit(1)
    
    backup_path = image_path + '.backup'
    if os.path.exists(backup_path):
        import shutil
        shutil.copy2(backup_path, image_path)
        print(f"✓ 已从备份恢复原图")
    
    remove_watermark(image_path)
    print("✓ 完成！")

