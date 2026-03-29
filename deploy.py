#!/usr/bin/env python3
"""
忆闪项目 - 正确的部署脚本

这个脚本确保使用正确的部署流程：
1. 构建项目
2. 提交到 Git
3. 推送到 GitHub
4. Cloudflare 自动部署

⚠️ 警告：不要直接用 Cloudflare API 上传文件！
项目已绑定 GitHub，直接上传会被 Git 构建覆盖。
"""

import subprocess
import sys
import os
from datetime import datetime

def run_cmd(cmd, check=True):
    """运行命令"""
    print(f"\n$ {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout.strip())
    if result.returncode != 0:
        if result.stderr:
            print(f"❌ Error: {result.stderr.strip()}")
        if check:
            return False
    return True

def main():
    print("=" * 60)
    print("🚀 忆闪项目部署脚本")
    print("=" * 60)
    print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 检查是否在正确的目录
    if not os.path.exists("package.json"):
        print("\n❌ 错误：请在项目根目录运行此脚本")
        return 1
    
    # 1. 安装依赖（如果需要）
    if not os.path.exists("node_modules"):
        print("\n[0/4] 安装依赖...")
        if not run_cmd("npm install"):
            return 1
    
    # 2. 构建
    print("\n[1/4] 构建项目...")
    if not run_cmd("npm run build"):
        print("\n❌ 构建失败！请检查错误信息。")
        return 1
    
    # 3. 检查是否有更改
    print("\n[2/4] 检查 Git 状态...")
    result = subprocess.run("git status --porcelain", shell=True, capture_output=True, text=True)
    changes = result.stdout.strip()
    
    if not changes:
        print("✅ 没有更改需要提交。")
    else:
        print(f"发现更改:\n{changes}")
        
        # 提交
        print("\n[3/4] 提交更改...")
        commit_msg = f"chore: deploy at {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        if not run_cmd(f'git add -A && git commit -m "{commit_msg}"'):
            print("\n❌ 提交失败！")
            return 1
        
        # 推送
        print("\n[4/4] 推送到 GitHub...")
        print("⏳ 正在推送... (可能需要几秒钟)")
        
        # 重试推送
        for i in range(3):
            result = subprocess.run("git push origin main", shell=True, capture_output=True, text=True)
            if result.returncode == 0:
                print("✅ 推送成功！")
                break
            else:
                if i < 2:
                    print(f"⚠️ 推送失败，重试 ({i+1}/3)...")
                    import time
                    time.sleep(5)
                else:
                    print(f"\n❌ 推送失败！网络问题？")
                    print(f"错误: {result.stderr.strip()}")
                    print("\n请手动运行: git push origin main")
                    return 1
    
    # 完成
    print("\n" + "=" * 60)
    print("✅ 部署成功！")
    print("=" * 60)
    print("\n📍 Cloudflare 将在 1-2 分钟内自动完成部署")
    print("🌐 访问地址: https://yishan-96f.pages.dev")
    print("\n💡 提示: 用户刷新页面即可看到新版本")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())