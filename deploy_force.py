#!/usr/bin/env python3
import requests
from pathlib import Path

EMAIL = "15703377328@163.com"
API_KEY = "cfk_Ln2xtR1Po0wOQzz8mZSLazMpVjv9haeDkGI7drlSc6031c9c"
ACCOUNT_ID = "bd34999fb05053ec4d44b4db9dc8891f"
PROJECT_NAME = "yishan"

headers = {
    "X-Auth-Email": EMAIL,
    "X-Auth-Key": API_KEY,
}

# 1. 先清除 Cloudflare 缓存
print("[1] Purging Cloudflare cache...")
zone_url = f"https://api.cloudflare.com/client/v4/zones"
# 获取 zone ID
resp = requests.get(zone_url, headers=headers)
zones = resp.json()
if zones.get('success'):
    for z in zones['result']:
        if 'pages.dev' in z.get('name', ''):
            zone_id = z['id']
            print(f"  Zone: {z['name']} ({zone_id})")
            # 清除所有缓存
            purge_url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache"
            purge_resp = requests.post(purge_url, headers=headers, json={"purge_everything": True})
            print(f"  Purge result: {purge_resp.json()}")

# 2. 重新部署
print("\n[2] Uploading files...")
dist_dir = Path("dist")
url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/{PROJECT_NAME}/deployments"

files = {}
for file_path in dist_dir.rglob("*"):
    if file_path.is_file():
        rel_path = str(file_path.relative_to(dist_dir)).replace("\\", "/")
        with open(file_path, 'rb') as f:
            files[rel_path] = (rel_path, f.read())

print(f"  Uploading {len(files)} files...")
resp = requests.post(url, headers=headers, files=files)
result = resp.json()

if result.get('success'):
    deployment = result['result']
    print(f"\n[SUCCESS] Deployment: {deployment['id']}")
    print(f"  URL: https://{deployment['url']}")
else:
    print(f"\n[FAILED] {result}")