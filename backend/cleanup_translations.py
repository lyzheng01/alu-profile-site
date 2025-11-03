#!/usr/bin/env python
"""
清理多余的语言文件，只保留4种语言：en, zh, es, pt
"""
import os
import glob

def cleanup_translations():
    """清理多余的语言文件"""
    print("开始清理多余的语言文件...")
    
    # 需要保留的语言
    keep_languages = ['en', 'zh', 'es', 'pt']
    
    # 需要删除的语言
    remove_languages = ['de', 'fr', 'hi', 'ru', 'it']
    
    # 获取所有翻译文件
    translation_files = glob.glob('translations/*.json')
    
    deleted_count = 0
    for file_path in translation_files:
        filename = os.path.basename(file_path)
        
        # 检查是否是需要删除的语言文件
        for lang in remove_languages:
            if f'_{lang}.json' in filename:
                try:
                    os.remove(file_path)
                    print(f"删除: {filename}")
                    deleted_count += 1
                except Exception as e:
                    print(f"删除失败 {filename}: {e}")
    
    print(f"清理完成！删除了 {deleted_count} 个多余的语言文件")
    print("保留的语言: en, zh, es, pt")

if __name__ == '__main__':
    cleanup_translations()
