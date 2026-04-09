import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2, Download, FileSpreadsheet } from 'lucide-react';
import { Word, ContentType } from '../types';
import { CONTENT_TYPE_LABELS } from '../types';
import { getInitialWordState } from '../lib/algorithm';

interface BatchImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (words: Word[]) => void;
}

interface PreviewWord {
  term: string;
  definition: string;
  phonetic?: string;
  exampleSentence?: string;
  tags?: string[];
  contentType: ContentType;
  valid: boolean;
  error?: string;
}

const BatchImport: React.FC<BatchImportProps> = ({ isOpen, onClose, onImport }) => {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload');
  const [previewWords, setPreviewWords] = useState<PreviewWord[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importStats, setImportStats] = useState({ total: 0, success: 0, failed: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    // Parse CSV/TSV
    const delimiter = text.includes('\t') ? '\t' : ',';
    const headers = lines[0].toLowerCase().split(delimiter);

    // Find column indices
    const termIdx = headers.findIndex(h => h.includes('term') || h.includes('单词') || h.includes('词'));
    const defIdx = headers.findIndex(h => h.includes('definition') || h.includes('释义') || h.includes('含义'));
    const phoneticIdx = headers.findIndex(h => h.includes('phonetic') || h.includes('音标'));
    const exampleIdx = headers.findIndex(h => h.includes('example') || h.includes('例句'));
    const tagsIdx = headers.findIndex(h => h.includes('tag') || h.includes('标签'));
    const typeIdx = headers.findIndex(h => h.includes('type') || h.includes('类型'));

    const parsed: PreviewWord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(delimiter);
      
      const term = cols[termIdx]?.trim() || '';
      const definition = cols[defIdx]?.trim() || '';
      const phonetic = cols[phoneticIdx]?.trim();
      const example = cols[exampleIdx]?.trim();
      const tagsStr = cols[tagsIdx]?.trim();
      const typeStr = cols[typeIdx]?.trim().toLowerCase();

      // Determine content type
      let contentType: ContentType = 'word';
      if (typeStr) {
        if (typeStr.includes('公式') || typeStr === 'formula') contentType = 'formula';
        else if (typeStr.includes('知识') || typeStr === 'knowledge') contentType = 'knowledge';
        else if (typeStr.includes('错题') || typeStr === 'mistake') contentType = 'mistake';
        else if (typeStr.includes('名词') || typeStr === 'definition') contentType = 'definition';
      }

      const valid = term.length > 0 && definition.length > 0;
      const error = !term ? '缺少单词' : !definition ? '缺少释义' : undefined;

      parsed.push({
        term,
        definition,
        phonetic,
        exampleSentence: example,
        tags: tagsStr ? tagsStr.split(/[,;，；]/).map(t => t.trim()).filter(Boolean) : [],
        contentType,
        valid,
        error
      });
    }

    setPreviewWords(parsed);
    setStep('preview');
  };

  const handleImport = async () => {
    setStep('importing');
    const validWords = previewWords.filter(w => w.valid);
    const total = validWords.length;

    const words: Word[] = [];
    let success = 0;
    let failed = 0;

    for (let i = 0; i < validWords.length; i++) {
      const preview = validWords[i];
      
      try {
        const word: Word = {
          id: crypto.randomUUID(),
          term: preview.term,
          definition: preview.definition,
          phonetic: preview.phonetic,
          exampleSentence: preview.exampleSentence,
          tags: preview.tags,
          contentType: preview.contentType,
          ...getInitialWordState(preview.contentType),
          createdAt: Date.now(),
        };
        
        words.push(word);
        success++;
      } catch (e) {
        failed++;
      }

      setImportProgress(Math.round(((i + 1) / total) * 100));
      
      // Small delay for visual feedback
      if (i % 10 === 0) {
        await new Promise(r => setTimeout(r, 50));
      }
    }

    setImportStats({ total, success, failed });
    
    // Call parent import handler
    onImport(words);
    
    setStep('done');
  };

  const handleClose = () => {
    setStep('upload');
    setPreviewWords([]);
    setImportProgress(0);
    setImportStats({ total: 0, success: 0, failed: 0 });
    onClose();
  };

  const downloadTemplate = () => {
    const template = 'term,definition,phonetic,example,tags,type\n' +
      'serendipity,意外发现,/ˌserənˈdɪpɪti/,I found this book by serendipity.,GRE,word\n' +
      'E=mc²,质能方程,,爱因斯坦的质能转换公式,,formula\n' +
      '光合作用,绿色植物利用光能将CO₂和H₂O合成有机物的过程,,植物的光合作用是地球生态系统的基础,,knowledge';
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yishan_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">批量导入</h2>
            <button onClick={handleClose} className="p-2 text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'upload' && (
              <div className="space-y-4">
                {/* Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium text-foreground mb-2">点击上传或拖拽文件到此处</p>
                  <p className="text-sm text-muted-foreground">支持 CSV、TSV 格式</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.tsv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Template Download */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet size={24} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">下载导入模板</p>
                      <p className="text-xs text-muted-foreground">包含示例数据和格式说明</p>
                    </div>
                  </div>
                  <button
                    onClick={downloadTemplate}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20"
                  >
                    <Download size={16} className="inline mr-1" />
                    下载
                  </button>
                </div>

                {/* Format Help */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>📋 支持的列名：term/单词, definition/释义, phonetic/音标, example/例句, tags/标签, type/类型</p>
                  <p>📝 类型可选值：word(单词), formula(公式), knowledge(知识点), mistake(错题), definition(名词解释)</p>
                </div>
              </div>
            )}

            {step === 'preview' && (
              <div className="space-y-4">
                {/* Stats */}
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span className="text-green-500">{previewWords.filter(w => w.valid).length} 有效</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle size={16} className="text-red-500" />
                    <span className="text-red-500">{previewWords.filter(w => !w.valid).length} 无效</span>
                  </div>
                </div>

                {/* Preview Table */}
                <div className="max-h-80 overflow-y-auto border border-border rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">状态</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">单词</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">释义</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">类型</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewWords.slice(0, 100).map((word, i) => (
                        <tr key={i} className={`border-t border-border ${word.valid ? '' : 'bg-red-500/5'}`}>
                          <td className="px-4 py-2">
                            {word.valid ? (
                              <CheckCircle2 size={14} className="text-green-500" />
                            ) : (
                              <AlertCircle size={14} className="text-red-500" />
                            )}
                          </td>
                          <td className="px-4 py-2 font-medium text-foreground">{word.term || '-'}</td>
                          <td className="px-4 py-2 text-muted-foreground">{word.definition || '-'}</td>
                          <td className="px-4 py-2">
                            <span className="text-xs px-2 py-0.5 bg-muted rounded">
                              {CONTENT_TYPE_LABELS[word.contentType].zh}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewWords.length > 100 && (
                    <p className="text-center text-xs text-muted-foreground py-2">
                      仅显示前 100 条，共 {previewWords.length} 条
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setStep('upload')}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground"
                  >
                    重新选择
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={previewWords.filter(w => w.valid).length === 0}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
                  >
                    导入 {previewWords.filter(w => w.valid).length} 条
                  </button>
                </div>
              </div>
            )}

            {step === 'importing' && (
              <div className="text-center py-12">
                <Loader2 size={48} className="mx-auto text-primary animate-spin mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">正在导入...</p>
                <p className="text-muted-foreground">{importProgress}%</p>
                <div className="w-48 h-2 bg-muted rounded-full mx-auto mt-4 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
              </div>
            )}

            {step === 'done' && (
              <div className="text-center py-12">
                <CheckCircle2 size={64} className="mx-auto text-green-500 mb-4" />
                <p className="text-xl font-bold text-foreground mb-2">导入完成！</p>
                <div className="flex justify-center gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">成功：</span>
                    <span className="text-green-500 font-bold">{importStats.success}</span>
                  </div>
                  {importStats.failed > 0 && (
                    <div>
                      <span className="text-muted-foreground">失败：</span>
                      <span className="text-red-500 font-bold">{importStats.failed}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                >
                  完成
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BatchImport;
