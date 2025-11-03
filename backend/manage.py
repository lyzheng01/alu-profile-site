#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aluminum.settings')
    try:
        from django.core.management import execute_from_command_line
        from aluminum.settings import DEFAULT_PORT
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    # 如果是runserver命令且没有指定端口，使用默认端口9001
    if len(sys.argv) >= 2 and sys.argv[1] == 'runserver' and len(sys.argv) == 2:
        try:
            sys.argv.append(str(DEFAULT_PORT))
        except NameError:
            sys.argv.append('9001')  # 默认端口
    
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
