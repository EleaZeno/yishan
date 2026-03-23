import React, { useState, useEffect } from 'react';
import { Book, BookOpen, Check, ChevronRight, Star, Loader2, X } from 'lucide-react';
import { getBooksWithFallback, getBookWordsWithFallback } from '../services/vocabulary';
import { VocabularyBook } from '../services/vocabulary';
import { clsx } from 'clsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

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
  const [books, setBooks] = useState<VocabularyBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await getBooksWithFallback();
      setBooks(data);
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setLoading(false);
    }
  };

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
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden gap-0">
        <DialogHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
          <DialogTitle className="flex items-center gap-3 text-xl text-white">
            <Book className="w-6 h-6" />
            选择单词书
          </DialogTitle>
          <DialogDescription className="text-indigo-100 mt-1 text-sm">
            选择你要学习的词汇库，开始你的记忆之旅
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 border-b">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {grades.map((grade) => (
              <Button
                key={grade}
                variant={selectedGrade === grade ? "default" : "secondary"}
                onClick={() => setSelectedGrade(grade)}
                className="rounded-full"
              >
                {grade === 'all' ? '全部' : grade}
              </Button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="px-6 py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">加载词库中...</p>
          </div>
        )}

        {!loading && (
          <ScrollArea className="h-[50vh]">
            <div className="px-6 py-4 space-y-3">
              {filteredBooks.map((book) => {
                const isSelected = selectedBookId === book.id;

                return (
                  <button
                    key={book.id}
                    onClick={() => {
                      onSelectBook(book.id);
                    }}
                    className={clsx(
                      'w-full p-4 rounded-xl border-2 transition-all text-left',
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-primary/30 hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="w-5 h-5 text-primary" />
                          <h3 className="font-bold text-foreground">{book.name}</h3>
                          {isSelected && (
                            <Badge variant="default" className="ml-2 h-5 px-1.5 text-[10px]">
                              <Check className="w-3 h-3 mr-1" />
                              已选择
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">{book.name_en}</p>
                        
                        <p className="text-sm text-foreground/80 mb-3 line-clamp-2">
                          {book.description}
                        </p>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">
                            {book.word_count} 词汇
                          </Badge>
                          <Badge variant="outline" className={getDifficultyColor(book.difficulty)}>
                            {getDifficultyText(book.difficulty)}
                          </Badge>
                          {book.semester && (
                            <Badge variant="secondary">
                              {book.semester}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <ChevronRight className={clsx(
                        'w-5 h-5 transition-transform mt-1',
                        isSelected ? 'text-primary rotate-90' : 'text-muted-foreground'
                      )} />
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        )}

        <div className="px-6 py-4 bg-muted/30 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>选择不同的单词书可以系统学习对应年级的词汇</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookSelector;
