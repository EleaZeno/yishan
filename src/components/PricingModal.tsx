
import React, { useState } from 'react';
import { X, Check, Zap, Crown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    setLoading(true);
    // 模拟支付延迟
    setTimeout(() => {
        setLoading(false);
        onSuccess();
        onClose();
    }, 1500);
  };

  const tiers = [
    {
      name: '基础版',
      price: '0',
      features: ['本地记忆追踪', '1,000 单词上限', '基础贝叶斯算法', '游客模式可用'],
      current: true,
      buttonText: '当前方案'
    },
    {
      name: '忆闪 Pro',
      price: '19.9',
      features: ['全词库无限导入', '多端云同步', 'Flux-v5 高阶算法', '专业级词根词缀包', 'AI 语境生成'],
      current: false,
      buttonText: '立即升级',
      premium: true
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row relative"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 z-10">
              <X size={24} />
            </button>

            {/* Left Side: Benefits */}
            <div className="md:w-1/2 p-10 bg-slate-50 border-r border-slate-100 flex flex-col justify-center">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6">
                    <Crown size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">释放完整认知潜力</h2>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">升级到 Pro 版，即可导入海量专业词库并享受跨设备同步。</p>
                
                <div className="space-y-4">
                    {tiers[1].features.map(f => (
                        <div key={f} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <Check size={12} strokeWidth={4} />
                            </div>
                            <span className="text-sm font-bold text-slate-700">{f}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side: Checkout */}
            <div className="md:w-1/2 p-10 flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                    <span className="text-slate-400 text-xs font-black uppercase tracking-widest">年度订阅优惠</span>
                    <div className="flex items-baseline justify-center gap-1 mt-2">
                        <span className="text-5xl font-black text-slate-900">¥19.9</span>
                        <span className="text-slate-400 font-bold text-sm">/ 终身</span>
                    </div>
                </div>

                <div className="w-full space-y-4">
                    <button 
                        onClick={handlePay}
                        disabled={loading}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-200 flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Zap size={18} fill="currentColor"/> 开启专业版权限</>}
                    </button>
                    <p className="text-[10px] text-center text-slate-300 font-bold uppercase tracking-widest">支持 微信 / 支付宝 模拟支付</p>
                </div>

                <div className="mt-10 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                        <Check size={16} />
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-black text-emerald-700 uppercase">30天无忧退款</p>
                        <p className="text-[10px] text-emerald-600 font-medium">不满意随时退，0 风险体验</p>
                    </div>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PricingModal;
