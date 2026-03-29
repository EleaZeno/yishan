#!/usr/bin/env python3
import requests

EMAIL = "15703377328@163.com"
API_KEY = "cfk_Ln2xtR1Po0wOQzz8mZSLazMpVjv9haeDkGI7drlSc6031c9c"
ACCOUNT_ID = "bd34999fb05053ec4d44b4db9dc8891f"
PROJECT_NAME = "yishan"

headers = {
    "X-Auth-Email": EMAIL,
    "X-Auth-Key": API_KEY,
}

# 获取最新部署
url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/{PROJECT_NAME}/deployments"
resp = requests.get(url, headers=headers)
result = resp.json()

if result.get('success'):
    deployments = result['result']
    print(f"Total deployments: {len(deployments)}")
    print("\nLatest 3 deployments:")
    for d in deployments[:3]:
        print(f"  - ID: {d['id'][:8]}")
        print(f"    URL: {d['url']}")
        print(f"    Time: {d['created_on']}")
        print(f"    Status: {d['latest_stage']['status']}")
        print()
else:
    print(f"Error: {result}")