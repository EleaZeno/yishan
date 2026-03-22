import { Word } from '../types';
import { STORAGE_KEYS } from './config';

/**
 * 数据导出功能 - 防止数据丢失
 */

// ==================== 导出格式类型 ====================
export type ExportFormat = 'json' | 'csv';

/**
 * 导出数据
 */
export const exportData = async (words: Word[], format: ExportFormat = 'json'): Promise<void> => {
  const data = format === 'json' ? prepareJsonExport(words) : prepareCsvExport(words);
  const filename = `yishan-backup-${format === 'json' ? 'v1' : 'v1'}-${new Date().toISOString().split('T')[0]}.${format}`;
  const mimeType = format === 'json' ? 'application/json' : 'text/csv';

  // 创建 Blob 并下载
  const blob = new Blob([data], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  // 清理
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};

/**
 * 导入数据
 */
export const importData = (file: File): Promise<Word[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const isJson = file.name.endsWith('.json');
        
        if (isJson) {
          const data = JSON.parse(content);
          resolve(Array.isArray(data) ? data : data.words || []);
        } else {
          // CSV 格式
          resolve(parseCsv(content));
        }
      } catch (error) {
        reject(new Error('Invalid file format'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * 准备 JSON 导出数据
 */
const prepareJsonExport = (words: Word[]): string => {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    app: 'YiShan',
    totalWords: words.length,
    words: words.map(word => ({
      term: word.term,
      definition: word.definition,
      phonetic: word.phonetic || '',
      tags: word.tags || [],
      exampleSentence: word.exampleSentence || '',
      exampleTranslation: word.exampleTranslation || '',
      // 学习数据
      halflife: word.halflife,
      alpha: word.alpha,
      beta: word.beta,
      dueDate: word.dueDate,
      lastSeen: word.lastSeen,
      totalExposure: word.totalExposure,
      createdAt: word.createdAt,
    })),
  };
  
  return JSON.stringify(exportData, null, 2);
};

/**
 * 准备 CSV 导出数据
 */
const prepareCsvExport = (words: Word[]): string => {
  const headers = [
    'Term',
    'Definition',
    'Phonetic',
    'Tags',
    'Example Sentence',
    'Example Translation',
    'Halflife (min)',
    'Alpha',
    'Beta',
    'Due Date',
    'Last Seen',
    'Total Exposure',
    'Created At',
  ];
  
  const rows = words.map(word => [
    escapeCsv(word.term),
    escapeCsv(word.definition),
    escapeCsv(word.phonetic || ''),
    escapeCsv((word.tags || []).join('; ')),
    escapeCsv(word.exampleSentence || ''),
    escapeCsv(word.exampleTranslation || ''),
    word.halflife.toString(),
    word.alpha.toString(),
    word.beta.toString(),
    new Date(word.dueDate).toISOString(),
    new Date(word.lastSeen).toISOString(),
    (word.totalExposure || 0).toString(),
    new Date(word.createdAt).toISOString(),
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');
};

/**
 * 解析 CSV
 */
const parseCsv = (content: string): Word[] => {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  return lines.slice(1).map(line => {
    const values = parseCsvLine(line);
    const word: Partial<Word> = {};
    
    headers.forEach((header, index) => {
      const value = values[index];
      switch (header) {
        case 'term': word.term = value; break;
        case 'definition': word.definition = value; break;
        case 'phonetic': word.phonetic = value; break;
        case 'tags': word.tags = value.split('; ').filter(Boolean); break;
        case 'example sentence': word.exampleSentence = value; break;
        case 'example translation': word.exampleTranslation = value; break;
        case 'halflife (min)': word.halflife = parseInt(value) || 1440; break;
        case 'alpha': word.alpha = parseFloat(value) || 3; break;
        case 'beta': word.beta = parseFloat(value) || 1; break;
      }
    });
    
    return {
      ...word,
      id: crypto.randomUUID(),
      lastSeen: word.lastSeen || 0,
      totalExposure: word.totalExposure || 0,
      dueDate: word.dueDate || Date.now(),
      createdAt: word.createdAt || Date.now(),
    } as Word;
  });
};

/**
 * 转义 CSV 值
 */
const escapeCsv = (value: string): string => {
  if (!value) return '';
  // 如果包含逗号、引号或换行，需要用引号包裹
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

/**
 * 解析 CSV 行（处理引号包裹的值）
 */
const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};

/**
 * 从 LocalStorage 导出全部数据
 */
export const exportAllData = (): void => {
  const words = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORDS) || '[]');
  exportData(words, 'json');
};

/**
 * 复制到剪贴板
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
};
