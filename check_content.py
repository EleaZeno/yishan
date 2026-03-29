#!/usr/bin/env python3
import requests

# 检查主域名和预览域名的内容
urls = [
    "https://yishan-96f.pages.dev",
    "https://dd21398e.yishan-96f.pages.dev",
]

for url in urls:
    try:
        resp = requests.get(url, timeout=10)
        # 查找 JS 文件名
        import re
        js_match = re.search(r'/assets/index-([A-Za-z0-9_-]+)\.js', resp.text)
        js_name = js_match.group(0) if js_match else "NOT FOUND"
        
        # 检查是否有新功能关键词
        has_i18n = "i18n" in resp.text or "react-i18next" in resp.text
        has_theme = "ThemeProvider" in resp.text or "setTheme" in resp.text
        
        print(f"\n{url}")
        print(f"  Status: {resp.status_code}")
        print(f"  JS: {js_name}")
        print(f"  i18n: {has_i18n}")
        print(f"  Theme: {has_theme}")
    except Exception as e:
        print(f"\n{url}")
        print(f"  Error: {e}")