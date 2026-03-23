import React, { useState, useEffect } from 'react';
import { Brain, Target, TrendingUp, Zap, ArrowRight, CheckCircle, XCircle, Clock, ChevronRight, Loader2, Headphones, PenTool } from 'lucide-react';
import { ABILITY_DIMENSIONS, getProgressColor, getAbilityLevel, getStudentModel, StudentAbility } from '../services/assessment';
import AbilityRadar from './AbilityRadar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

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
        <Card className="md:col-span-2 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none">
          <CardContent className="p-6 h-full flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/80 mb-2">预测考试分数</p>
              <div className="text-6xl font-bold">{Math.round(abilities.predictedScore)}</div>
              <p className="text-primary-foreground/80 mt-2">{getAbilityLevel(abilities.predictedScore)}</p>
            </div>
            <div className="text-right">
              <p className="text-primary-foreground/80 mb-1">综合能力</p>
              <div className="text-4xl font-semibold">{Math.round(abilities.overall * 100)}%</div>
              <p className="text-primary-foreground/80 text-sm mt-1">较上次 +5%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 能力维度详情 */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">能力维度分析</CardTitle>
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
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-600" />
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
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
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
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600" />
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
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Headphones className="w-6 h-6 text-yellow-600" />
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
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <PenTool className="w-6 h-6 text-red-600" />
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
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
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
      <Card className="bg-amber-50/50 border-amber-200/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-amber-900 flex items-center gap-2">
            <span>📝</span> 学习建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <span className="text-amber-900/80">词汇量是英语学习的基础，建议每天背诵20个新单词</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <span className="text-amber-900/80">语法较弱，建议系统学习从句和非谓语动词</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <span className="text-amber-900/80">阅读理解需要多读英文文章，练习定位细节和推理判断</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiagnosticCenter;
