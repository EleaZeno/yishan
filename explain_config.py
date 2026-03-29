#!/usr/bin/env python3
import requests
import json

EMAIL = "15703377328@163.com"
API_KEY = "cfk_Ln2xtR1Po0wOQzz8mZSLazMpVjv9haeDkGI7drlSc6031c9c"
ACCOUNT_ID = "bd34999fb05053ec4d44b4db9dc8891f"
PROJECT_NAME = "yishan"

headers = {
    "X-Auth-Email": EMAIL,
    "X-Auth-Key": API_KEY,
    "Content-Type": "application/json",
}

# 获取当前项目配置
url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/{PROJECT_NAME}"
resp = requests.get(url, headers={"X-Auth-Email": EMAIL, "X-Auth-Key": API_KEY})
current = resp.json()

print("Current project config:")
if current.get('success'):
    project = current['result']
    print(f"  Name: {project['name']}")
    print(f"  Production branch: {project.get('production_branch')}")
    print(f"  Source: {project.get('source', 'N/A')}")
    
# 更新项目配置 - 禁用 Git 构建
# 注意：Cloudflare Pages 项目一旦创建，无法完全禁用 Git 集成
# 但可以设置 build_config 为空，让它只使用 Direct Upload

print("\n项目配置说明:")
print("1. Cloudflare Pages 项目已绑定 GitHub 仓库")
print("2. 每次 push 到 main 分支会自动触发构建")
print("3. API 上传的文件会被 Git 构建覆盖")
print("\n推荐做法:")
print("  - 保持 Git 集成（自动 CI/CD）")
print("  - 本地开发后先 push 到 GitHub")
print("  - 让 Cloudflare 自动构建部署")
print("  - 不要用 API 直接上传")