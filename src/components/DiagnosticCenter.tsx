import React, { useState, useEffect } from 'react';
import { Brain, Target, TrendingUp, Zap, ArrowRight, CheckCircle, XCircle, Clock, ChevronRight, Loader2, Headphones, PenTool, GraduationCap } from 'lucide-react';
import { ABILITY_DIMENSIONS, getProgressColor, getAbilityLevel, getStudentModel, StudentAbility, resetAssessment, EXAM_TYPES, predictExamScore } from '../services/assessment';
import AbilityRadar from './AbilityRadar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface DiagnosticCenterProps {
  userId?: string;
  onStartTest?: (testType: string) => void;
}

const DiagnosticCenter: React.FC<DiagnosticCenterProps> = ({ userId, onStartTest }) => {
  const [abilities, setAbilities] = useState<StudentAbility>({
    vocabulary: 0.5,
    grammar: 0.5,
    reading: 0.5,
    listening: 0.5,
    writing: 0.5,
    overall: 0.5,
    predictedScore: 50
  });
  const [loading, setLoading] = useState(true);
  const [testInProgress, setTestInProgress] = useState(false);
  const [targetExam, setTargetExam] = useState<string>('gaokao');

  useEffect(() => {
    loadAbility();
  }, [userId]);

  const loadAbility = async () => {
    setLoading(true);
    try {
      const data = await getStudentModel(userId);
      if (data) {
        setAbilities({
          vocabulary: data.vocabulary || 0.5,
          grammar: data.grammar || 0.5,
          reading: data.reading || 0.5,
          listening: data.listening || 0.5,
          writing: data.writing || 0.5,
          overall: data.overall || 0.5,
          predictedScore: data.predictedScore || 50
        });
      }
    } catch (error) {
      console.error('Failed to load ability:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getDimensionValue = (key: string): number => {
    return abilities[key as keyof typeof abilities] || 0.5;
  };

  const currentExam = EXAM_TYPES.find(e => e.id === targetExam) || EXAM_TYPES[2];
  const predictedScore = predictExamScore(abilities.overall, targetExam);

  return (
    <div className="space-y-6">
      {/* 顶部卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 能力雷达图 */}
        <Card className="md:col-span-1 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">能力雷达</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <AbilityRadar abilities={abilities} size={200} />
          </CardContent>
        </Card>

        {/* 综合评分 */}
        <Card className="md:col-span-2 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Brain size={120} />
          </div>
          <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <select 
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="bg-white/20 text-white text-sm px-3 py-1 rounded-full font-bold tracking-wider border-none outline-none cursor-pointer appearance-none"
                  >
                    {EXAM_TYPES.map(exam => (
                      <option key={exam.id} value={exam.id} className="text-black">{exam.name}</option>
                    ))}
                  </select>
                  <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider">BKT 预测</span>
                </div>
                <div className="text-6xl font-black tracking-tighter flex items-baseline gap-2">
                  {predictedScore}
                  <span className="text-2xl font-medium text-primary-foreground/80">{currentExam.unit}</span>
                </div>
                <p className="text-primary-foreground/90 mt-2 font-medium bg-black/10 inline-block px-3 py-1 rounded-full text-sm">
                  满分 {currentExam.maxScore} {currentExam.unit}
                </p>
              </div>
              <div className="text-right">
                <p className="text-primary-foreground/80 mb-1 font-medium">综合能力基数</p>
                <div className="text-4xl font-bold">{Math.round(abilities.overall * 100)}%</div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/20">
              <p className="text-xs text-primary-foreground/80 leading-relaxed">
                <strong className="text-white">终身学习预测：</strong> 系统基于您的综合能力基数，通过非线性映射算法，为您预测在不同难度考试中的表现。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 终身学习轨迹预测 */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-primary" size={24} />
            <CardTitle className="text-lg font-semibold">终身学习轨迹预测</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">基于您当前的综合能力 ({Math.round(abilities.overall * 100)}%)，预测您在各阶段考试中的表现</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {EXAM_TYPES.map((exam) => {
              const score = predictExamScore(abilities.overall, exam.id);
              const isTarget = exam.id === targetExam;
              return (
                <div 
                  key={exam.id} 
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${isTarget ? 'bg-primary/5 border-primary shadow-sm' : 'bg-card hover:bg-muted/50'}`}
                  onClick={() => setTargetExam(exam.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-bold ${isTarget ? 'text-primary' : 'text-foreground'}`}>{exam.name}</h4>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">{score}</span>
                    <span className="text-xs text-muted-foreground">/ {exam.maxScore}</span>
                  </div>
                  <div className="mt-3 text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-md inline-block">
                    {exam.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 能力维度详情 */}
      <Card className="border-border/50">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">能力维度分析</CardTitle>
          <Button variant="outline" size="sm" onClick={async () => {
            toast('确定要重置所有评估数据吗？', {
              action: {
                label: '确定',
                onClick: async () => {
                  await resetAssessment(userId);
                  loadAbility();
                  toast.success('评估数据已重置');
                }
              }
            });
          }}>
            重置评估
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {ABILITY_DIMENSIONS.map((dim) => {
              const value = getDimensionValue(dim.id);
              return (
                <div key={dim.id} className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2"
                    style={{ backgroundColor: `${dim.color}20` }}
                  >
                    <span className="text-2xl font-bold" style={{ color: dim.color }}>
                      {Math.round(value * 100)}
                    </span>
                  </div>
                  <p className="font-medium text-foreground">{dim.name}</p>
                  <p className="text-sm text-muted-foreground">{dim.weight * 100}%权重</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 快速测试入口 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className="hover:border-primary/50 transition-colors cursor-pointer border-border/50"
          onClick={() => onStartTest && onStartTest('vocab')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">词汇量测试</h4>
                <p className="text-sm text-muted-foreground">评估你的词汇水平</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:border-primary/50 transition-colors cursor-pointer border-border/50"
          onClick={() => onStartTest && onStartTest('grammar')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">语法诊断</h4>
                <p className="text-sm text-muted-foreground">找出语法薄弱点</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:border-primary/50 transition-colors cursor-pointer border-border/50"
          onClick={() => onStartTest && onStartTest('reading')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">阅读理解</h4>
                <p className="text-sm text-muted-foreground">提升阅读速度与准确率</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:border-primary/50 transition-colors cursor-pointer border-border/50"
          onClick={() => onStartTest && onStartTest('listening')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
                <Headphones className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">听力理解</h4>
                <p className="text-sm text-muted-foreground">测试听力获取信息能力</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:border-primary/50 transition-colors cursor-pointer border-border/50"
          onClick={() => onStartTest && onStartTest('writing')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <PenTool className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">写作基础</h4>
                <p className="text-sm text-muted-foreground">评估句子与段落写作</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:border-primary/50 transition-colors cursor-pointer border-border/50"
          onClick={() => onStartTest && onStartTest('practice')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">薄弱点攻关</h4>
                <p className="text-sm text-muted-foreground">针对性强化训练</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 学习建议 */}
      <Card className="bg-amber-50/50 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-amber-900 dark:text-amber-500 flex items-center gap-2">
            <span>📝</span> 学习建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {abilities.vocabulary < 0.6 && (
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-amber-900/80 dark:text-amber-500/80">词汇量是英语学习的基础，当前词汇量偏低，建议每天背诵20个新单词。</span>
              </li>
            )}
            {abilities.grammar < 0.6 && (
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-amber-900/80 dark:text-amber-500/80">语法基础较弱，建议系统学习从句和非谓语动词等核心语法点。</span>
              </li>
            )}
            {abilities.reading < 0.6 && (
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-amber-900/80 dark:text-amber-500/80">阅读理解需要提升，建议多读英文文章，练习定位细节和推理判断。</span>
              </li>
            )}
            {abilities.listening < 0.6 && (
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-amber-900/80 dark:text-amber-500/80">听力获取信息能力不足，建议每天进行15分钟的精听训练。</span>
              </li>
            )}
            {abilities.writing < 0.6 && (
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-amber-900/80 dark:text-amber-500/80">写作基础有待加强，建议从句子翻译开始，逐步过渡到段落写作。</span>
              </li>
            )}
            {abilities.overall >= 0.6 && abilities.overall < 0.8 && (
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-amber-900/80 dark:text-amber-500/80">综合能力良好，建议针对薄弱环节进行专项突破，保持日常练习。</span>
              </li>
            )}
            {abilities.overall >= 0.8 && (
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-amber-900/80 dark:text-amber-500/80">综合能力优秀！建议挑战更高难度的阅读材料和听力素材，拓展知识面。</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiagnosticCenter;

