#!/usr/bin/env python
"""
Add friend link: es.enfsolar.com/shenghai-aluminum
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aluminum.settings')
django.setup()

from apps.about.models import FriendLink  # noqa: E402


def add_friend_link():
    """Add the ENF Solar friend link"""
    url = "https://es.enfsolar.com/shenghai-aluminum"
    name = "ENF Solar"
    description = "Solar energy directory and marketplace"
    
    # Check if link already exists
    existing_link = FriendLink.objects.filter(url=url).first()
    if existing_link:
        print(f"Friend link already exists: {existing_link.name} (ID: {existing_link.id})")
        print(f"  URL: {existing_link.url}")
        print(f"  Active: {existing_link.is_active}")
        return existing_link
    
    # Create new friend link
    friend_link = FriendLink.objects.create(
        name=name,
        url=url,
        description=description,
        order=0,
        is_active=True,
        is_nofollow=False,  # 设置为False，因为这是反向链接，我们希望传递SEO价值
        target_blank=True,
    )
    
    print(f"✓ Successfully created friend link:")
    print(f"  ID: {friend_link.id}")
    print(f"  Name: {friend_link.name}")
    print(f"  URL: {friend_link.url}")
    print(f"  Description: {friend_link.description}")
    print(f"  Active: {friend_link.is_active}")
    print(f"  NoFollow: {friend_link.is_nofollow}")
    print(f"  Target Blank: {friend_link.target_blank}")
    
    return friend_link


if __name__ == '__main__':
    print("Adding friend link: es.enfsolar.com/shenghai-aluminum")
    print("=" * 60)
    add_friend_link()
    print("=" * 60)
    print("Done!")










