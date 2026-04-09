import { useEffect, useCallback, useState } from 'react';

export interface Shortcut {
  key: string;
  modifiers?: ('ctrl' | 'shift' | 'alt' | 'meta')[];
  description: string;
  descriptionZh: string;
  action: () => void;
  /** Only active when no input/textarea is focused */
  requireNoInput?: boolean;
  /** Only active on specific pages */
  scope?: string[];
}

interface UseKeyboardShortcutsOptions {
  shortcuts: Shortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if typing in input/textarea (unless shortcut explicitly allows it)
      const target = event.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      for (const shortcut of shortcuts) {
        if (shortcut.requireNoInput !== false && isInput) continue;

        // Check modifiers
        const modifiers = shortcut.modifiers || [];
        const hasCtrl = modifiers.includes('ctrl') === (event.ctrlKey || event.metaKey);
        const hasShift = modifiers.includes('shift') === event.shiftKey;
        const hasAlt = modifiers.includes('alt') === event.altKey;
        const hasMeta = modifiers.includes('meta') === event.metaKey;

        const modifierMatch = modifiers.length === 0
          ? (!event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey)
          : (hasCtrl && hasShift && hasAlt && hasMeta);

        if (event.key.toLowerCase() === shortcut.key.toLowerCase() && modifierMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// ============================================================
// Default app shortcuts
// ============================================================
export const DEFAULT_SHORTCUTS = {
  // Global
  ESCAPE: { key: 'Escape', modifiers: [], description: 'Close modal/dialog', descriptionZh: '关闭弹窗' },
  
  // Navigation
  GO_DASHBOARD: { key: '1', modifiers: ['ctrl'], description: 'Go to Dashboard', descriptionZh: '前往主页' },
  GO_STUDY: { key: '2', modifiers: ['ctrl'], description: 'Go to Study', descriptionZh: '前往学习' },
  GO_LIBRARY: { key: '3', modifiers: ['ctrl'], description: 'Go to Library', descriptionZh: '前往词库' },
  GO_ANALYTICS: { key: '4', modifiers: ['ctrl'], description: 'Go to Analytics', descriptionZh: '前往统计' },
  GO_SETTINGS: { key: ',', modifiers: ['ctrl'], description: 'Go to Settings', descriptionZh: '前往设置' },
  
  // Actions
  ADD_WORD: { key: 'n', modifiers: ['ctrl'], description: 'Add new word', descriptionZh: '添加单词' },
  START_STUDY: { key: 's', modifiers: ['ctrl'], description: 'Start study session', descriptionZh: '开始学习' },
  QUICK_REVIEW: { key: 'r', modifiers: ['ctrl', 'shift'], description: 'Quick review', descriptionZh: '快速复习' },
  SYNC: { key: 'y', modifiers: ['ctrl', 'shift'], description: 'Sync data', descriptionZh: '同步数据' },
  SEARCH: { key: 'k', modifiers: ['ctrl'], description: 'Search', descriptionZh: '搜索' },
  HELP: { key: '/', modifiers: ['ctrl'], description: 'Show shortcuts help', descriptionZh: '显示快捷键' },
  TOGGLE_THEME: { key: 'd', modifiers: ['ctrl', 'shift'], description: 'Toggle dark/light theme', descriptionZh: '切换主题' },
};

// ============================================================
// Shortcuts Help Modal
// ============================================================
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Command } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: { key: string; descriptionZh: string }[];
}

const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({ isOpen, onClose, shortcuts }) => {
  const categories = [
    { name: '全局', keys: shortcuts.filter(s => s.key === 'Escape') },
    { name: '导航', keys: shortcuts.filter(s => ['1', '2', '3', '4', ','].includes(s.key)) },
    { name: '操作', keys: shortcuts.filter(s => ['n', 's', 'k'].includes(s.key)) },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg"
          >
            <Card className="shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Keyboard size={20} className="text-primary" />
                    <CardTitle>键盘快捷键</CardTitle>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {categories.map((cat) => (
                  <div key={cat.name}>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                      {cat.name}
                    </h4>
                    <div className="space-y-2">
                      {cat.keys.map((shortcut) => (
                        <div
                          key={shortcut.key}
                          className="flex items-center justify-between py-1.5"
                        >
                          <span className="text-sm text-foreground">
                            {shortcut.descriptionZh}
                          </span>
                          <div className="flex items-center gap-1">
                            {(shortcut as any).modifiers?.includes('ctrl') && (
                              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                                <Command size={10} className="inline" />
                              </kbd>
                            )}
                            {(shortcut as any).modifiers?.includes('shift') && (
                              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">⇧</kbd>
                            )}
                            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                              {shortcut.key.toUpperCase()}
                            </kbd>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShortcutsHelp;
