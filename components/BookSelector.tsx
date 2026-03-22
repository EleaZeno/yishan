import React, { useState } from 'react';
import { Book, BookOpen, Check, ChevronRight, Star } from 'lucide-react';
import { getVocabularyBooks, getBookStats } from '../data/vocabulary';
import { clsx } from 'clsx';

interface BookSelectorProps {
  learnedWords: Set<string>;
  selectedBookId?: string;
  onSelectBook: (bookId: string) => void;
  onClose: () => void;
}

const BookSelector: React.FC<BookSelectorProps> = ({
  learnedWords,
  selectedBookId,
  onSelectBook,
  onClose,
}) => {
  const books = getVocabularyBooks();
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  // 按年级分组
  const grades = ['all', ...new Set(books.map(b => b.grade))];
  const filteredBooks = selectedGrade === 'all' 
    ? books 
    : books.filter(b => b.grade === selectedGrade);

  // 获取难度颜色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // 获取难度中文
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      default: return difficulty;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Book className="w-6 h-6" />
              <h2 className="text-xl font-bold">选择单词书</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-indigo-100 mt-1 text-sm">
            选择你要学习的词汇库，开始你的记忆之旅
          </p>
        </div>

        {/* 年级筛选 */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {grades.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={clsx(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                  selectedGrade === grade
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {grade === 'all' ? '全部' : grade}
              </button>
            ))}
          </div>
        </div>

        {/* 单词书列表 */}
        <div className="px-6 py-4 overflow-y-auto max-h-[50vh]">
          <div className="space-y-3">
            {filteredBooks.map((book) => {
              const stats = getBookStats(book.id, learnedWords);
              const isSelected = selectedBookId === book.id;
              const progress = stats.total > 0 ? (stats.learned / stats.total) * 100 : 0;

              return (
                <button
                  key={book.id}
                  onClick={() => {
                    onSelectBook(book.id);
                    onClose();
                  }}
                  className={clsx(
                    'w-full p-4 rounded-2xl border-2 transition-all text-left',
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100'
                      : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* 书名 */}
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-gray-900">{book.name}</h3>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" />
                            已选择
                          </span>
                        )}
                      </div>
                      
                      {/* 英文名 */}
                      <p className="text-sm text-gray-500 mb-2">{book.nameEn}</p>
                      
                      {/* 描述 */}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {book.description}
                      </p>
                      
                      {/* 标签 */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {book.wordCount} 词汇
                        </span>
                        <span className={clsx('text-xs px-2 py-1 rounded-full', getDifficultyColor(book.difficulty))}>
                          {getDifficultyText(book.difficulty)}
                        </span>
                        {book.semester && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {book.semester}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className={clsx(
                      'w-5 h-5 transition-transform',
                      isSelected ? 'text-indigo-600 rotate-90' : 'text-gray-400'
                    )} />
                  </div>

                  {/* 学习进度条 */}
                  {progress > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>学习进度</span>
                        <span>{stats.learned}/{stats.total}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 底部说明 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>选择不同的单词书可以系统学习对应年级的词汇</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookSelector;
