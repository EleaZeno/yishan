import React, { useState } from 'react';
import { Share2, Copy, Download, Heart, MessageCircle } from 'lucide-react';

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
    alert('已复制到剪贴板');
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

  return React.createElement('div', { className: 'space-y-6 pb-20' }, [
    // Header
    React.createElement('div', { key: 'header' }, [
      React.createElement('h1', { key: 'h1', className: 'text-3xl font-black tracking-tight' }, '🎉 分享成就'),
      React.createElement('p', { key: 'p', className: 'text-sm text-muted-foreground mt-1' }, '分享你的学习成就'),
    ]),

    // Share Cards
    React.createElement('div', { key: 'cards', className: 'space-y-3' },
      shareCards.map((card, i) =>
        React.createElement('div', { key: i, className: 'bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white' }, [
          React.createElement('div', { key: 'header', className: 'mb-4' }, [
            React.createElement('p', { key: 't', className: 'text-3xl font-black' }, card.title),
            React.createElement('p', { key: 'd', className: 'text-sm opacity-90 mt-1' }, card.description),
          ]),
          React.createElement('div', { key: 'stats', className: 'grid grid-cols-2 gap-2 mb-4' },
            Object.entries(card.stats).map(([k, v], j) =>
              React.createElement('div', { key: j, className: 'bg-white/20 rounded-lg p-2' }, [
                React.createElement('p', { key: 'v', className: 'font-black text-lg' }, v),
                React.createElement('p', { key: 'l', className: 'text-xs opacity-75' }, k),
              ])
            )
          ),
          React.createElement('div', { key: 'actions', className: 'flex gap-2' }, [
            React.createElement('button', {
              key: 'copy',
              onClick: () => copyToClipboard(generateShareText(card)),
              className: 'flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 font-bold transition-colors flex items-center justify-center gap-1'
            }, [React.createElement(Copy, { key: 'i', size: 16 }), '复制']),
            React.createElement('button', {
              key: 'download',
              onClick: () => downloadShareImage(card),
              className: 'flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 font-bold transition-colors flex items-center justify-center gap-1'
            }, [React.createElement(Download, { key: 'i', size: 16 }), '下载']),
            React.createElement('button', {
              key: 'share',
              onClick: () => setSelectedCard(card),
              className: 'flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 font-bold transition-colors flex items-center justify-center gap-1'
            }, [React.createElement(Share2, { key: 'i', size: 16 }), '分享']),
          ]),
        ])
      )
    ),

    // Share Modal
    selectedCard && React.createElement('div', { key: 'modal', className: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50' }, [
      React.createElement('div', { key: 'content', className: 'bg-white rounded-2xl p-6 max-w-md w-full mx-4' }, [
        React.createElement('p', { key: 't', className: 'text-lg font-black mb-4' }, '分享到'),
        React.createElement('div', { key: 'buttons', className: 'space-y-2 mb-4' }, [
          React.createElement('button', { key: 'wechat', className: 'w-full bg-emerald-500 text-white rounded-lg py-2 font-bold hover:bg-emerald-600' }, '微信'),
          React.createElement('button', { key: 'qq', className: 'w-full bg-blue-500 text-white rounded-lg py-2 font-bold hover:bg-blue-600' }, 'QQ'),
          React.createElement('button', { key: 'weibo', className: 'w-full bg-red-500 text-white rounded-lg py-2 font-bold hover:bg-red-600' }, '微博'),
          React.createElement('button', { key: 'twitter', className: 'w-full bg-sky-500 text-white rounded-lg py-2 font-bold hover:bg-sky-600' }, 'Twitter'),
        ]),
        React.createElement('button', {
          key: 'close',
          onClick: () => setSelectedCard(null),
          className: 'w-full bg-slate-200 text-slate-700 rounded-lg py-2 font-bold hover:bg-slate-300'
        }, '关闭'),
      ]),
    ]),

    // Leaderboard Preview
    React.createElement('div', { key: 'leaderboard', className: 'bg-white rounded-2xl p-4 border border-slate-200' }, [
      React.createElement('p', { key: 't', className: 'font-bold text-lg mb-3' }, '🏅 排行榜预览'),
      React.createElement('div', { key: 'list', className: 'space-y-2' }, [
        React.createElement('div', { key: '1', className: 'flex items-center justify-between p-2 bg-yellow-50 rounded-lg' }, [
          React.createElement('span', { key: 'rank', className: 'font-black text-yellow-600' }, '🥇 1'),
          React.createElement('span', { key: 'name', className: 'font-bold' }, '学习大师'),
          React.createElement('span', { key: 'score', className: 'font-black text-yellow-600' }, '9500'),
        ]),
        React.createElement('div', { key: '2', className: 'flex items-center justify-between p-2 bg-slate-50 rounded-lg' }, [
          React.createElement('span', { key: 'rank', className: 'font-black text-slate-600' }, '🥈 2'),
          React.createElement('span', { key: 'name', className: 'font-bold' }, '你'),
          React.createElement('span', { key: 'score', className: 'font-black text-slate-600' }, '8200'),
        ]),
        React.createElement('div', { key: '3', className: 'flex items-center justify-between p-2 bg-orange-50 rounded-lg' }, [
          React.createElement('span', { key: 'rank', className: 'font-black text-orange-600' }, '🥉 3'),
          React.createElement('span', { key: 'name', className: 'font-bold' }, '学习者'),
          React.createElement('span', { key: 'score', className: 'font-black text-orange-600' }, '7800'),
        ]),
      ]),
    ]),
  ]);
}
