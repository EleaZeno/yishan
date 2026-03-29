import React from 'react';
import { Shield, Lock, Eye, Trash2, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-black">隐私政策</h1>
        </div>
        <p className="text-muted-foreground">最后更新：2026年3月29日</p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* 1. 数据收集 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold">1. 我们收集什么数据</h2>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border space-y-3">
            <p className="text-foreground">忆闪主要在本地浏览器中存储数据：</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• <strong>学习数据</strong>：你添加的单词、学习进度、复习记录</li>
              <li>• <strong>用户偏好</strong>：主题设置、语言选择、学习计划</li>
              <li>• <strong>设备信息</strong>：浏览器类型、操作系统（仅用于兼容性）</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              ⚠️ 注意：所有数据默认存储在你的浏览器本地，不会上传到服务器。
            </p>
          </div>
        </section>

        {/* 2. 数据存储 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-green-500" />
            <h2 className="text-2xl font-bold">2. 数据如何存储</h2>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border space-y-3">
            <p className="text-foreground">我们使用以下技术存储你的数据：</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• <strong>IndexedDB</strong>：浏览器本地数据库，容量大（通常 50MB+）</li>
              <li>• <strong>localStorage</strong>：用户偏好设置（容量 5-10MB）</li>
              <li>• <strong>Service Worker</strong>：离线缓存，支持无网络使用</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              所有数据完全由你控制，我们无法访问。
            </p>
          </div>
        </section>

        {/* 3. 数据安全 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold">3. 数据安全</h2>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border space-y-3">
            <ul className="space-y-2 text-muted-foreground">
              <li>✓ 所有数据存储在你的设备上</li>
              <li>✓ 使用 HTTPS 加密传输（如有云同步）</li>
              <li>✓ 无第三方追踪或广告</li>
              <li>✓ 开源代码，接受社区审计</li>
            </ul>
          </div>
        </section>

        {/* 4. 数据删除 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Trash2 className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold">4. 删除你的数据</h2>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border space-y-3">
            <p className="text-foreground">你可以随时删除数据：</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• 在应用内：使用"清除缓存"功能</li>
              <li>• 浏览器设置：清除网站数据 / Cookie</li>
              <li>• 完全删除：卸载应用或清空浏览器存储</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              删除后无法恢复，请提前备份重要数据。
            </p>
          </div>
        </section>

        {/* 5. Cookie 和追踪 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">5. Cookie 和追踪</h2>
          <div className="bg-card rounded-2xl p-6 border border-border space-y-3">
            <p className="text-foreground">
              忆闪不使用 Cookie 进行追踪或广告投放。我们仅使用必要的本地存储来保存你的学习数据。
            </p>
          </div>
        </section>

        {/* 6. 第三方服务 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">6. 第三方服务</h2>
          <div className="bg-card rounded-2xl p-6 border border-border space-y-3">
            <p className="text-foreground">忆闪使用以下第三方服务：</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• <strong>Cloudflare Pages</strong>：应用托管（隐私政策：cloudflare.com/privacy）</li>
              <li>• <strong>GitHub</strong>：代码托管（隐私政策：github.com/privacy）</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              这些服务可能收集基本的访问日志，但不会用于个人追踪。
            </p>
          </div>
        </section>

        {/* 7. 政策变更 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">7. 政策变更</h2>
          <div className="bg-card rounded-2xl p-6 border border-border space-y-3">
            <p className="text-foreground">
              我们可能更新此隐私政策。重大变更时会在应用内通知你。
            </p>
          </div>
        </section>

        {/* 8. 联系我们 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">8. 联系我们</h2>
          <div className="bg-card rounded-2xl p-6 border border-border space-y-3">
            <p className="text-foreground">
              如有隐私相关问题，请在 GitHub Issues 中提出或发送邮件。
            </p>
            <p className="text-muted-foreground">
              GitHub: <a href="https://github.com/EleaZeno/yishan" className="text-primary hover:underline">github.com/EleaZeno/yishan</a>
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="bg-muted/30 rounded-2xl p-6 border border-border">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <FileText size={16} />
          本隐私政策适用于忆闪应用的所有版本。
        </p>
      </div>
    </div>
  );
}
