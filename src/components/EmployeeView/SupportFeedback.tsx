import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { MessageSquare, ShieldCheck, Clock, Heart, ArrowRight, BookOpen, Bell, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Complaint } from '../../types';
import * as apiDataService from '../../services/apiDataService';

interface SupportFeedbackProps {
  onReset: () => void;
}

export function SupportFeedback({ onReset }: SupportFeedbackProps) {
  const [submitted, setSubmitted] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [complaintType, setComplaintType] = useState('规则疑问');
  const [complaintContent, setComplaintContent] = useState('');
  
  // Survey state
  const [rating, setRating] = useState<number | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [isSubmittingSurvey, setIsSubmittingSurvey] = useState(false);

  const fetchComplaints = async () => {
    try {
      const { data } = await apiDataService.getComplaints();
      // Filter for current user (mocked as '杨鸿康')
      setComplaints(data.filter((c: any) => c.candidateName === '杨鸿康'));
    } catch (error) {
      console.error('Failed to fetch complaints from localStorage:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmitComplaint = async (typeOverride?: string) => {
    try {
      const type = typeOverride || complaintType;
      await apiDataService.addComplaint({ 
        candidateName: '杨鸿康', 
        type, 
        content: complaintContent 
      });
      setComplaintSubmitted(true);
      setComplaintContent('');
      fetchComplaints();
    } catch (error) {
      console.error('Failed to submit complaint to localStorage:', error);
      setComplaintSubmitted(true);
    }
  };

  const handleSubmitSurvey = async () => {
    if (!rating) return;
    setIsSubmittingSurvey(true);
    try {
      await apiDataService.addFeedback({ 
        rating, 
        suggestion,
        candidateName: '杨鸿康' // Mocked current user
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit survey to localStorage:', error);
      setSubmitted(true);
    } finally {
      setIsSubmittingSurvey(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Human Support Banner */}
      <section className="bg-white rounded-3xl p-10 border border-[#E5E6EB] shadow-sm text-center space-y-6">
        <div className="w-20 h-20 bg-[#E8F3FF] rounded-full flex items-center justify-center text-[#0052D9] mx-auto">
          <ShieldCheck size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">对报告有疑问？一键召唤人工 HR 护航</h2>
          <p className="text-[#4E5969]">AI 辅助决策，人工最终定案。我们尊重每一位员工的独特性。</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => {
              setShowComplaintForm(true);
              setComplaintType('规则疑问');
            }}
            className="w-full sm:w-auto bg-[#0052D9] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#003EB3] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0052D9]/20"
          >
            <MessageSquare size={20} />
            深度复盘申请
          </button>
          <div className="flex items-center gap-2 text-sm text-[#86909C] bg-[#F2F3F5] px-4 py-4 rounded-2xl">
            <Clock size={16} />
            24 小时内人工复核承诺
          </div>
        </div>

        {/* My Appeals Status */}
        <AnimatePresence>
          {complaints.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8 space-y-4 text-left"
            >
              <h4 className="text-sm font-bold text-[#4E5969] flex items-center gap-2">
                <Bell size={14} className="text-[#0052D9]" />
                我的申诉/投诉记录
              </h4>
              <div className="space-y-3">
                {complaints.map((c: any) => (
                  <div key={c.id} className="p-4 bg-[#F7F8FA] rounded-2xl border border-[#E5E6EB] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold",
                        c.type === '投诉' ? "bg-[#FFF2F0] text-[#D54941]" : "bg-[#F0F7FF] text-[#0052D9]"
                      )}>
                        {c.type}
                      </span>
                      <span className={cn(
                        "text-[10px] font-bold",
                        c.status === 'resolved' ? "text-[#2BA471]" : "text-[#E37318]"
                      )}>
                        {c.status === 'resolved' ? '已处理' : '处理中'}
                      </span>
                    </div>
                    <p className="text-xs text-[#4E5969]">{c.content}</p>
                    {c.feedback && (
                      <div className="p-3 bg-white rounded-xl border border-[#E5E6EB] space-y-2">
                        <div className="text-[10px] font-bold text-[#0052D9] flex items-center gap-1">
                          <CheckCircle2 size={10} />
                          HR 复核意见：
                        </div>
                        <p className="text-xs text-[#1D2129] leading-relaxed">{c.feedback}</p>
                        {c.status === 'resolved' && (
                          <div className="flex gap-2 pt-2">
                            <button 
                              onClick={() => {
                                setShowComplaintForm(true);
                                setComplaintType('再次申诉');
                                setComplaintContent(`针对前次申诉结果（${c.feedback}）的补充：`);
                              }}
                              className="flex-1 py-1.5 bg-[#F2F3F5] text-[#4E5969] rounded-lg text-[10px] font-bold hover:bg-[#E5E6EB]"
                            >
                              再次申诉
                            </button>
                            <button 
                              onClick={() => {
                                setShowComplaintForm(true);
                                setComplaintType('投诉');
                                setComplaintContent(`对申诉处理结果不满意，发起正式投诉。前次意见：${c.feedback}`);
                              }}
                              className="flex-1 py-1.5 bg-[#FFF2F0] text-[#D54941] rounded-lg text-[10px] font-bold hover:bg-[#FFD8D4]"
                            >
                              直接投诉
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showComplaintForm && !complaintSubmitted && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-8 bg-[#F7F8FA] rounded-3xl border border-[#E5E6EB] text-left space-y-6"
          >
            <h4 className="font-bold text-lg flex items-center gap-2">
              {complaintType === '投诉' ? <AlertCircle className="text-[#D54941]" /> : <MessageSquare className="text-[#0052D9]" />}
              {complaintType === '再次申诉' ? '发起再次申诉' : complaintType === '投诉' ? '发起正式投诉' : '提交复盘申请'}
            </h4>
            <div className="space-y-4">
              {complaintType !== '再次申诉' && complaintType !== '投诉' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#4E5969]">申诉分类</label>
                  <div className="flex flex-wrap gap-3">
                    {['规则疑问', '方案建议', '其他反馈'].map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setComplaintType(cat)}
                        className={cn(
                          "px-4 py-2 border rounded-xl text-sm transition-all",
                          complaintType === cat ? "bg-[#0052D9] text-white border-[#0052D9]" : "bg-white border-[#E5E6EB] text-[#4E5969] hover:border-[#0052D9]"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#4E5969]">详细说明</label>
                <textarea 
                  value={complaintContent}
                  onChange={(e) => setComplaintContent(e.target.value)}
                  placeholder="请详细描述您的疑问或建议，以便 HR 更好地为您复核..."
                  className="w-full h-32 p-4 bg-white rounded-2xl border border-[#E5E6EB] focus:ring-2 focus:ring-[#0052D9] transition-all text-sm resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleSubmitComplaint()}
                  className={cn(
                    "flex-1 py-3 text-white rounded-xl font-bold transition-all",
                    complaintType === '投诉' ? "bg-[#D54941] hover:bg-[#B33B34]" : "bg-[#0052D9] hover:bg-[#003EB3]"
                  )}
                >
                  确认提交
                </button>
                <button 
                  onClick={() => setShowComplaintForm(false)}
                  className="px-6 py-3 bg-white border border-[#E5E6EB] text-[#4E5969] rounded-xl font-bold hover:bg-[#F2F3F5] transition-all"
                >
                  取消
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {complaintSubmitted && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-8 bg-[#EFFFF1] rounded-3xl border border-[#B7EB8F] text-center space-y-3"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#2BA471] mx-auto shadow-sm">
              <ShieldCheck size={24} />
            </div>
            <h4 className="font-bold text-[#1D2129]">申请已提交</h4>
            <p className="text-sm text-[#4E5969]">HR 将在 24 小时内完成复核并与您联系，请留意系统通知。</p>
            <button 
              onClick={() => { setShowComplaintForm(false); setComplaintSubmitted(false); }}
              className="text-xs font-bold text-[#0052D9] hover:underline"
            >
              关闭
            </button>
          </motion.div>
        )}
      </section>

      {/* Growth Plan for Unsuccessful (Mock State) */}
      <section className="bg-gradient-to-br from-[#F7F8FA] to-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#FFF7E8] rounded-lg text-[#E37318]">
            <Heart size={20} />
          </div>
          <h3 className="text-lg font-bold">落选员工专属成长方案</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-[#E5E6EB] hover:border-[#0052D9] transition-all group cursor-pointer">
            <BookOpen className="text-[#0052D9] mb-4" size={24} />
            <h4 className="font-bold mb-2">定制课程包</h4>
            <p className="text-sm text-[#86909C] mb-4">根据您的待提升项，AI 匹配了 3 门内部精品课。</p>
            <div className="flex items-center text-xs font-bold text-[#0052D9] group-hover:gap-2 transition-all">
              立即学习 <ArrowRight size={14} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5E6EB] hover:border-[#0052D9] transition-all group cursor-pointer">
            <Bell className="text-[#0052D9] mb-4" size={24} />
            <h4 className="font-bold mb-2">下次竞聘提醒</h4>
            <p className="text-sm text-[#86909C] mb-4">关注相关岗位动态，我们将在有新机会时第一时间通知您。</p>
            <div className="flex items-center text-xs font-bold text-[#0052D9] group-hover:gap-2 transition-all">
              开启订阅 <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Survey */}
      <section className="bg-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">激励式反馈小问卷</h3>
          <span className="text-xs font-bold text-[#E37318] bg-[#FFF7E8] px-3 py-1 rounded-full">
            完成问卷会自动发放 10 积分到个人账号
          </span>
        </div>
        {!submitted ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm font-medium text-[#4E5969]">您觉得本次 AI 诊断报告的透明度如何？</p>
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <button 
                    key={i} 
                    onClick={() => setRating(i)}
                    className={cn(
                      "w-12 h-12 rounded-xl border transition-all font-bold",
                      rating === i 
                        ? "bg-[#0052D9] text-white border-[#0052D9] shadow-lg shadow-[#0052D9]/20" 
                        : "bg-white border-[#E5E6EB] text-[#4E5969] hover:border-[#0052D9] hover:bg-[#E8F3FF]"
                    )}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-medium text-[#4E5969]">您对系统的建议（选填）：</p>
              <textarea 
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                className="w-full h-24 p-4 bg-[#F2F3F5] rounded-2xl border-none focus:ring-2 focus:ring-[#0052D9] transition-all text-sm resize-none" 
              />
            </div>
            <button
              onClick={handleSubmitSurvey}
              disabled={!rating || isSubmittingSurvey}
              className={cn(
                "w-full py-4 rounded-2xl font-bold transition-all",
                !rating || isSubmittingSurvey 
                  ? "bg-[#F2F3F5] text-[#86909C] cursor-not-allowed" 
                  : "bg-[#0052D9] text-white hover:bg-[#003EB3] shadow-lg shadow-[#0052D9]/10"
              )}
            >
              {isSubmittingSurvey ? '提交中...' : '提交反馈'}
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-10 text-center space-y-4"
          >
            <div className="w-16 h-16 bg-[#EFFFF1] rounded-full flex items-center justify-center text-[#2BA471] mx-auto">
              <Heart size={32} />
            </div>
            <h4 className="text-xl font-bold">感谢您的反馈！</h4>
            <p className="text-[#86909C]">您的每一个建议都将帮助我们做得更好。</p>
            <button
              onClick={onReset}
              className="text-[#0052D9] font-bold text-sm hover:underline"
            >
              返回首页
            </button>
          </motion.div>
        )}
      </section>
    </div>
  );
}
