import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Word } from '../types';
import { getInitialWordState } from '../lib/algorithm';
import { motion, AnimatePresence } from 'framer-motion';

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (word: Word) => void;
}

const AddWordModal: React.FC<AddWordModalProps> = ({ isOpen, onClose, onSave }) => {
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [translation, setTranslation] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [tags, setTags] = useState('');

  const handleSave = () => {
    if (!term || !definition) return;

    const newWord: Word = {
      id: crypto.randomUUID(),
      term,
      definition,
      phonetic,
      exampleSentence: example,
      exampleTranslation: translation,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      ...getInitialWordState(),
      createdAt: Date.now(),
    };

    onSave(newWord);
    resetForm();
    onClose();
  };
  
  const resetForm = () => {
      setTerm('');
      setDefinition('');
      setExample('');
      setTranslation('');
      setPhonetic('');
      setTags('');
  };

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
                <h2 className="text-lg font-bold text-foreground">添加新单词</h2>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">单词 / 词组</label>
                  <input 
                    type="text" 
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="例如: Serendipity"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-foreground mb-1">音标</label>
                      <input 
                          type="text" 
                          value={phonetic}
                          onChange={(e) => setPhonetic(e.target.value)}
                          className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary outline-none"
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

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">释义</label>
                  <input 
                      type="text" 
                      value={definition}
                      onChange={(e) => setDefinition(e.target.value)}
                      className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      placeholder="中文含义"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">例句</label>
                  <textarea 
                      rows={2}
                      value={example}
                      onChange={(e) => setExample(e.target.value)}
                      className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                      placeholder="英文例句"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">例句翻译</label>
                  <input 
                      type="text" 
                      value={translation}
                      onChange={(e) => setTranslation(e.target.value)}
                      className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      placeholder="中文翻译"
                  />
                </div>
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