import React, { useState, useEffect } from 'react';
import { Brain, Target, TrendingUp, Zap, ArrowRight, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import { ABILITY_DIMENSIONS, getProgressColor, getAbilityLevel } from '../services/assessment';
import AbilityRadar from './AbilityRadar';

interface DiagnosticCenterProps {
  userId?: string;
}

interface StudentAbility {
  vocabulary: number;
  grammar: number;
  reading: number;
  listening: number;
  writing: number;
  overall: number;
  predictedScore: number;
}

const DiagnosticCenter: React.FC<DiagnosticCenterProps> = ({ userId }) => {
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
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_model', userId })
      });
      if (response.ok) {
        const data = await response.json();
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
        <div className="md:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">能力雷达</h3>
          <AbilityRadar abilities={abilities} size={200} />
        </div>

        {/* 综合评分 */}
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-indigo-100 mb-2">预测考试分数</p>
              <div className="text-6xl font-bold">{Math.round(abilities.predictedScore)}</div>
              <p className="text-indigo-100 mt-2">{getAbilityLevel(abilities.predictedScore)}</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-100 mb-1">综合能力</p>
              <div className="text-4xl font-semibold">{Math.round(abilities.overall * 100)}%</div>
              <p className="text-indigo-100 text-sm mt-1">较上次 +5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 能力维度详情 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">能力维度分析</h3>
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
                <p className="font-medium text-gray-700">{dim.name}</p>
                <p className="text-sm text-gray-500">{dim.weight * 100}%权重</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 快速测试入口 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => setTestInProgress(true)}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-indigo-300 transition-colors text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">词汇量测试</h4>
              <p className="text-sm text-gray-500">评估你的词汇水平</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </div>
        </button>

        <button className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-indigo-300 transition-colors text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">知识点诊断</h4>
              <p className="text-sm text-gray-500">找出知识薄弱点</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </div>
        </button>

        <button className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-indigo-300 transition-colors text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">薄弱点攻关</h4>
              <p className="text-sm text-gray-500">针对性强化训练</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </div>
        </button>

        <button className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-indigo-300 transition-colors text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">模拟考试</h4>
              <p className="text-sm text-gray-500">全真模拟预测分数</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </div>
        </button>
      </div>

      {/* 学习建议 */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 学习建议</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <span className="text-gray-700">词汇量是英语学习的基础，建议每天背诵20个新单词</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <span className="text-gray-700">语法较弱，建议系统学习从句和非谓语动词</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <span className="text-gray-700">阅读理解需要多读英文文章，练习定位细节和推理判断</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DiagnosticCenter;
