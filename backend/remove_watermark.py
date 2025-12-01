#!/usr/bin/env python3
"""
去除图片上的"豆包AI生成"水印
使用智能修复算法
"""
import os
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def inpaint_region(img_array, mask_region):
    """
    使用周围像素修复指定区域
    """
    # 获取mask区域的坐标
    y_start, y_end, x_start, x_end = mask_region
    region_height = y_end - y_start
    region_width = x_end - x_start
    
    # 获取周围区域作为参考
    padding = max(region_width, region_height) // 2
    
    ref_y_start = max(0, y_start - padding)
    ref_y_end = min(img_array.shape[0], y_end + padding)
    ref_x_start = max(0, x_start - padding)
    ref_x_end = min(img_array.shape[1], x_end + padding)
    
    # 获取参考区域（排除水印区域本身）
    reference = img_array[ref_y_start:ref_y_end, ref_x_start:ref_x_end].copy()
    
    # 在参考区域中标记水印位置（相对坐标）
    ref_mask_y_start = y_start - ref_y_start
    ref_mask_y_end = y_end - ref_y_start
    ref_mask_x_start = x_start - ref_x_start
    ref_mask_x_end = x_end - ref_x_start
    
    # 使用周围像素的平均值来填充
    # 获取上方的像素
    if ref_mask_y_start > 0:
        top_pixels = reference[0:ref_mask_y_start, ref_mask_x_start:ref_mask_x_end]
        if top_pixels.size > 0:
            avg_top = np.mean(top_pixels.reshape(-1, 3), axis=0)
        else:
            avg_top = None
    else:
        avg_top = None
    
    # 获取下方的像素
    if ref_mask_y_end < reference.shape[0]:
        bottom_pixels = reference[ref_mask_y_end:, ref_mask_x_start:ref_mask_x_end]
        if bottom_pixels.size > 0:
            avg_bottom = np.mean(bottom_pixels.reshape(-1, 3), axis=0)
        else:
            avg_bottom = None
    else:
        avg_bottom = None
    
    # 获取左侧的像素
    if ref_mask_x_start > 0:
        left_pixels = reference[ref_mask_y_start:ref_mask_y_end, 0:ref_mask_x_start]
        if left_pixels.size > 0:
            avg_left = np.mean(left_pixels.reshape(-1, 3), axis=0)
        else:
            avg_left = None
    else:
        avg_left = None
    
    # 获取右侧的像素
    if ref_mask_x_end < reference.shape[1]:
        right_pixels = reference[ref_mask_y_start:ref_mask_y_end, ref_mask_x_end:]
        if right_pixels.size > 0:
            avg_right = np.mean(right_pixels.reshape(-1, 3), axis=0)
        else:
            avg_right = None
    else:
        avg_right = None
    
    # 计算所有参考像素的平均值
    ref_pixels = []
    if avg_top is not None:
        ref_pixels.append(avg_top)
    if avg_bottom is not None:
        ref_pixels.append(avg_bottom)
    if avg_left is not None:
        ref_pixels.append(avg_left)
    if avg_right is not None:
        ref_pixels.append(avg_right)
    
    if len(ref_pixels) > 0:
        avg_color = np.mean(ref_pixels, axis=0)
    else:
        # 如果都没有，使用整个参考区域的平均值
        avg_color = np.mean(reference.reshape(-1, 3), axis=0)
    
    # 使用渐变填充水印区域
    for i in range(region_height):
        for j in range(region_width):
            # 计算到边缘的距离
            dist_top = i
            dist_bottom = region_height - 1 - i
            dist_left = j
            dist_right = region_width - 1 - j
            
            # 根据距离边缘的远近，混合不同的参考颜色
            weights = []
            colors = []
            
            if avg_top is not None and dist_top < region_height // 3:
                weight = 1.0 - (dist_top / (region_height // 3))
                weights.append(weight)
                colors.append(avg_top)
            
            if avg_bottom is not None and dist_bottom < region_height // 3:
                weight = 1.0 - (dist_bottom / (region_height // 3))
                weights.append(weight)
                colors.append(avg_bottom)
            
            if avg_left is not None and dist_left < region_width // 3:
                weight = 1.0 - (dist_left / (region_width // 3))
                weights.append(weight)
                colors.append(avg_left)
            
            if avg_right is not None and dist_right < region_width // 3:
                weight = 1.0 - (dist_right / (region_width // 3))
                weights.append(weight)
                colors.append(avg_right)
            
            if len(weights) > 0:
                weights = np.array(weights)
                weights = weights / np.sum(weights)
                blended = np.sum([w * c for w, c in zip(weights, colors)], axis=0)
            else:
                blended = avg_color
            
            img_array[y_start + i, x_start + j] = blended.astype(np.uint8)

def detect_watermark_region(img_array):
    """
    检测水印区域（通常是在角落的白色/浅色文字）
    """
    height, width = img_array.shape[:2]
    
    # 检查右下角区域（最常见的 watermark 位置）
    corner_size = min(int(width * 0.3), int(height * 0.2))
    right_bottom_region = img_array[height - corner_size:, width - corner_size:]
    
    # 计算亮度
    if len(right_bottom_region.shape) == 3:
        brightness = np.mean(right_bottom_region, axis=2)
    else:
        brightness = right_bottom_region
    
    # 检测高亮区域（水印通常是白色或浅色）
    threshold = 220  # 亮度阈值
    bright_mask = brightness > threshold
    
    if np.any(bright_mask):
        # 找到高亮区域的边界
        bright_coords = np.where(bright_mask)
        if len(bright_coords[0]) > 0:
            min_y = np.min(bright_coords[0])
            max_y = np.max(bright_coords[0])
            min_x = np.min(bright_coords[1])
            max_x = np.max(bright_coords[1])
            
            # 添加一些边距
            margin = 10
            y_start = height - corner_size + max(0, min_y - margin)
            y_end = height - corner_size + min(corner_size, max_y + margin + 1)
            x_start = width - corner_size + max(0, min_x - margin)
            x_end = width - corner_size + min(corner_size, max_x + margin + 1)
            
            return (y_start, y_end, x_start, x_end)
    
    # 如果没有检测到，返回默认的右下角区域
    return (height - corner_size, height, width - corner_size, width)

def remove_watermark(image_path, output_path=None):
    """
    去除图片上的水印
    """
    if output_path is None:
        output_path = image_path
    
    # 打开图片
    img = Image.open(image_path)
    width, height = img.size
    
    # 转换为RGB模式
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # 转换为numpy数组
    img_array = np.array(img)
    
    # 检测水印区域
    watermark_region = detect_watermark_region(img_array)
    print(f"检测到水印区域: {watermark_region}")
    
    # 修复水印区域
    inpaint_region(img_array, watermark_region)
    
    # 转换回PIL Image并保存
    result_img = Image.fromarray(img_array)
    result_img.save(output_path, quality=95)
    print(f"✓ 已处理图片: {image_path}")
    print(f"  保存到: {output_path}")

if __name__ == '__main__':
    image_path = '/www/wwwroot/Aluminum/backend/media/factory_images/首页图片1.png'
    
    if not os.path.exists(image_path):
        print(f"错误: 图片文件不存在: {image_path}")
        exit(1)
    
    # 创建备份
    backup_path = image_path + '.backup'
    if not os.path.exists(backup_path):
        import shutil
        shutil.copy2(image_path, backup_path)
        print(f"✓ 已创建备份: {backup_path}")
    
    # 去除水印
    remove_watermark(image_path)
    print("✓ 完成！")

