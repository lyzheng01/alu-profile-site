#!/usr/bin/env python
"""
Django服务器启动脚本 - 端口9001
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aluminum.settings')
    django.setup()
    
    # 设置端口为9001，绑定到所有网络接口
    sys.argv = ['manage.py', 'runserver', '0.0.0.0:9001']
    execute_from_command_line(sys.argv)
