import React, { useState } from 'react';
import { X, Save, BookOpen, Calculator, Lightbulb, AlertTriangle, FileText } from 'lucide-react';
import { Word, ContentType } from '../types';
import { getInitialWordState } from '../lib/algorithm';
import { CONTENT_TYPE_LABELS } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (word: Word) => void;
}

// Content type icons and colors
const CONTENT_TYPE_CONFIG: Record<ContentType, { icon: React.ReactNode; color: string; bgClass: string }> = {
  word: { 
    icon: <BookOpen size={18} />, 
    color: 'text-blue-500',
    bgClass: 'bg-blue-500/10 border-blue-500/30 text-blue-400'
  },
  formula: { 
    icon: <Calculator size={18} />, 
    color: 'text-purple-500',
    bgClass: 'bg-purple-500/10 border-purple-500/30 text-purple-400'
  },
  knowledge: { 
    icon: <Lightbulb size={18} />, 
    color: 'text-green-500',
    bgClass: 'bg-green-500/10 border-green-500/30 text-green-400'
  },
  mistake: { 
    icon: <AlertTriangle size={18} />, 
    color: 'text-red-500',
    bgClass: 'bg-red-500/10 border-red-500/30 text-red-400'
  },
  definition: { 
    icon: <FileText size={18} />, 
    color: 'text-amber-500',
    bgClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400'
  },
};

const AddWordModal: React.FC<AddWordModalProps> = ({ isOpen, onClose, onSave }) => {
  const [contentType, setContentType] = useState<ContentType>('word');
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [translation, setTranslation] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [tags, setTags] = useState('');
  
  // Mistake-specific fields
  const [errorReason, setErrorReason] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  
  // Formula-specific fields
  const [formulaLatex, setFormulaLatex] = useState('');
  const [formulaContext, setFormulaContext] = useState('');

  const handleSave = () => {
    if (!term || !definition) return;

    const newWord: Word = {
      id: crypto.randomUUID(),
      term,
      definition,
      phonetic: contentType === 'word' ? phonetic : undefined,
      exampleSentence: example,
      exampleTranslation: translation,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      contentType,
      // Mistake-specific
      errorReason: contentType === 'mistake' ? errorReason : undefined,
      correctAnswer: contentType === 'mistake' ? correctAnswer : undefined,
      // Formula-specific
      formulaLatex: contentType === 'formula' ? formulaLatex : undefined,
      formulaContext: contentType === 'formula' ? formulaContext : undefined,
      ...getInitialWordState(contentType),
      createdAt: Date.now(),
    };

    onSave(newWord);
    resetForm();
    onClose();
  };
  
  const resetForm = () => {
    setContentType('word');
    setTerm('');
    setDefinition('');
    setExample('');
    setTranslation('');
    setPhonetic('');
    setTags('');
    setErrorReason('');
    setCorrectAnswer('');
    setFormulaLatex('');
    setFormulaContext('');
  };

  const contentTypes: ContentType[] = ['word', 'formula', 'knowledge', 'mistake', 'definition'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="bg-card text-card-foreground rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 border-b border-border bg-muted/50">
              <h2 className="text-lg font-bold text-foreground">添加记忆卡片</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Content Type Selector */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">内容类型</label>
                <div className="flex flex-wrap gap-2">
                  {contentTypes.map((type) => {
                    const config = CONTENT_TYPE_CONFIG[type];
                    const labels = CONTENT_TYPE_LABELS[type];
                    const isSelected = contentType === type;
                    
                    return (
                      <button
                        key={type}
                        onClick={() => setContentType(type)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                          isSelected 
                            ? config.bgClass 
                            : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        {config.icon}
                        <span>{labels.zh}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Term / Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {contentType === 'formula' ? '公式名称' : 
                   contentType === 'knowledge' ? '知识点' :
                   contentType === 'mistake' ? '错误项' :
                   contentType === 'definition' ? '术语' : '单词 / 词组'}
                </label>
                <input 
                  type="text" 
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder={
                    contentType === 'formula' ? '例如: 二次方程求根公式' :
                    contentType === 'knowledge' ? '例如: 光合作用' :
                    contentType === 'mistake' ? '你写错的答案' :
                    contentType === 'definition' ? '例如: 原子' : '例如: Serendipity'
                  }
                  autoFocus
                />
              </div>

              {/* Word-specific: Phonetic */}
              {contentType === 'word' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">音标</label>
                    <input 
                      type="text" 
                      value={phonetic}
                      onChange={(e) => setPhonetic(e.target.value)}
                      className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      placeholder="/ˈsɛrənˌdɪpɪti/"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">标签</label>
                    <input 
                      type="text" 
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      placeholder="逗号分隔"
                    />
                  </div>
                </div>
              )}

              {/* Formula-specific: LaTeX */}
              {contentType === 'formula' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">公式 (LaTeX)</label>
                  <input 
                    type="text" 
                    value={formulaLatex}
                    onChange={(e) => setFormulaLatex(e.target.value)}
                    className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary outline-none font-mono"
                    placeholder="x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}"
                  />
                </div>
              )}

              {/* Formula-specific: Context */}
              {contentType === 'formula' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">应用场景</label>
                  <input 
                    type="text" 
                    value={formulaContext}
                    onChange={(e) => setFormulaContext(e.target.value)}
                    className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="这个公式在什么情况下使用？"
                  />
                </div>
              )}

              {/* Mistake-specific: Error reason */}
              {contentType === 'mistake' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">错误原因</label>
                  <select
                    value={errorReason}
                    onChange={(e) => setErrorReason(e.target.value)}
                    className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="">选择错误类型...</option>
                    <option value="concept">概念混淆</option>
                    <option value="calculation">计算失误</option>
                    <option value="memory">记忆偏差</option>
                    <option value="careless">粗心大意</option>
                    <option value="incomplete">答题不完整</option>
                    <option value="other">其他</option>
                  </select>
                </div>
              )}

              {/* Mistake-specific: Correct answer */}
              {contentType === 'mistake' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">正确答案</label>
                  <input 
                    type="text" 
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="正确答案是什么？"
                  />
                </div>
              )}

              {/* Definition / Meaning */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {contentType === 'formula' ? '公式说明' :
                   contentType === 'mistake' ? '为什么错？' :
                   contentType === 'definition' ? '定义' : '释义'}
                </label>
                <input 
                  type="text" 
                  value={definition}
                  onChange={(e) => setDefinition(e.target.value)}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder={
                    contentType === 'formula' ? '公式的含义和用途' :
                    contentType === 'mistake' ? '解释为什么这个答案是错的' :
                    contentType === 'definition' ? '术语的准确定义' : '中文含义'
                  }
                />
              </div>

              {/* Example */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {contentType === 'formula' ? '典型例题' :
                   contentType === 'mistake' ? '原题' : '例句'}
                </label>
                <textarea 
                  rows={2}
                  value={example}
                  onChange={(e) => setExample(e.target.value)}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                  placeholder={
                    contentType === 'formula' ? '一道使用该公式的典型题目' :
                    contentType === 'mistake' ? '把题目抄下来' : '英文例句'
                  }
                />
              </div>

              {/* Translation / Explanation */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {contentType === 'formula' ? '解题步骤' :
                   contentType === 'mistake' ? '解题思路' : '翻译 / 解析'}
                </label>
                <input 
                  type="text" 
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder={
                    contentType === 'formula' ? '详细的解题步骤' :
                    contentType === 'mistake' ? '正确的解题思路' : '中文翻译或解析'
                  }
                />
              </div>

              {/* Tags (non-word types) */}
              {contentType !== 'word' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">标签</label>
                  <input 
                    type="text" 
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="逗号分隔，如：数学,代数,必考"
                  />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-muted/50 flex justify-end">
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold shadow-md hover:bg-primary/90 flex items-center gap-2"
              >
                <Save size={18} />
                保存到词库
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddWordModal;
