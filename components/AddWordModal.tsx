import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Word } from '../types';
import { getInitialWordState } from '../lib/sm2';

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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">添加新单词</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">单词 / 词组</label>
            <input 
              type="text" 
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="例如: Serendipity"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">音标</label>
                <input 
                    type="text" 
                    value={phonetic}
                    onChange={(e) => setPhonetic(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                <input 
                    type="text" 
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="逗号分隔"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">释义</label>
            <input 
                type="text" 
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="中文含义"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">例句</label>
            <textarea 
                rows={2}
                value={example}
                onChange={(e) => setExample(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                placeholder="英文例句"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">例句翻译</label>
            <input 
                type="text" 
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="中文翻译"
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button 
                onClick={handleSave}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-md hover:bg-indigo-700 flex items-center gap-2"
            >
                <Save size={18} />
                保存到词库
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddWordModal;