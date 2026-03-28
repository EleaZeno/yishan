import React, { useState } from 'react';
import { Share2, Copy, Download, Heart, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ShareCard {
  id: string;
  type: 'achievement' | 'milestone' | 'streak';
  title: string;
  description: string;
  stats: Record<string, any>;
  timestamp: Date;
}

export default function AchievementSharing() {
  const [shareCards, setShareCards] = useState<ShareCard[]>([
    {
      id: '1',
      type: 'achievement',
      title: '🏆 传奇学者',
      description: '掌握率达到 90%',
      stats: { mastered: 450, total: 500, accuracy: 92 },
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'milestone',
      title: '📚 学者',
      description: '积累 100 个词汇',
      stats: { words: 100, days: 15 },
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [selectedCard, setSelectedCard] = useState<ShareCard | null>(null);

  const generateShareText = (card: ShareCard) => {
    return `我在忆闪上获得了 "${card.title}" 成就！${card.description}\n\n${JSON.stringify(card.stats)}\n\n加入我一起学习吧！https://yishan-96f.pages.dev`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  const downloadShareImage = (card: ShareCard) => {
    // 模拟下载分享图片
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#4f46e5';
      ctx.fillRect(0, 0, 1080, 1080);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(card.title, 540, 300);
      ctx.font = '40px Arial';
      ctx.fillText(card.description, 540, 400);
      
      const link = document.createElement('a');
      link.href = canvas.toDataURL();
      link.download = `yishan-${card.id}.png`;
      link.click();
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight">🎉 分享成就</h1>
        <p className="text-sm text-muted-foreground mt-1">分享你的学习成就</p>
      </div>

      {/* Share Cards */}
      <div className="space-y-3">
        {shareCards.map((card, i) => (
          <div key={i} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="mb-4">
              <p className="text-3xl font-black">{card.title}</p>
              <p className="text-sm opacity-90 mt-1">{card.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {Object.entries(card.stats).map(([k, v], j) => (
                <div key={j} className="bg-white/20 rounded-lg p-2">
                  <p className="font-black text-lg">{v}</p>
                  <p className="text-xs opacity-75">{k}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(generateShareText(card))}
                className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 font-bold transition-colors flex items-center justify-center gap-1"
              >
                <Copy size={16} /> 复制
              </button>
              <button
                onClick={() => downloadShareImage(card)}
                className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 font-bold transition-colors flex items-center justify-center gap-1"
              >
                <Download size={16} /> 下载
              </button>
              <button
                onClick={() => setSelectedCard(card)}
                className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 font-bold transition-colors flex items-center justify-center gap-1"
              >
                <Share2 size={16} /> 分享
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Share Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full mx-4">
            <p className="text-lg font-black text-foreground mb-4">分享到</p>
            <div className="space-y-2 mb-4">
              <button className="w-full bg-emerald-500 text-white rounded-lg py-2 font-bold hover:bg-emerald-600">微信</button>
              <button className="w-full bg-blue-500 text-white rounded-lg py-2 font-bold hover:bg-blue-600">QQ</button>
              <button className="w-full bg-red-500 text-white rounded-lg py-2 font-bold hover:bg-red-600">微博</button>
              <button className="w-full bg-sky-500 text-white rounded-lg py-2 font-bold hover:bg-sky-600">Twitter</button>
            </div>
            <button
              onClick={() => setSelectedCard(null)}
              className="w-full bg-muted text-muted-foreground rounded-lg py-2 font-bold hover:bg-muted/80"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard Preview */}
      <div className="bg-card rounded-2xl p-4 border border-border">
        <p className="font-bold text-foreground text-lg mb-3">🏅 排行榜预览</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-yellow-500/10 rounded-lg">
            <span className="font-black text-yellow-500">🥇 1</span>
            <span className="font-bold text-foreground">学习大师</span>
            <span className="font-black text-yellow-500">9500</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
            <span className="font-black text-muted-foreground">🥈 2</span>
            <span className="font-bold text-foreground">你</span>
            <span className="font-black text-muted-foreground">8200</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-orange-500/10 rounded-lg">
            <span className="font-black text-orange-500">🥉 3</span>
            <span className="font-bold text-foreground">学习者</span>
            <span className="font-black text-orange-500">7800</span>
          </div>
        </div>
      </div>
    </div>
  );
}
