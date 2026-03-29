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

# 获取项目详情
url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/{PROJECT_NAME}"
resp = requests.get(url, headers=headers)
result = resp.json()

if result.get('success'):
    project = result['result']
    print(f"Project: {project['name']}")
    print(f"Production branch: {project.get('production_branch', 'N/A')}")
    print(f"Created: {project.get('created_on', 'N/A')}")
    print(f"\nLatest deployment:")
    if 'latest_deployment' in project:
        d = project['latest_deployment']
        print(f"  ID: {d['id']}")
        print(f"  URL: {d['url']}")
        print(f"  Environment: {d.get('environment', 'N/A')}")
        print(f"  Status: {d['latest_stage']['status']}")
else:
    print(f"Error: {result}")