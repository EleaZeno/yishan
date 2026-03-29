#!/usr/bin/env python3
"""
忆闪项目部署脚本

正确的部署流程：
1. 本地构建 (npm run build)
2. 提交到 Git (git add + git commit)
3. 推送到 GitHub (git push)
4. Cloudflare 自动构建部署

注意：不要直接用 API 上传文件！
因为项目已绑定 GitHub，Cloudflare 会从 Git 重新构建覆盖。
"""

import subprocess
import sys

def run_cmd(cmd):
    """运行命令"""
    print(f"\n> {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout)
    if result.returncode != 0 and result.stderr:
        print(f"Error: {result.stderr}")
    return result.returncode == 0

def deploy():
    print("=" * 50)
    print("忆闪项目部署脚本")
    print("=" * 50)
    
    # 1. 构建
    print("\n[1/4] 构建项目...")
    if not run_cmd("npm run build"):
        print("构建失败！")
        return False
    
    # 2. 检查是否有更改
    print("\n[2/4] 检查更改...")
    result = subprocess.run("git status --porcelain", shell=True, capture_output=True, text=True)
    if not result.stdout.strip():
        print("没有更改，跳过提交。")
        return True
    
    # 3. 提交
    print("\n[3/4] 提交更改...")
    if not run_cmd('git add -A && git commit -m "chore: update build"'):
        print("提交失败！")
        return False
    
    # 4. 推送
    print("\n[4/4] 推送到 GitHub...")
    if not run_cmd("git push origin main"):
        print("推送失败！请检查网络连接。")
        return False
    
    print("\n" + "=" * 50)
    print("✅ 部署成功！")
    print("Cloudflare 将自动构建部署。")
    print("访问: https://yishan-96f.pages.dev")
    print("=" * 50)
    return True

if __name__ == "__main__":
    deploy()