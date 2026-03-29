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

# 获取部署详情
deployment_id = "78c44a9d-4f45-4e52-ba3a-95511575adb8"
url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/{PROJECT_NAME}/deployments/{deployment_id}"
resp = requests.get(url, headers=headers)
result = resp.json()

if result.get('success'):
    d = result['result']
    print(f"Deployment: {d['id']}")
    print(f"URL: {d['url']}")
    print(f"Environment: {d.get('environment')}")
    print(f"Branch: {d.get('deployment_trigger', {}).get('metadata', {}).get('branch', 'N/A')}")
    print(f"Commit: {d.get('deployment_trigger', {}).get('metadata', {}).get('commit_hash', 'N/A')}")
    print(f"Source: {d.get('deployment_trigger', {}).get('type', 'N/A')}")
    
    # 检查构建配置
    if 'build_config' in d:
        print(f"\nBuild config:")
        for k, v in d['build_config'].items():
            print(f"  {k}: {v}")
else:
    print(f"Error: {result}")