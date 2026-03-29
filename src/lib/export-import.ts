import { Word } from '../types';

export interface ExportOptions {
  format: 'json' | 'csv' | 'anki' | 'txt';
  includeStats?: boolean;
}

/**
 * 导出单词为 JSON 格式
 */
export function exportAsJSON(words: Word[]): string {
  return JSON.stringify(words, null, 2);
}

/**
 * 导出单词为 CSV 格式
 */
export function exportAsCSV(words: Word[]): string {
  const headers = ['Term', 'Definition', 'Phonetic', 'Tags', 'Proficiency', 'Last Seen'];
  const rows = words.map(w => [
    `"${w.term}"`,
    `"${w.definition}"`,
    `"${w.phonetic || ''}"`,
    `"${(w.tags || []).join(';')}"`,
    `${Math.round((w.alpha / (w.alpha + w.beta)) * 100)}%`,
    new Date(w.lastSeen || 0).toISOString(),
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * 导出单词为 Anki 格式（制表符分隔）
 */
export function exportAsAnki(words: Word[]): string {
  return words
    .map(w => `${w.term}\t${w.definition}`)
    .join('\n');
}

/**
 * 导出单词为纯文本格式
 */
export function exportAsText(words: Word[]): string {
  return words
    .map((w, i) => `${i + 1}. ${w.term} - ${w.definition}`)
    .join('\n');
}

/**
 * 通用导出函数
 */
export function exportWords(words: Word[], options: ExportOptions): string {
  switch (options.format) {
    case 'json':
      return exportAsJSON(words);
    case 'csv':
      return exportAsCSV(words);
    case 'anki':
      return exportAsAnki(words);
    case 'txt':
      return exportAsText(words);
    default:
      return exportAsJSON(words);
  }
}

/**
 * 下载文件
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 导入单词（JSON 格式）
 */
export function importFromJSON(jsonString: string): Word[] {
  try {
    const data = JSON.parse(jsonString);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Invalid JSON format:', e);
    return [];
  }
}

/**
 * 导入单词（CSV 格式）
 */
export function importFromCSV(csvString: string): Partial<Word>[] {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const termIndex = headers.indexOf('term');
  const defIndex = headers.indexOf('definition');

  if (termIndex === -1 || defIndex === -1) return [];

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    return {
      term: values[termIndex],
      definition: values[defIndex],
      tags: values[4]?.split(';').filter(Boolean) || [],
    };
  });
}

/**
 * 导入单词（Anki 格式）
 */
export function importFromAnki(ankiString: string): Partial<Word>[] {
  return ankiString
    .trim()
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const [term, definition] = line.split('\t');
      return { term: term?.trim(), definition: definition?.trim() };
    });
}
