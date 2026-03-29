#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import sys
import requests
from pathlib import Path

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

EMAIL = "15703377328@163.com"
API_TOKEN = "cfk_Ln2xtR1Po0wOQzz8mZSLazMpVjv9haeDkGI7drlSc6031c9c"
ACCOUNT_ID = "bd34999fb05053ec4d44b4db9dc8891f"
PROJECT_NAME = "yishan"

dist_dir = Path("dist")
url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/{PROJECT_NAME}/deployments"

headers = {
    "X-Auth-Email": EMAIL,
    "X-Auth-Key": API_TOKEN,
    "Content-Type": "application/json"
}

files = {}
for file_path in dist_dir.rglob("*"):
    if file_path.is_file():
        rel_path = str(file_path.relative_to(dist_dir)).replace("\\", "/")
        with open(file_path, 'rb') as f:
            files[rel_path] = (rel_path, f.read())

print(f"[*] Uploading {len(files)} files...")
total_size = sum(len(v[1]) for v in files.values())
print(f"[*] Total size: {total_size / 1024:.1f} KB")

response = requests.post(url, headers=headers, files=files)
result = response.json()

if result.get('success'):
    deployment = result['result']
    print(f"[SUCCESS] Deployment successful!")
    print(f"[+] Deployment URL: https://{deployment['url']}")
    print(f"[+] Production URL: https://yishan-96f.pages.dev")
    print(f"[+] Deployment ID: {deployment['id']}")
else:
    print(f"[FAILED] Response: {response.status_code}")
    print(f"[ERROR] {result.get('errors')}")
