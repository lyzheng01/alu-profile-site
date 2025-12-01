#!/usr/bin/env python3
"""
去除图片上的"豆包AI生成"水印 - 改进版
使用更精确的检测和修复方法
"""
import os
from PIL import Image, ImageFilter
import numpy as np

def detect_watermark_regions(img_array):
    """
    检测所有可能的水印区域（四个角落）
    """
    height, width = img_array.shape[:2]
    regions = []
    
    # 检查每个角落
    corner_size = min(int(width * 0.25), int(height * 0.15))
    
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
            
        # 计算亮度
        if len(region.shape) == 3:
            brightness = np.mean(region, axis=2)
        else:
            brightness = region
        
        # 检测高亮区域（水印通常是白色或浅色文字）
        # 降低阈值，因为水印可能不是纯白色
        threshold = 180
        bright_mask = brightness > threshold
        
        if np.any(bright_mask):
            bright_pixels = np.sum(bright_mask)
            total_pixels = bright_mask.size
            bright_ratio = bright_pixels / total_pixels
            
            # 如果高亮区域占比超过5%，可能是水印
            if bright_ratio > 0.05:
                # 找到高亮区域的边界
                bright_coords = np.where(bright_mask)
                if len(bright_coords[0]) > 0:
                    min_y = np.min(bright_coords[0])
                    max_y = np.max(bright_coords[0])
                    min_x = np.min(bright_coords[1])
                    max_x = np.max(bright_coords[1])
                    
                    # 添加边距
                    margin = 15
                    region_y_start = y_start + max(0, min_y - margin)
                    region_y_end = y_start + min(corner_size, max_y + margin + 1)
                    region_x_start = x_start + max(0, min_x - margin)
                    region_x_end = x_start + min(corner_size, max_x + margin + 1)
                    
                    regions.append((region_y_start, region_y_end, region_x_start, region_x_end, name))
                    print(f"检测到水印区域 ({name}): ({region_y_start}, {region_y_end}, {region_x_start}, {region_x_end})")
    
    return regions

def inpaint_region_advanced(img_array, y_start, y_end, x_start, x_end):
    """
    使用高级修复算法去除水印
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
    
    # 方法1: 使用周围区域的纹理进行修复
    padding = max(region_width, region_height)
    
    # 获取更大的参考区域
    ref_y_start = max(0, y_start - padding)
    ref_y_end = min(height, y_end + padding)
    ref_x_start = max(0, x_start - padding)
    ref_x_end = min(width, x_end + padding)
    
    # 创建水印区域的mask
    mask = np.zeros((ref_y_end - ref_y_start, ref_x_end - ref_x_start), dtype=bool)
    mask_y_start = y_start - ref_y_start
    mask_y_end = y_end - ref_y_start
    mask_x_start = x_start - ref_x_start
    mask_x_end = x_end - ref_x_start
    
    mask[mask_y_start:mask_y_end, mask_x_start:mask_x_end] = True
    
    # 获取参考区域
    ref_region = img_array[ref_y_start:ref_y_end, ref_x_start:ref_x_end].copy()
    
    # 使用高斯模糊来创建平滑的填充
    # 先对整个参考区域进行轻微模糊
    ref_img = Image.fromarray(ref_region)
    blurred = ref_img.filter(ImageFilter.GaussianBlur(radius=3))
    blurred_array = np.array(blurred)
    
    # 在水印区域使用模糊后的像素
    for i in range(region_height):
        for j in range(region_width):
            global_y = y_start + i
            global_x = x_start + j
            
            # 获取周围像素（排除水印区域）
            neighbors = []
            
            # 上方像素
            if global_y > 0:
                for offset in range(1, min(20, global_y - ref_y_start + 1)):
                    if not mask[mask_y_start + i - offset, mask_x_start + j]:
                        neighbors.append(img_array[global_y - offset, global_x])
                        break
            
            # 下方像素
            if global_y < height - 1:
                for offset in range(1, min(20, ref_y_end - global_y)):
                    if not mask[mask_y_start + i + offset, mask_x_start + j]:
                        neighbors.append(img_array[global_y + offset, global_x])
                        break
            
            # 左侧像素
            if global_x > 0:
                for offset in range(1, min(20, global_x - ref_x_start + 1)):
                    if not mask[mask_y_start + i, mask_x_start + j - offset]:
                        neighbors.append(img_array[global_y, global_x - offset])
                        break
            
            # 右侧像素
            if global_x < width - 1:
                for offset in range(1, min(20, ref_x_end - global_x)):
                    if not mask[mask_y_start + i, mask_x_start + j + offset]:
                        neighbors.append(img_array[global_y, global_x + offset])
                        break
            
            # 如果找到了邻居像素，使用它们的平均值
            if len(neighbors) > 0:
                avg_color = np.mean(neighbors, axis=0)
                # 与模糊后的像素混合
                blend_factor = 0.7
                img_array[global_y, global_x] = (
                    avg_color * blend_factor + 
                    blurred_array[mask_y_start + i, mask_x_start + j] * (1 - blend_factor)
                ).astype(np.uint8)
            else:
                # 如果没有邻居，直接使用模糊后的像素
                img_array[global_y, global_x] = blurred_array[mask_y_start + i, mask_x_start + j]

def remove_watermark(image_path, output_path=None):
    """
    去除图片上的水印
    """
    if output_path is None:
        output_path = image_path
    
    # 打开图片
    img = Image.open(image_path)
    width, height = img.size
    
    print(f"图片尺寸: {width}x{height}")
    
    # 转换为RGB模式
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # 转换为numpy数组
    img_array = np.array(img)
    
    # 检测所有水印区域
    watermark_regions = detect_watermark_regions(img_array)
    
    if not watermark_regions:
        print("未检测到水印区域")
        return
    
    # 修复每个水印区域
    for y_start, y_end, x_start, x_end, name in watermark_regions:
        print(f"正在修复区域 {name}...")
        inpaint_region_advanced(img_array, y_start, y_end, x_start, x_end)
    
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
    
    # 恢复备份（如果需要）
    backup_path = image_path + '.backup'
    if os.path.exists(backup_path):
        import shutil
        shutil.copy2(backup_path, image_path)
        print(f"✓ 已从备份恢复原图")
    
    # 去除水印
    remove_watermark(image_path)
    print("✓ 完成！")

