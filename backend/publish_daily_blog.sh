#!/bin/bash
export GRSAI_API_KEY="sk-33e7033c7d794d33b96c00c28fafadb7"
export GRSAI_BASE_URL="https://grsaiapi.com"
cd /www/wwwroot/Aluminum/backend
/www/server/pyporject_evn/versions/3.13.1/bin/python3 daily_aluminum_blog_publish.py >> /tmp/aluminum-blog-publish.log 2>&1
