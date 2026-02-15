import React, { useState } from 'react';
import { PlanRequest, RequestStatus, Program, TrainingDay, TrainingType, Exercise } from '../types';
import { 
  CheckCircle, XCircle, Plus, Trash2, X, Users, Bell, History,
  Utensils, Dumbbell, DollarSign, Eye, Check, CreditCard, User, CheckCircle2, Ruler, Calendar as CalIcon, Activity, Heart, Search, ChevronRight, Play, Camera, Ban, CheckCircle2 as ActiveIcon
} from 'lucide-react';
import { TRAINING_SYSTEMS, MEAL_TIMES, EXERCISES_DB, NUTRITION_DATABASE } from '../constants';
import ProgressChart from './ProgressChart';

interface TrainerDashboardProps {
  currentUserId: string;
  requests: PlanRequest[];
  setRequests: React.Dispatch<React.SetStateAction<PlanRequest[]>>;
  programs: Program[];
  setPrograms: React.Dispatch<React.SetStateAction<Program[]>>;
  exercises: Exercise[];
  setExercises: (ex: Exercise[]) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TrainerDashboard: React.FC<TrainerDashboardProps> = ({ 
  currentUserId, requests, setRequests, programs, setPrograms, activeTab, setActiveTab 
}) => {
  const [creatingPlanFor, setCreatingPlanFor] = useState<PlanRequest | null>(null);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [viewingStudent, setViewingStudent] = useState<PlanRequest | null>(null);
  const [pricingRequestId, setPricingRequestId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('850000');
  const [tempCardNumber, setTempCardNumber] = useState<string>('');
  const [tempAccountName, setTempAccountName] = useState<string>('');
  const [reviewingReceipt, setReviewingReceipt] = useState<PlanRequest | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [startDate, setStartDate] = useState<string>(new Date().toLocaleDateString('fa-IR'));

  const [selectionModal, setSelectionModal] = useState<{
    isOpen: boolean;
    type: 'exercise' | 'food';
    targetDayId: string;
    targetSectionIdx?: number;
    targetRowId?: string;
    searchTerm: string;
  }>({ isOpen: false, type: 'exercise', targetDayId: '', searchTerm: '' });

  const calculateBMI = (height: number | undefined, weight: number | undefined) => {
    if (!height || !weight) return 'N/A';
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const calculateEndDate = (start: string, duration: string) => {
    const weeks = duration.includes('۱۲') ? 12 : 4;
    return `پایان دوره ${weeks} هفته‌ای بعد از ${start}`;
  };

  const startPlanCreation = (request: PlanRequest) => {
    setCreatingPlanFor(request);
    setTrainingDays([{
      id: Math.random().toString(),
      dayNumber: 1,
      sections: [{ type: TrainingType.MAIN, rows: [] }],
      dietMeals: []
    }]);
  };

  const submitPlan = () => {
    if (!creatingPlanFor) return;
    const newProgram: Program = {
      id: Math.random().toString(),
      requestId: creatingPlanFor.id,
      studentId: creatingPlanFor.studentId,
      trainerId: currentUserId,
      startDate: startDate,
      endDate: calculateEndDate(startDate, creatingPlanFor.duration),
      trainingDays,
      createdAt: new Date().toISOString()
    };
    setPrograms([...programs, newProgram]);
    setRequests(requests.map(r => r.id === creatingPlanFor.id ? { ...r, status: RequestStatus.PLAN_READY } : r));
    setCreatingPlanFor(null);
    setActiveTab('students');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleApproveAndSetPrice = (id: string) => {
    setRequests(requests.map(r => r.id === id ? { 
      ...r, 
      status: RequestStatus.APPROVED_WAITING_PAYMENT,
      price: parseInt(tempPrice),
      cardNumber: tempCardNumber,
      accountName: tempAccountName
    } : r));
    setPricingRequestId(null);
  };

  const handleConfirmReceipt = (id: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: RequestStatus.PAYMENT_APPROVED } : r));
    setReviewingReceipt(null);
  };

  return (
    <div className="animate-in fade-in duration-700 relative">
      {showSuccessToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[3500] animate-in slide-in-from-top">
           <div className="bg-green-600 text-white px-8 py-4 rounded-2xl shadow-3xl flex items-center gap-4 font-black italic border border-green-400/30 backdrop-blur-xl">
              <CheckCircle2 size={24} />
              <span>برنامه با موفقیت برای شاگرد ارسال شد!</span>
           </div>
        </div>
      )}

      {selectionModal.isOpen && (
        <div className="fixed inset-0 z-[4000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="w-full max-w-2xl glass p-8 rounded-[40px] border-white/10 space-y-6 shadow-3xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
                {selectionModal.type === 'exercise' ? 'انتخاب حرکات' : 'انتخاب تغذیه'}
              </h3>
              <button onClick={() => setSelectionModal({ ...selectionModal, isOpen: false })} className="p-3 bg-white/5 rounded-full hover:bg-red-500 transition-all"><X size={20}/></button>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input autoFocus placeholder="جستجو بین لیست هوشمند..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-12 text-white outline-none focus:border-cyan-500 font-bold" value={selectionModal.searchTerm} onChange={(e) => setSelectionModal({...selectionModal, searchTerm: e.target.value})} />
            </div>
            <div className="h-[350px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {(selectionModal.type === 'exercise' ? EXERCISES_DB : Object.values(NUTRITION_DATABASE).flat()).filter(item => {
                   const title = typeof item === 'string' ? item : item.name;
                   return title.includes(selectionModal.searchTerm);
                }).map((item, idx) => {
                  const title = typeof item === 'string' ? item : item.name;
                  const category = (item as any).category;
                  return (
                    <button key={idx} onClick={() => {
                        const { targetDayId, targetSectionIdx, targetRowId, type } = selectionModal;
                        if (type === 'exercise') {
                          setTrainingDays(prev => prev.map(d => d.id === targetDayId ? {
                            ...d,
                            sections: d.sections.map((s, sIdx) => sIdx === targetSectionIdx ? {
                              ...s,
                              rows: s.rows.map(r => r.id === targetRowId ? { ...r, movement: r.movement ? `${r.movement} + ${title}` : title } : r)
                            } : s)
                          } : d));
                        } else {
                          setTrainingDays(prev => prev.map(d => d.id === targetDayId ? {
                            ...d,
                            dietMeals: d.dietMeals?.map(m => m.id === targetRowId ? { ...m, foods: m.foods ? `${m.foods} + ${title}` : title } : m)
                          } : d));
                        }
                    }} className="w-full text-right p-4 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-transparent hover:border-cyan-500/30 transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                         <span className="font-bold text-gray-300 group-hover:text-white text-sm">{title}</span>
                         {category && <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded-md text-cyan-400/60 uppercase font-black">{category}</span>}
                      </div>
                      <Plus size={16} className="text-gray-600 group-hover:text-cyan-400" />
                    </button>
                  );
                })}
            </div>
            <button onClick={() => setSelectionModal({ ...selectionModal, isOpen: false })} className="w-full py-4 bg-cyan-600 text-white font-black rounded-2xl shadow-xl hover:bg-cyan-500 transition-all">بستن و ثبت تغییرات</button>
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'شاگردان فعال', val: requests.filter(r => r.status === RequestStatus.PLAN_READY).length, color: 'text-cyan-400', icon: Users, bg: 'bg-cyan-500/10' },
            { label: 'درخواست جدید', val: requests.filter(r => r.status === RequestStatus.PENDING).length, color: 'text-indigo-400', icon: Bell, bg: 'bg-indigo-500/10' },
            { label: 'نیاز به برنامه', val: requests.filter(r => r.status === RequestStatus.WAITING_FOR_PLAN).length, color: 'text-yellow-400', icon: Dumbbell, bg: 'bg-yellow-500/10' },
            { label: 'تایید واریز', val: requests.filter(r => r.status === RequestStatus.PAYMENT_UPLOADED).length, color: 'text-green-400', icon: CheckCircle, bg: 'bg-green-500/10' }
          ].map((s, i) => (
            <div key={i} className="glass p-6 rounded-[30px] flex flex-col md:flex-row items-center justify-between gap-2 shadow-xl">
              <div className="text-center md:text-right">
                <div className="text-gray-500 text-[10px] font-black uppercase mb-1">{s.label}</div>
                <div className={`text-2xl font-black ${s.color} tracking-tighter`}>{s.val}</div>
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}><s.icon size={20} /></div>
            </div>
          ))}
        </div>
      )}

      {creatingPlanFor && (
        <div className="fixed inset-0 z-[3000] bg-[#0a0a0c]/98 backdrop-blur-3xl overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-64">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 glass p-6 rounded-[40px] border-white/10 shadow-2xl">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-black text-xl italic shadow-xl">SF</div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic">Program Designer</h2>
                  <p className="text-cyan-400 font-bold text-[10px] uppercase tracking-widest">Athlete: {creatingPlanFor.studentName} | Duration: {creatingPlanFor.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                      <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Athlete BMI</div>
                      <div className="text-indigo-400 font-black text-lg italic">{calculateBMI(creatingPlanFor.supplementaryInfo?.height, creatingPlanFor.supplementaryInfo?.weight)}</div>
                  </div>
                  <div className="text-right hidden md:block ml-6">
                      <div className="text-[9px] text-gray-500 font-black uppercase">تاریخ شروع دوره</div>
                      <input type="text" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-b border-white/10 text-white font-black text-sm outline-none focus:border-cyan-400 py-1" />
                  </div>
                  <button onClick={() => setCreatingPlanFor(null)} className="p-3 bg-white/5 rounded-full hover:bg-red-500 transition-all shadow-lg"><X size={20}/></button>
              </div>
            </div>

            {trainingDays.map((day) => (
              <div key={day.id} className="space-y-6 animate-in slide-in-from-bottom-3">
                <div className="flex items-center justify-between border-r-4 border-cyan-500/40 pr-5">
                  <h3 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter">Day {day.dayNumber}</h3>
                  <button onClick={() => setTrainingDays(prev => prev.filter(d => d.id !== day.id))} className="text-red-500/30 hover:text-red-500 p-2 transition-all"><Trash2 size={18}/></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3 space-y-5">
                    <div className="flex items-center justify-between px-2">
                       <h4 className="text-sm font-black text-indigo-400 italic flex items-center gap-2 uppercase tracking-widest"><Dumbbell size={16}/> Workout Plan</h4>
                       <button onClick={() => {
                          setTrainingDays(prev => prev.map(d => d.id === day.id ? { ...d, sections: [...d.sections, { type: TrainingType.MAIN, rows: [] }] } : d));
                       }} className="px-5 py-2.5 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-black hover:bg-indigo-600 hover:text-white transition-all">+ بخش تمرینی</button>
                    </div>

                    {day.sections.map((section, sIdx) => (
                      <div key={sIdx} className="glass p-5 md:p-6 rounded-[35px] border-white/5 shadow-xl space-y-5 relative overflow-hidden group">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                          <select value={section.type} className="bg-white/5 px-5 py-2.5 rounded-xl border border-white/10 text-xs font-black text-white outline-none focus:border-indigo-400" onChange={(e) => {
                                const newType = e.target.value as TrainingType;
                                setTrainingDays(prev => prev.map(d => d.id === day.id ? { ...d, sections: d.sections.map((s, idx) => idx === sIdx ? { ...s, type: newType } : s)} : d));
                              }}>
                            {Object.values(TrainingType).map(t => <option key={t} value={t} className="bg-[#0f0f13]">{t}</option>)}
                          </select>
                          <button onClick={() => {
                              setTrainingDays(prev => prev.map(d => d.id === day.id ? {
                                ...d,
                                sections: d.sections.map((s, idx) => idx === sIdx ? {
                                  ...s,
                                  rows: [...s.rows, { id: Math.random().toString(), movement: '', system: 'عادی', reps: '۱۲', sets: '۳', rhythm: 'معمولی', rest: '۶۰ ثانیه' }]
                                } : s)
                              } : d));
                          }} className="w-full md:w-auto bg-cyan-600 text-white px-6 py-2.5 rounded-xl text-[11px] font-black shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"><Plus size={14}/> افزودن ردیف حرکت</button>
                        </div>
                        <div className="overflow-x-auto rounded-2xl border border-white/5">
                          <table className="w-full text-right border-separate border-spacing-y-2 p-1">
                            <thead>
                              <tr className="text-[8px] text-gray-500 font-black uppercase tracking-widest px-3 text-center">
                                <th className="p-2 w-8">#</th>
                                <th className="p-2">حرکت ورزشی</th>
                                <th className="p-2">سیستم</th>
                                <th className="p-2">ست / تکرار</th>
                                <th className="p-2 w-8"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {section.rows.map((row, rIdx) => (
                                <tr key={row.id} className="bg-white/5 hover:bg-white/[0.08] transition-all rounded-xl">
                                  <td className="p-2 text-center font-black text-gray-700 text-[10px]">{rIdx + 1}</td>
                                  <td className="p-2">
                                    <button onClick={() => setSelectionModal({ isOpen: true, type: 'exercise', targetDayId: day.id, targetSectionIdx: sIdx, targetRowId: row.id, searchTerm: '' })} className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-right text-[11px] font-bold text-cyan-400 flex items-center justify-between hover:border-cyan-500/50">
                                      <span className="truncate max-w-[150px]">{row.movement || 'انتخاب حرکات...'}</span>
                                      <Search size={12} className="opacity-30" />
                                    </button>
                                  </td>
                                  <td className="p-2">
                                    <select className="bg-transparent text-indigo-400 font-black text-[10px] outline-none w-full" value={row.system} onChange={(e) => {
                                      const val = e.target.value;
                                      setTrainingDays(prev => prev.map(d => d.id === day.id ? { ...d, sections: d.sections.map((s, idx) => idx === sIdx ? { ...s, rows: s.rows.map(r => r.id === row.id ? { ...r, system: val } : r)} : s)} : d));
                                    }}>
                                      {TRAINING_SYSTEMS.map(s => <option key={s} value={s} className="bg-[#0f0f13]">{s}</option>)}
                                    </select>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <input className="w-20 bg-black/30 border border-white/5 rounded-lg text-center font-black text-white text-[11px] py-1.5 outline-none focus:border-cyan-400" placeholder="Sets" value={row.sets} onChange={(e)=> {
                                        const val = e.target.value;
                                        setTrainingDays(prev => prev.map(d => d.id === day.id ? { ...d, sections: d.sections.map((s, idx) => idx === sIdx ? { ...s, rows: s.rows.map(r => r.id === row.id ? { ...r, sets: val } : r)} : s)} : d));
                                      }} />
                                      <span className="text-gray-600 font-black text-[10px]">×</span>
                                      <input className="w-28 bg-black/30 border border-white/5 rounded-lg text-center font-black text-white text-[11px] py-1.5 outline-none focus:border-cyan-400" placeholder="Reps" value={row.reps} onChange={(e)=> {
                                        const val = e.target.value;
                                        setTrainingDays(prev => prev.map(d => d.id === day.id ? { ...d, sections: d.sections.map((s, idx) => idx === sIdx ? { ...s, rows: s.rows.map(r => r.id === row.id ? { ...r, reps: val } : r)} : s)} : d));
                                      }} />
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <button onClick={() => {
                                      setTrainingDays(prev => prev.map(d => d.id === day.id ? { ...d, sections: d.sections.map((s, idx) => idx === sIdx ? { ...s, rows: s.rows.filter(r => r.id !== row.id)} : s)} : d));
                                    }} className="text-red-500/20 hover:text-red-500 transition-all"><X size={14}/></button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-5">
                    <h4 className="text-sm font-black text-green-400 italic flex items-center gap-2 uppercase tracking-widest px-2"><Utensils size={16}/> Nutrition</h4>
                    <div className="glass p-5 md:p-6 rounded-[35px] border-white/5 space-y-4 shadow-lg">
                      {day.dietMeals?.map((meal) => (
                        <div key={meal.id} className="space-y-2.5 bg-white/5 p-4 rounded-2xl relative group border border-transparent hover:border-green-500/20 transition-all">
                          <div className="flex justify-between items-center">
                            <select className="bg-transparent text-green-400 font-black text-[10px] outline-none" value={meal.time} onChange={(e) => {
                                const val = e.target.value;
                                setTrainingDays(prev => prev.map(d => d.id === day.id ? { ...d, dietMeals: d.dietMeals?.map(m => m.id === meal.id ? { ...m, time: val } : m) } : d));
                              }}>
                              {MEAL_TIMES.map(t => <option key={t} value={t} className="bg-[#0f0f13]">{t}</option>)}
                            </select>
                            <button onClick={() => {
                              setTrainingDays(prev => prev.map(d => d.id === day.id ? { ...d, dietMeals: d.dietMeals?.filter(m => m.id !== meal.id) } : d));
                            }} className="text-red-500/20 hover:text-red-500"><X size={12}/></button>
                          </div>
                          <button onClick={() => setSelectionModal({ isOpen: true, type: 'food', targetDayId: day.id, targetRowId: meal.id, searchTerm: '' })} className="w-full min-h-[50px] bg-black/20 border border-white/5 rounded-xl p-3 text-right text-[10px] font-bold text-gray-400 hover:border-green-500/30 leading-relaxed">
                            {meal.foods || 'انتخاب تغذیه...'}
                          </button>
                        </div>
                      ))}
                      <button onClick={() => {
                        setTrainingDays(prev => prev.map(d => d.id === day.id ? { ...d, dietMeals: [...(d.dietMeals || []), { id: Math.random().toString(), time: MEAL_TIMES[0], foods: '' }] } : d));
                      }} className="w-full py-4 border border-dashed border-green-500/20 rounded-2xl text-gray-500 hover:text-green-400 transition-all text-[10px] font-black uppercase italic">+ وعده غذایی جدید</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button onClick={() => setTrainingDays([...trainingDays, { id: Math.random().toString(), dayNumber: trainingDays.length + 1, sections: [{ type: TrainingType.MAIN, rows: [] }], dietMeals: [] }])} className="w-full py-8 rounded-[40px] border-2 border-dashed border-white/5 text-gray-700 hover:text-cyan-400 transition-all font-black text-xl flex items-center justify-center gap-4 group bg-white/5">
              <Plus size={30} className="group-hover:rotate-90 transition-transform duration-500" /> <span>افزودن روز تمرین جدید</span>
            </button>

            <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-[#0a0a0c]/95 backdrop-blur-2xl border-t border-white/10 flex flex-col md:flex-row justify-center items-center gap-4 z-[3200] shadow-3xl">
              <button onClick={() => setCreatingPlanFor(null)} className="w-full md:w-auto px-10 py-3 rounded-2xl bg-white/5 text-gray-400 font-black hover:text-white text-xs transition-all">لغو عملیات</button>
              <button onClick={submitPlan} className="w-full md:w-auto px-20 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-black text-lg shadow-2xl hover:scale-105 transition-all uppercase italic tracking-tighter">ثبت نهایی و ارسال برنامه</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="grid gap-6">
           <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter mb-2 uppercase">Requests Workflow</h2>
           {requests.filter(r => r.status === RequestStatus.PENDING || r.status === RequestStatus.PAYMENT_UPLOADED || r.status === RequestStatus.WAITING_FOR_PLAN).map(r => (
             <div key={r.id} className="glass p-5 md:p-8 rounded-[40px] border-white/10 flex flex-col lg:flex-row justify-between items-center gap-6 group hover:border-cyan-500/20 transition-all shadow-xl">
                <div className="flex items-center gap-5">
                   <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-600 text-2xl font-black italic">{r.studentName.charAt(0)}</div>
                   <div>
                      <div className="text-xl font-black text-white">{r.studentName}</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className={`text-[9px] px-4 py-1.5 rounded-lg font-black uppercase border ${r.status === RequestStatus.PENDING ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}`}>{r.status}</span>
                        <span className="text-[9px] bg-white/5 px-4 py-1.5 rounded-lg font-black text-gray-500 border border-white/5">{r.planType}</span>
                      </div>
                   </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                  {r.status === RequestStatus.PENDING && (
                    pricingRequestId === r.id ? (
                      <div className="flex flex-col gap-2 glass p-5 rounded-[25px] border-white/10 w-full sm:w-72">
                        <input type="number" value={tempPrice} onChange={(e) => setTempPrice(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-5 py-3 w-full text-xs font-black text-white outline-none focus:border-cyan-400" placeholder="قیمت (تومان)" />
                        <input type="text" maxLength={16} value={tempCardNumber} onChange={(e) => setTempCardNumber(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-5 py-3 w-full text-xs font-black text-white outline-none focus:border-indigo-400" placeholder="شماره کارت ۱۶ رقمی" />
                        <input type="text" value={tempAccountName} onChange={(e) => setTempAccountName(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-5 py-3 w-full text-xs font-black text-white outline-none focus:border-green-400" placeholder="نام صاحب حساب" />
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => handleApproveAndSetPrice(r.id)} className="flex-1 py-3 bg-cyan-600 text-white rounded-xl font-black text-[10px] shadow-lg">ارسال فاکتور</button>
                          <button onClick={() => setPricingRequestId(null)} className="p-3 bg-white/5 rounded-xl"><X size={16}/></button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setPricingRequestId(r.id)} className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black text-xs shadow-lg hover:scale-105 transition-all">تایید و تعیین قیمت</button>
                    )
                  )}
                  {r.status === RequestStatus.PAYMENT_UPLOADED && (
                    <button onClick={() => setReviewingReceipt(r)} className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-green-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-all"><Eye size={18} /> بررسی فیش واریزی</button>
                  )}
                  {r.status === RequestStatus.WAITING_FOR_PLAN && (
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <button onClick={() => setViewingStudent(r)} className="flex-1 px-6 py-4 rounded-2xl bg-white/10 text-cyan-400 font-black text-xs border border-white/5">مشاهده بیومتریک</button>
                      <button onClick={() => startPlanCreation(r)} className="flex-2 px-10 py-4 rounded-2xl bg-cyan-600 text-white font-black text-xs shadow-lg italic uppercase tracking-tighter hover:scale-105 transition-all">طراحی برنامه</button>
                    </div>
                  )}
                  <button className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-md"><XCircle size={22}/></button>
                </div>
             </div>
           ))}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-8">
          <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter mb-2 uppercase">My Athletes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.filter(r => r.status === RequestStatus.PLAN_READY).map(r => (
              <div key={r.id} onClick={() => setViewingStudent(r)} className="glass p-8 rounded-[45px] border-white/10 shadow-lg text-center group hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden">
                <div className="relative inline-block mb-8">
                  <div className="w-24 h-24 rounded-[35px] bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white text-4xl font-black italic shadow-lg">{r.studentName.charAt(0)}</div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-[#0a0a0c] flex items-center justify-center shadow-md"><Check size={16} className="text-black font-black" /></div>
                </div>
                <h4 className="text-xl font-black text-white mb-1">{r.studentName}</h4>
                <p className="text-gray-500 font-bold mb-1 uppercase tracking-[0.2em] text-[9px]">{r.city} • {r.level}</p>
                <div className="text-cyan-400 font-black text-[10px] mb-6 italic uppercase">BMI: {calculateBMI(r.supplementaryInfo?.height, r.supplementaryInfo?.weight)}</div>
                <div className="px-5 py-3 bg-white/5 rounded-2xl font-black text-[9px] italic group-hover:bg-cyan-500 group-hover:text-black transition-all border border-white/5 uppercase tracking-widest">Full Analytics</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewingStudent && (
        <div className="fixed inset-0 z-[4000] bg-black/98 backdrop-blur-3xl overflow-y-auto p-4 md:p-12">
           <div className="max-w-6xl mx-auto space-y-10 pb-20">
              <div className="flex justify-between items-center glass p-8 rounded-[40px] border-white/10 shadow-2xl">
                 <div className="flex items-center gap-8">
                    <div className="w-16 h-16 rounded-[25px] bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-black italic">{viewingStudent.studentName.charAt(0)}</div>
                    <div>
                       <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">{viewingStudent.studentName}</h2>
                       <div className="flex gap-3 mt-1">
                           <button className="text-[8px] font-black uppercase px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg flex items-center gap-1.5 hover:bg-red-500 hover:text-white transition-all"><Ban size={10}/> Stop Access</button>
                           <button className="text-[8px] font-black uppercase px-3 py-1.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg flex items-center gap-1.5"><ActiveIcon size={10}/> Active</button>
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setViewingStudent(null)} className="p-4 bg-white/5 rounded-full hover:bg-red-500 transition-all shadow-lg"><X size={24}/></button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="glass p-8 md:p-10 rounded-[50px] border-white/10 space-y-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-1 bg-indigo-500"></div>
                    <h4 className="text-xl font-black text-indigo-400 flex items-center gap-2.5 italic uppercase tracking-tighter"><Activity /> Physical Metrics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                       {[
                         { icon: CalIcon, label: 'AGE', val: viewingStudent.supplementaryInfo?.age || '??' },
                         { icon: Ruler, label: 'HEIGHT', val: viewingStudent.supplementaryInfo?.height || '??' },
                         { icon: Activity, label: 'WEIGHT', val: viewingStudent.supplementaryInfo?.weight || '??' },
                         { icon: Heart, label: 'BLOOD', val: viewingStudent.supplementaryInfo?.bloodType || '??' },
                         { icon: Check, label: 'BMI', val: calculateBMI(viewingStudent.supplementaryInfo?.height, viewingStudent.supplementaryInfo?.weight) }
                       ].map((stat, i) => (
                         <div key={i} className={`p-4 rounded-[25px] border group transition-all text-center ${stat.label === 'BMI' ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-white/5 hover:border-indigo-500/30'}`}>
                            <div className="text-gray-500 text-[7px] uppercase mb-1.5 flex items-center justify-center gap-1 font-black"><stat.icon size={10}/> {stat.label}</div>
                            <div className={`text-xl font-black ${stat.label === 'BMI' ? 'text-cyan-400' : 'text-white'}`}>{stat.val}</div>
                         </div>
                       ))}
                    </div>

                    <div className="space-y-5">
                       <div className="bg-white/5 p-8 rounded-[35px] border border-white/5">
                          <div className="text-cyan-400 text-[9px] font-black uppercase mb-3 italic tracking-widest">Goal & History</div>
                          <div className="text-white font-bold text-base italic leading-relaxed">{viewingStudent.supplementaryInfo?.goal || 'بهبود آمادگی جسمانی کلی و تناسب اندام'}</div>
                       </div>
                       <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                          {[
                            { label: 'Arm', key: 'arm' },
                            { label: 'Chest', key: 'chest' },
                            { label: 'Waist', key: 'waist' },
                            { label: 'Hip', key: 'hip' },
                            { label: 'Thigh', key: 'thigh' }
                          ].map(m => (
                            <div key={m.key} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center group hover:border-indigo-500/40 transition-all">
                               <span className="text-gray-500 text-[8px] uppercase font-black mb-1">{m.label}</span>
                               <span className="text-white font-black text-base">{(viewingStudent.supplementaryInfo?.measurements as any)?.[m.key] || '0'} <small className="text-[8px] opacity-40">cm</small></span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="glass p-8 rounded-[40px] border-white/10 space-y-6 shadow-xl">
                       <h4 className="text-xl font-black text-cyan-400 flex items-center gap-2.5 italic uppercase tracking-tighter"><Activity /> Evolution Chart</h4>
                       <div className="h-40">
                          <ProgressChart data={viewingStudent.progress || []} label="Weight Progress" />
                       </div>
                    </div>
                    
                    <div className="glass p-8 rounded-[40px] border-white/10 space-y-6 shadow-xl">
                       <h4 className="text-xl font-black text-green-400 flex items-center gap-2.5 italic uppercase tracking-tighter"><Camera /> Athlete Photos</h4>
                       <div className="grid grid-cols-3 gap-3">
                          {[0, 1, 2].map(i => (
                            <div key={i} className="aspect-[3/4] bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden group shadow-inner">
                               {viewingStudent.supplementaryInfo?.photos?.[i] ? (
                                 <img src={viewingStudent.supplementaryInfo.photos[i]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                               ) : (
                                 <div className="flex flex-col items-center gap-2 opacity-10 text-white">
                                   <Camera size={20} />
                                   <span className="text-[7px] font-black uppercase">Not Ready</span>
                                 </div>
                               )}
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="glass p-8 rounded-[50px] border-white/10 space-y-6 shadow-2xl">
                  <h4 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3"><History size={20} /> Data Archive</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                          <h5 className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-3 italic">Programs Archive</h5>
                          {programs.filter(p => p.studentId === viewingStudent.studentId).map(p => (
                             <div key={p.id} className="bg-white/5 p-5 rounded-[25px] border border-white/5 flex justify-between items-center hover:border-cyan-500/20 transition-all group">
                                <div>
                                    <div className="text-white font-black text-xs">برنامه تمرینی هوشمند {p.startDate}</div>
                                    <div className="text-[8px] text-gray-500 font-bold uppercase mt-1 italic">{p.endDate}</div>
                                </div>
                                <button className="p-2.5 bg-white/5 rounded-full hover:bg-cyan-500 hover:text-black transition-all"><Eye size={14}/></button>
                             </div>
                          ))}
                          {programs.filter(p => p.studentId === viewingStudent.studentId).length === 0 && <div className="p-8 text-center text-gray-700 italic text-[10px] uppercase tracking-widest border border-dashed border-white/5 rounded-[25px]">No Programs Yet</div>}
                      </div>
                      <div className="space-y-3">
                          <h5 className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-3 italic">Financial Archive</h5>
                          {viewingStudent.price && (
                             <div className="bg-white/5 p-5 rounded-[25px] border border-white/5 flex justify-between items-center group">
                                <div>
                                    <div className="text-white font-black text-xs">{viewingStudent.planType}</div>
                                    <div className="text-green-500 font-black text-[10px] mt-1 italic">{viewingStudent.price.toLocaleString('fa-IR')} تومان</div>
                                </div>
                                <div className="text-[8px] font-black text-gray-600 uppercase italic">Verified ✅</div>
                             </div>
                          )}
                          {!viewingStudent.price && <div className="p-8 text-center text-gray-700 italic text-[10px] uppercase tracking-widest border border-dashed border-white/5 rounded-[25px]">No Transactions</div>}
                      </div>
                  </div>
              </div>
              
              {viewingStudent.status === RequestStatus.WAITING_FOR_PLAN && (
                 <div className="flex justify-center pt-8">
                    <button onClick={() => { setViewingStudent(null); startPlanCreation(viewingStudent); }} className="px-16 py-6 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-black text-xl rounded-[30px] shadow-2xl hover:scale-105 transition-all flex items-center gap-4 italic uppercase tracking-tighter">شروع طراحی برنامه نهایی <ChevronRight size={28}/></button>
                 </div>
              )}
           </div>
        </div>
      )}

      {reviewingReceipt && (
        <div className="fixed inset-0 z-[4000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4">
           <div className="w-full max-w-2xl glass p-10 rounded-[50px] border-white/10 space-y-8 shadow-3xl animate-in zoom-in-95 duration-300 text-center">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Receipt Verify</h2>
                 <button onClick={() => setReviewingReceipt(null)} className="p-3 bg-white/5 rounded-full hover:bg-red-500 transition-all shadow-lg"><X size={22}/></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/5 p-6 rounded-[30px] border border-white/5">
                    <span className="text-gray-500 text-[8px] font-black uppercase block mb-1.5 italic">Amount</span>
                    <span className="text-2xl font-black text-cyan-400 tracking-tighter">{reviewingReceipt.price?.toLocaleString('fa-IR')} <small className="text-[10px]">تومان</small></span>
                 </div>
                 <div className="bg-white/5 p-6 rounded-[30px] border border-white/5">
                    <span className="text-gray-500 text-[8px] font-black uppercase block mb-1.5 italic">Athlete</span>
                    <span className="text-sm font-black text-white italic truncate block">{reviewingReceipt.studentName}</span>
                 </div>
              </div>
              <div className="aspect-[4/3] bg-black/40 rounded-[40px] border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl group">
                  {reviewingReceipt.receiptUrl ? <img src={reviewingReceipt.receiptUrl} alt="Receipt" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" /> : <div className="text-gray-600 font-black italic uppercase text-xs">No File Uploaded</div>}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                 <button onClick={() => { if(confirm("فیش رد شود؟")) { setRequests(requests.map(req => req.id === reviewingReceipt.id ? { ...req, status: RequestStatus.APPROVED_WAITING_PAYMENT } : req)); setReviewingReceipt(null); }}} className="flex-1 py-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/10 font-black hover:bg-red-500 hover:text-white transition-all text-xs italic">REJECT</button>
                 <button onClick={() => handleConfirmReceipt(reviewingReceipt.id)} className="flex-[1.5] py-4 rounded-2xl bg-green-600 text-white font-black hover:bg-green-500 shadow-xl transition-all uppercase italic text-sm">APPROVE TRANSACTION</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TrainerDashboard;