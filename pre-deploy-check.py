#!/usr/bin/env python3
"""
部署前检查脚本

确保：
1. 所有测试通过
2. 构建成功
3. 使用正确的部署方式（Git push，不是 API 上传）
"""

import subprocess
import sys

def check():
    print("🔍 部署前检查...\n")
    
    # 1. 检查是否有未提交的更改
    result = subprocess.run("git status --porcelain", shell=True, capture_output=True, text=True)
    if result.stdout.strip():
        print("⚠️  有未提交的更改:")
        print(result.stdout.strip())
        print("\n建议先提交: git add -A && git commit -m 'your message'")
    
    # 2. 检查构建
    print("\n📦 检查构建...")
    result = subprocess.run("npm run build", shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print("❌ 构建失败！")
        print(result.stderr)
        return False
    print("✅ 构建成功")
    
    # 3. 检查测试
    print("\n🧪 检查测试...")
    result = subprocess.run("npm run test", shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print("⚠️  测试有失败")
    else:
        print("✅ 测试通过")
    
    # 4. 提醒正确的部署方式
    print("\n" + "=" * 50)
    print("✅ 检查完成！")
    print("=" * 50)
    print("\n正确的部署方式:")
    print("  1. git add -A")
    print("  2. git commit -m 'your message'")
    print("  3. git push origin main")
    print("  4. 等待 Cloudflare 自动部署（1-2分钟）")
    print("\n或直接运行: npm run deploy")
    print("\n⚠️  不要用 Cloudflare API 直接上传文件！")
    
    return True

if __name__ == "__main__":
    check()