#!/usr/bin/env python3
"""
最终版：精确去除所有水印区域
"""
import os
from PIL import Image, ImageFilter
import numpy as np

def remove_white_watermark_in_corners(img_array, threshold=240):
    """
    只在角落区域去除高亮（白色）水印
    """
    height, width = img_array.shape[:2]
    result = img_array.copy()
    
    # 只处理角落区域
    corner_size = min(int(width * 0.25), int(height * 0.2))
    
    corners = [
        (0, corner_size, 0, corner_size),  # 左上
        (0, corner_size, width - corner_size, width),  # 右上
        (height - corner_size, height, 0, corner_size),  # 左下
        (height - corner_size, height, width - corner_size, width),  # 右下
    ]
    
    total_processed = 0
    
    for y1, y2, x1, x2 in corners:
        y1, y2 = max(0, y1), min(height, y2)
        x1, x2 = max(0, x1), min(width, x2)
        
        corner_region = img_array[y1:y2, x1:x2]
        brightness = np.mean(corner_region, axis=2)
        bright_mask = brightness > threshold
        
        if np.any(bright_mask):
            processed = 0
            # 获取周围非高亮像素作为参考
            ref_y1 = max(0, y1 - corner_size)
            ref_y2 = min(height, y2 + corner_size)
            ref_x1 = max(0, x1 - corner_size)
            ref_x2 = min(width, x2 + corner_size)
            
            ref_region = img_array[ref_y1:ref_y2, ref_x1:ref_x2]
            ref_brightness = np.mean(ref_region, axis=2)
            ref_mask = ref_brightness <= threshold
            
            if np.any(ref_mask):
                ref_pixels = ref_region[ref_mask]
                avg_color = np.mean(ref_pixels.reshape(-1, 3), axis=0)
                
                for i in range(y2 - y1):
                    for j in range(x2 - x1):
                        if bright_mask[i, j]:
                            result[y1 + i, x1 + j] = avg_color.astype(np.uint8)
                            processed += 1
            
            if processed > 0:
                print(f"  处理了 {processed} 个高亮像素")
                total_processed += processed
    
    if total_processed > 0:
        print(f"总共处理了 {total_processed} 个高亮像素")
        return result
    else:
        return img_array

def remove_corner_watermarks(img_array):
    """
    专门处理角落的水印
    """
    height, width = img_array.shape[:2]
    result = img_array.copy()
    
    # 定义角落区域
    corner_regions = [
        # (name, y_start, y_end, x_start, x_end, ref_y_start, ref_y_end, ref_x_start, ref_x_end)
        ('右下角', height - 400, height, width - 400, width, 
         height - 800, height - 400, width - 800, width - 400),
        ('右上角', 0, 400, width - 400, width,
         400, 800, width - 800, width - 400),
        ('左上角', 0, 400, 0, 400,
         400, 800, 400, 800),
        ('左下角', height - 400, height, 0, 400,
         height - 800, height - 400, 400, 800),
    ]
    
    for name, y1, y2, x1, x2, ref_y1, ref_y2, ref_x1, ref_x2 in corner_regions:
        # 确保坐标有效
        y1, y2 = max(0, y1), min(height, y2)
        x1, x2 = max(0, x1), min(width, x2)
        ref_y1, ref_y2 = max(0, ref_y1), min(height, ref_y2)
        ref_x1, ref_x2 = max(0, ref_x1), min(width, ref_x2)
        
        if ref_y2 > ref_y1 and ref_x2 > ref_x1:
            # 获取参考区域
            ref_region = img_array[ref_y1:ref_y2, ref_x1:ref_x2]
            region_height = y2 - y1
            region_width = x2 - x1
            
            if region_height > 0 and region_width > 0:
                # 将参考区域缩放到水印区域大小
                ref_img = Image.fromarray(ref_region)
                ref_resized = ref_img.resize((region_width, region_height), Image.Resampling.LANCZOS)
                
                # 检查该区域是否有高亮像素
                region = img_array[y1:y2, x1:x2]
                brightness = np.mean(region, axis=2)
                if np.max(brightness) > 200:
                    print(f"处理 {name} 区域...")
                    result[y1:y2, x1:x2] = np.array(ref_resized)
    
    return result

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
    
    # 方法1: 处理角落水印
    print("\n方法1: 处理角落水印...")
    result = remove_corner_watermarks(img_array)
    
    # 方法2: 处理角落的高亮水印
    print("\n方法2: 处理角落的高亮水印...")
    result = remove_white_watermark_in_corners(result, threshold=240)
    
    result_img = Image.fromarray(result)
    result_img.save(output_path, quality=95)
    print(f"\n✓ 已处理图片: {image_path}")

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

