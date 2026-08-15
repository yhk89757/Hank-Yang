import React from 'react';
import { LearningResource, SkillGap } from '../../types';
import { cn } from '../../lib/utils';
import {
  BookOpen, Video, FileText, Globe, Award, ExternalLink,
  Clock, TrendingUp, Target, Sparkles, ChevronRight, Filter
} from 'lucide-react';

interface LearningRecommendationsProps {
  resources: LearningResource[];
  skillGaps: SkillGap[];
  isLoading?: boolean;
}

export function LearningRecommendations({ resources, skillGaps, isLoading }: LearningRecommendationsProps) {
  const [filterType, setFilterType] = React.useState<string>('all');
  const [filterSkill, setFilterSkill] = React.useState<string>('all');

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#F3E8FF] rounded-xl flex items-center justify-center">
            <BookOpen size={20} className="text-[#8B5CF6]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1D2129]">智能学习资源推荐</h3>
            <p className="text-xs text-[#86909C]">AI 正在为您生成个性化学习路径...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!resources || resources.length === 0) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return <Video size={14} />;
      case 'book': return <BookOpen size={14} />;
      case 'article': return <FileText size={14} />;
      case 'project': return <Globe size={14} />;
      case 'certification': return <Award size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'course': return '课程';
      case 'book': return '书籍';
      case 'article': return '文章';
      case 'project': return '实践项目';
      case 'certification': return '认证';
      default: return type;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case '入门': return 'bg-[#EFFFF1] text-[#2BA471]';
      case '进阶': return 'bg-[#E8F3FF] text-[#0052D9]';
      case '高级': return 'bg-[#FFF7E8] text-[#E37318]';
      default: return 'bg-[#F2F3F5] text-[#4E5969]';
    }
  };

  const types = ['all', ...new Set(resources.map(r => r.type))];
  const skills = ['all', ...new Set(resources.map(r => r.targetSkill))];

  const filteredResources = resources.filter(r => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (filterSkill !== 'all' && r.targetSkill !== filterSkill) return false;
    return true;
  });

  // Group resources by skill gap priority
  const highPrioritySkills = skillGaps
    .filter(g => g.priority === 'high' && g.gap !== 'none')
    .map(g => g.skill);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-xl flex items-center justify-center">
            <BookOpen size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#1D2129]">智能学习资源推荐</h3>
            <p className="text-xs text-[#86909C]">
              基于 {skillGaps.filter(g => g.gap !== 'none').length} 项技能差距，AI 为您推荐 {resources.length} 个学习资源
            </p>
          </div>
          <span className="text-xs text-[#86909C] bg-[#F2F3F5] px-2 py-1 rounded-full">
            共 {resources.length} 个
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex items-center gap-1.5 mr-2">
            <Filter size={12} className="text-[#86909C]" />
            <span className="text-[10px] text-[#86909C] font-bold uppercase tracking-wider">类型</span>
          </div>
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                "text-[10px] font-bold px-3 py-1 rounded-full transition-all flex items-center gap-1",
                filterType === t
                  ? "bg-[#8B5CF6] text-white"
                  : "bg-[#F2F3F5] text-[#4E5969] hover:bg-[#E5E6EB]"
              )}
            >
              {t === 'all' ? '全部' : getTypeLabel(t)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-[10px] text-[#86909C] font-bold uppercase tracking-wider mr-1">技能</span>
          {skills.map(s => (
            <button
              key={s}
              onClick={() => setFilterSkill(s)}
              className={cn(
                "text-[10px] font-bold px-3 py-1 rounded-full transition-all",
                filterSkill === s
                  ? "bg-[#0052D9] text-white"
                  : "bg-[#F2F3F5] text-[#4E5969] hover:bg-[#E5E6EB]"
              )}
            >
              {s === 'all' ? '全部' : s}
            </button>
          ))}
        </div>
      </section>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((resource, idx) => {
          const isHighPriority = highPrioritySkills.includes(resource.targetSkill);
          return (
            <div
              key={idx}
              className={cn(
                "bg-white rounded-2xl p-5 border transition-all hover:shadow-md group",
                isHighPriority
                  ? "border-[#8B5CF6]/30 hover:border-[#8B5CF6]"
                  : "border-[#E5E6EB] hover:border-[#C9CDD4]"
              )}
            >
              {/* Priority Badge & Type */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                    getTypeLabel(resource.type) === '课程' ? 'bg-[#E8F3FF] text-[#0052D9]' :
                    getTypeLabel(resource.type) === '书籍' ? 'bg-[#EFFFF1] text-[#2BA471]' :
                    'bg-[#FFF7E8] text-[#E37318]'
                  )}>
                    {getTypeIcon(resource.type)}
                    {getTypeLabel(resource.type)}
                  </span>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", getDifficultyColor(resource.difficulty))}>
                    {resource.difficulty}
                  </span>
                </div>
                {isHighPriority && (
                  <span className="text-[9px] bg-[#F3E8FF] text-[#8B5CF6] px-2 py-0.5 rounded-full font-bold">
                    高优先补齐
                  </span>
                )}
              </div>

              {/* Title */}
              <h4 className="font-bold text-sm text-[#1D2129] mb-2 line-clamp-2 group-hover:text-[#0052D9] transition-colors">
                {resource.title}
              </h4>

              {/* Description */}
              <p className="text-xs text-[#4E5969] leading-relaxed mb-3 line-clamp-2">
                {resource.description}
              </p>

              {/* Meta Info */}
              <div className="flex items-center gap-3 text-[10px] text-[#86909C] mb-3">
                <span className="flex items-center gap-1">
                  <Target size={10} />
                  {resource.targetSkill}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {resource.duration}
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp size={10} />
                  相关度 {resource.relevance}%
                </span>
              </div>

              {/* Provider & Action */}
              <div className="flex items-center justify-between pt-3 border-t border-[#F2F3F5]">
                <span className="text-[10px] text-[#86909C]">{resource.provider}</span>
                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-[#0052D9] flex items-center gap-1 hover:underline"
                  >
                    前往学习
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <div className="bg-white rounded-2xl p-8 border border-[#E5E6EB] shadow-sm text-center">
          <Sparkles size={32} className="text-[#86909C] mx-auto mb-3" />
          <p className="text-sm text-[#4E5969]">当前筛选条件下无匹配资源</p>
          <button
            onClick={() => { setFilterType('all'); setFilterSkill('all'); }}
            className="mt-2 text-xs font-bold text-[#0052D9] hover:underline"
          >
            重置筛选
          </button>
        </div>
      )}

      {/* Learning Path Summary */}
      <section className="bg-gradient-to-r from-[#F3E8FF] to-[#E8F3FF] rounded-3xl p-8 border border-[#8B5CF6]/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <Award size={24} className="text-[#8B5CF6]" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-[#1D2129] mb-2">个性化学习路径建议</h4>
            <p className="text-sm text-[#4E5969] leading-relaxed mb-4">
              基于您的技能差距分析，建议按以下优先级进行学习：
            </p>
            <div className="space-y-2">
              {skillGaps
                .filter(g => g.gap !== 'none')
                .sort((a, b) => a.priority === 'high' ? -1 : 1)
                .map((gap, idx) => {
                  const relatedResources = resources.filter(r => r.targetSkill === gap.skill);
                  return (
                    <div key={idx} className="flex items-center gap-3 bg-white/70 rounded-xl p-3">
                      <span className="w-6 h-6 rounded-full bg-[#8B5CF6] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-[#1D2129]">{gap.skill}</span>
                        <span className="text-[10px] text-[#86909C] ml-2">
                          {gap.priority === 'high' ? '🔴 优先' : gap.priority === 'medium' ? '🟡 次之' : '🟢 可选'}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8B5CF6] font-bold">
                        {relatedResources.length} 个资源
                      </span>
                      <ChevronRight size={14} className="text-[#86909C]" />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
