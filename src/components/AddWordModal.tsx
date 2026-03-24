import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Word } from '../types';
import { getInitialWordState } from '../lib/algorithm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0">
        <DialogHeader className="p-4 border-b bg-muted/30">
          <DialogTitle>添加新单词</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <Label>单词 / 词组</Label>
            <Input 
              type="text" 
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="例如: Serendipity"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>音标</Label>
                <Input 
                    type="text" 
                    value={phonetic}
                    onChange={(e) => setPhonetic(e.target.value)}
                />
            </div>
             <div className="space-y-2">
                <Label>标签</Label>
                <Input 
                    type="text" 
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="逗号分隔"
                />
            </div>
          </div>

          <div className="space-y-2">
            <Label>释义</Label>
            <Input 
                type="text" 
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder="中文含义"
            />
          </div>

          <div className="space-y-2">
            <Label>例句</Label>
            <Textarea 
                rows={2}
                value={example}
                onChange={(e) => setExample(e.target.value)}
                className="resize-none"
                placeholder="英文例句"
            />
          </div>

          <div className="space-y-2">
            <Label>例句翻译</Label>
            <Input 
                type="text" 
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="中文翻译"
            />
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-muted/30">
            <Button onClick={handleSave} className="flex items-center gap-2">
                <Save size={18} />
                保存到词库
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddWordModal;
