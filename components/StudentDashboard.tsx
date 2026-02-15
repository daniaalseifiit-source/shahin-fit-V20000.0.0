import React, { useState, useEffect } from 'react';
import { PlanRequest, RequestStatus, Program, UserRole, ProgramDuration, SupplementaryInfo } from '../types';
import { 
  PlusCircle, CheckSquare, X, MessageSquare, Save, CreditCard, ArrowRight, Camera, Ruler, Calendar, Activity, Heart, PartyPopper, Wallet, ExternalLink, Play, AlertCircle, History, ChevronLeft, Trophy
} from 'lucide-react';
import Chat from './Chat';
import ProgressChart from './ProgressChart';

interface StudentDashboardProps {
  currentUserId: string;
  requests: PlanRequest[];
  setRequests: React.Dispatch<React.SetStateAction<PlanRequest[]>>;
  programs: Program[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ currentUserId, requests, setRequests, programs, activeTab, setActiveTab }) => {
  const latestRequest = requests.filter(r => r.studentId === currentUserId).pop();
  const activeProgram = programs.find(p => p.studentId === currentUserId);

  const [activeChatOpen, setActiveChatOpen] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showApprovedModal, setShowApprovedModal] = useState(false);
  const [showProgramReadyModal, setShowProgramReadyModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const [suppInfo, setSuppInfo] = useState<SupplementaryInfo>({
    age: 25,
    height: 180,
    weight: 75,
    bloodType: 'O+',
    trainingTimePref: 'عصر',
    goal: '',
    injuryHistory: '',
    supplementHistory: '',
    measurements: { arm: 0, chest: 0, waist: 0, hip: 0, thigh: 0 },
    photos: []
  });

  const [reqPlanType, setReqPlanType] = useState('رژیم غذایی + برنامه تمرینی');
  const [reqLevel, setReqLevel] = useState('پیشرفته');
  const [reqSessions, setReqSessions] = useState(3);
  const [reqDuration, setReqDuration] = useState(ProgramDuration.WEEKS_4);

  useEffect(() => {
    if (latestRequest?.status === RequestStatus.APPROVED_WAITING_PAYMENT) setShowPaymentModal(true);
    if (latestRequest?.status === RequestStatus.PAYMENT_APPROVED) setShowApprovedModal(true);
    if (latestRequest?.status === RequestStatus.PLAN_READY) setShowProgramReadyModal(true);
  }, [latestRequest?.status]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) return alert("حجم عکس نباید بیشتر از ۵۰۰ کیلوبایت باشد");
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhotos = [...(suppInfo.photos || [])];
        newPhotos[index] = reader.result as string;
        setSuppInfo({...suppInfo, photos: newPhotos});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalSubmitRequest = () => {
    const newReq: PlanRequest = {
      id: Math.random().toString(),
      studentId: currentUserId,
      studentName: 'ورزشکار شاهین فیت', 
      city: 'نامشخص',
      level: reqLevel,
      sessionsPerWeek: reqSessions,
      planType: reqPlanType,
      duration: reqDuration,
      status: RequestStatus.PENDING,
      createdAt: new Date().toISOString(),
      messages: [],
      progress: []
    };
    setRequests([...requests, newReq]);
    setActiveTab('dashboard');
  };

  const handleSubmitSupplementary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!latestRequest) return;
    setRequests(requests.map(r => r.id === latestRequest.id ? { ...r, status: RequestStatus.WAITING_FOR_PLAN, supplementaryInfo: suppInfo } : r));
    setActiveTab('dashboard');
  };

  const renderHome = () => (
    <div className="space-y-12 animate-in fade-in duration-1000 px-2 md:px-0 pb-20">
      {latestRequest?.status === RequestStatus.APPROVED_WAITING_PAYMENT && (
        <div className="glass p-6 rounded-3xl border-yellow-500/30 bg-yellow-500/5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl animate-pulse">
           <div className="flex items-center gap-3 text-yellow-400">
              <AlertCircle size={28} />
              <div className="text-right">
                 <div className="font-black text-sm md:text-lg">فاکتور صادر شد!</div>
                 <div className="text-[10px] md:text-xs font-bold opacity-70">لطفاً واریز را نهایی کنید تا فرآیند طراحی برنامه آغاز شود.</div>
              </div>
           </div>
           <button onClick={() => setShowPaymentModal(true)} className="w-full md:w-auto px-10 py-4 bg-yellow-500 text-black font-black rounded-xl hover:scale-105 transition-all text-xs shadow-xl">پرداخت و آپلود فیش</button>
        </div>
      )}

      <div className="glass p-10 md:p-16 rounded-[40px] md:rounded-[80px] border-white/10 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10 relative overflow-hidden shadow-3xl">
        <div className="relative z-10 text-center md:text-right">
          <h2 className="text-3xl md:text-6xl font-black mb-4 tracking-tighter italic text-white uppercase">SHAHIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">FIT</span></h2>
          <p className="text-gray-400 text-sm md:text-xl font-bold max-w-2xl leading-relaxed italic">تحول خود را از همین امروز آغاز کن. پلتفرم هوشمند مدیریت فیتنس و تغذیه.</p>
          {(!latestRequest || latestRequest.status === RequestStatus.PLAN_READY) && (
            <button onClick={() => setActiveTab('new_request')} className="mt-10 px-12 py-5 bg-cyan-600 rounded-[30px] font-black text-lg hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-4 mx-auto md:mx-0">درخواست برنامه جدید <PlusCircle size={22} /></button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
         <div className="lg:col-span-2 glass p-10 rounded-[50px] border-white/10 space-y-8 shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
               <h3 className="text-xl md:text-2xl font-black text-white italic tracking-widest uppercase">Weight Tracking</h3>
               <div className="flex gap-2">
                  <input type="number" placeholder="وزن (kg)" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-cyan-400 font-bold" />
                  <button onClick={() => { if(!latestRequest || !newWeight) return; setRequests(requests.map(r => r.id === latestRequest.id ? {...r, progress: [...(r.progress || []), { date: new Date().toLocaleDateString('fa-IR'), weight: parseFloat(newWeight) }]} : r)); setNewWeight(''); }} className="bg-cyan-600 p-3 rounded-xl text-white hover:scale-110 transition-all shadow-lg"><Save size={18} /></button>
               </div>
            </div>
            <div className="h-48 md:h-64">
              <ProgressChart data={latestRequest?.progress || []} label="Evolution Chart" />
            </div>
         </div>
         <div className="glass p-10 rounded-[50px] border-indigo-500/20 bg-indigo-500/5 flex flex-col justify-center space-y-8 shadow-2xl text-center">
            <div className="w-20 h-20 rounded-[30px] bg-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto shadow-xl"><Activity size={32} /></div>
            <div>
              <h4 className="text-xl font-black text-white mb-2 italic uppercase">System Status</h4>
              <p className="text-indigo-400 font-bold text-xs px-4">
                {!latestRequest ? 'آماده برای ثبت اولین درخواست' : 
                 latestRequest.status === RequestStatus.PENDING ? 'در انتظار بررسی اولیه مربی' :
                 latestRequest.status === RequestStatus.APPROVED_WAITING_PAYMENT ? 'فاکتور صادر شده، منتظر واریز' :
                 latestRequest.status === RequestStatus.PAYMENT_UPLOADED ? 'فیش در مرحله بازبینی مالی' :
                 latestRequest.status === RequestStatus.PAYMENT_APPROVED ? 'واریز تایید شد، فرم بیومتریک را پر کنید' :
                 latestRequest.status === RequestStatus.WAITING_FOR_PLAN ? 'مربی در حال نگارش برنامه شخصی شما' :
                 'برنامه نهایی صادر و آماده اجراست'}
              </p>
            </div>
            {latestRequest?.status === RequestStatus.APPROVED_WAITING_PAYMENT && (
              <button onClick={() => setShowPaymentModal(true)} className="w-full py-5 rounded-2xl bg-green-600 text-white font-black hover:bg-green-500 transition-all text-sm shadow-3xl animate-bounce flex items-center justify-center gap-3"><Wallet size={20}/> پرداخت فاکتور دوره</button>
            )}
            {latestRequest?.status === RequestStatus.PAYMENT_APPROVED && (
              <button onClick={() => setActiveTab('supplementary')} className="w-full py-5 rounded-2xl bg-cyan-600 text-white font-black hover:bg-cyan-500 transition-all text-sm shadow-3xl flex items-center justify-center gap-3"><Ruler size={20}/> تکمیل فرم سایزگیری</button>
            )}
            {latestRequest?.status === RequestStatus.PLAN_READY && (
              <button onClick={() => setActiveTab('active_plan')} className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-500 transition-all text-sm shadow-3xl flex items-center justify-center gap-3"><CheckSquare size={20}/> مشاهده برنامه فعال</button>
            )}
         </div>
      </div>
    </div>
  );

  const renderNewRequest = () => (
    <div className="max-w-5xl mx-auto animate-in zoom-in-95 duration-500 px-2 pb-20">
      <div className="glass p-12 md:p-20 rounded-[60px] md:rounded-[100px] border-white/10 space-y-12 shadow-3xl">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase leading-none">New Request</h2>
          <p className="text-gray-500 text-sm font-bold italic">لطفاً نوع پکیج و سطح خود را مشخص کنید</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-4">انتخاب پکیج</label>
            <div className="grid gap-4">
              {['رژیم غذایی + برنامه تمرینی', 'رژیم غذایی', 'برنامه تمرینی'].map(item => (
                <button key={item} onClick={() => setReqPlanType(item)} className={`p-6 rounded-3xl border transition-all text-right flex items-center gap-5 group ${reqPlanType === item ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/5 border-white/5'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${reqPlanType === item ? 'bg-cyan-500 text-white' : 'bg-white/5 text-gray-700'}`}><Activity size={20} /></div>
                  <div className={`font-black text-lg ${reqPlanType === item ? 'text-white' : 'text-gray-500'}`}>{item}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-600 uppercase px-4">سطح آمادگی</label>
              <select value={reqLevel} onChange={(e) => setReqLevel(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 outline-none focus:border-cyan-400 font-black text-sm appearance-none">
                <option value="بدون سابقه تمرین" className="bg-[#0a0a0c]">بدون سابقه قبلی</option>
                <option value="اماتور(زیر ۱ سال سابقه تمرین)" className="bg-[#0a0a0c]">اماتور (زیر ۱ سال)</option>
                <option value="پیشرفته" className="bg-[#0a0a0c]">پیشرفته (بالای ۱ سال)</option>
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-600 uppercase px-4">مدت دوره</label>
              <div className="flex gap-4">
                {[ProgramDuration.WEEKS_4, ProgramDuration.WEEKS_12].map(d => (
                  <button key={d} onClick={() => setReqDuration(d)} className={`flex-1 py-5 rounded-2xl font-black text-sm transition-all border ${reqDuration === d ? 'bg-indigo-600 border-indigo-500 shadow-xl' : 'bg-white/5 border-white/5 text-gray-500'}`}>{d}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <button onClick={handleFinalSubmitRequest} className="w-full py-8 bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-[35px] font-black text-2xl hover:scale-[1.02] transition-all shadow-3xl flex items-center justify-center gap-4">ارسال درخواست برای مربی <ArrowRight /></button>
      </div>
    </div>
  );

  const renderSupplementary = () => (
    <form onSubmit={handleSubmitSupplementary} className="max-w-6xl mx-auto space-y-10 animate-in slide-in-from-left-10 duration-700 px-2 pb-40">
       <div className="glass p-12 md:p-20 rounded-[60px] md:rounded-[80px] border-white/10 space-y-12 shadow-3xl">
          <div className="text-center">
             <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase leading-none">Biometric Profile</h2>
             <p className="text-gray-500 font-bold mt-3 italic text-sm">اطلاعات دقیق برای طراحی برنامه شخصی‌سازی شده</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="space-y-2"><label className="text-[10px] font-black text-gray-500 px-4">سن</label><input type="number" required value={suppInfo.age} onChange={(e) => setSuppInfo({...suppInfo, age: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 outline-none focus:border-cyan-400 font-bold" /></div>
             <div className="space-y-2"><label className="text-[10px] font-black text-gray-500 px-4">قد (cm)</label><input type="number" required value={suppInfo.height} onChange={(e) => setSuppInfo({...suppInfo, height: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 outline-none focus:border-cyan-400 font-bold" /></div>
             <div className="space-y-2"><label className="text-[10px] font-black text-gray-500 px-4">وزن (kg)</label><input type="number" required value={suppInfo.weight} onChange={(e) => setSuppInfo({...suppInfo, weight: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 outline-none focus:border-cyan-400 font-bold" /></div>
             <div className="space-y-2"><label className="text-[10px] font-black text-gray-500 px-4">گروه خونی</label><select value={suppInfo.bloodType} onChange={(e) => setSuppInfo({...suppInfo, bloodType: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 outline-none font-bold appearance-none"><option className="bg-[#0a0a0c]">A+</option><option className="bg-[#0a0a0c]">B+</option><option className="bg-[#0a0a0c]">O+</option><option className="bg-[#0a0a0c]">AB+</option></select></div>
          </div>

          <div className="space-y-6">
            <h4 className="text-cyan-400 font-black text-xs uppercase tracking-widest px-4 italic flex items-center gap-2"><Ruler size={16}/> سایزگیری (سانتی‌متر)</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'بازو', key: 'arm' },
                { label: 'سینه', key: 'chest' },
                { label: 'شکم', key: 'waist' },
                { label: 'باسن', key: 'hip' },
                { label: 'ران', key: 'thigh' }
              ].map(m => (
                <div key={m.key} className="space-y-2">
                  <label className="text-[9px] font-bold text-gray-600 px-2 uppercase">{m.label}</label>
                  <input type="number" placeholder="0" className="w-full bg-white/5 border border-white/5 rounded-xl p-4 outline-none focus:border-indigo-400 text-center font-bold" onChange={(e) => {
                    setSuppInfo({...suppInfo, measurements: {...(suppInfo.measurements as any), [m.key]: parseInt(e.target.value)}});
                  }} />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-cyan-400 font-black text-xs uppercase tracking-widest px-4 italic flex items-center gap-2"><Camera size={16}/> آپلود تصاویر بدنی (۳ زاویه)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { label: 'روبه‌رو (Front)', id: 0 },
                 { label: 'پشت (Back)', id: 1 },
                 { label: 'پهلو (Side)', id: 2 }
               ].map(item => (
                 <label key={item.id} className="aspect-[3/4] glass rounded-[30px] border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all overflow-hidden relative group">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoChange(e, item.id)} />
                    {suppInfo.photos?.[item.id] ? (
                      <img src={suppInfo.photos[item.id]} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center space-y-2 opacity-30 group-hover:opacity-100 transition-opacity">
                        <Camera size={40} className="mx-auto" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
                        <div className="text-[8px] opacity-50">MAX 500KB</div>
                      </div>
                    )}
                 </label>
               ))}
            </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-black text-gray-500 px-4">هدف شما از تمرین و سوابق پزشکی</label>
             <textarea required value={suppInfo.goal} onChange={(e) => setSuppInfo({...suppInfo, goal: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-[30px] p-8 outline-none focus:border-cyan-400 font-bold min-h-[150px] text-sm leading-relaxed" placeholder="لطفاً اهداف و هرگونه سابقه آسیب‌دیدگی را اینجا بنویسید..." />
          </div>

          <button type="submit" className="w-full py-8 bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-[40px] font-black text-2xl hover:scale-[1.01] transition-all shadow-3xl italic tracking-tighter uppercase">Submit Physical Profile</button>
       </div>
    </form>
  );

  const renderActivePlan = () => {
    if (!activeProgram) return <div className="py-20 md:py-40 text-center font-black text-gray-800 text-2xl md:text-4xl italic opacity-20 uppercase tracking-tighter">No Active Program Found</div>;
    return (
      <div className="space-y-12 animate-in slide-in-from-bottom-10 duration-1000 px-2 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-6">
          <h2 className="text-4xl md:text-6xl font-black italic text-white tracking-tighter uppercase">Active Plan</h2>
          <button onClick={() => window.print()} className="w-full md:w-auto px-10 py-5 rounded-[25px] bg-white/5 border border-white/10 text-xs font-black flex items-center justify-center gap-4 hover:bg-white/10 transition-all uppercase"><ExternalLink size={18} className="text-cyan-400" /> Export PDF</button>
        </div>
        {activeProgram.trainingDays.map(day => (
           <div key={day.id} className="space-y-8">
              <h3 className="text-6xl md:text-8xl font-black italic text-white opacity-5 uppercase tracking-tighter text-center md:text-right leading-none">Day {day.dayNumber}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h4 className="text-xl font-black text-cyan-400 px-6 italic uppercase tracking-widest">Training</h4>
                  {day.sections.map((section, idx) => (
                    <div key={idx} className="glass p-8 md:p-12 rounded-[50px] border-white/10 shadow-3xl space-y-8">
                        <h4 className="text-2xl font-black text-indigo-400 border-r-4 border-indigo-500 pr-6 uppercase italic tracking-tighter">{section.type}</h4>
                        <div className="space-y-4">
                          {section.rows.map(row => (
                            <div key={row.id} className="flex flex-col md:flex-row justify-between md:items-center p-6 bg-white/5 rounded-[30px] border border-white/5 gap-6 group hover:border-cyan-500/20 transition-all">
                                <div className="flex items-center gap-6">
                                  <button onClick={() => setVideoUrl('https://shahinfit.com/workout-sample.mp4')} className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shadow-inner group-hover:scale-110 transition-transform border border-cyan-500/20"><Play size={20} fill="currentColor" /></button>
                                  <div>
                                      <div className="font-black text-xl text-white group-hover:text-cyan-400 transition-colors">{row.movement}</div>
                                      <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{row.system} • {row.rest}</div>
                                  </div>
                                </div>
                                <div className="text-center md:text-left"><div className="text-3xl font-black text-indigo-400 tracking-tighter">{row.sets} × {row.reps}</div></div>
                            </div>
                          ))}
                        </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-6">
                  <h4 className="text-xl font-black text-green-400 px-6 italic uppercase tracking-widest">Nutrition</h4>
                  <div className="glass p-8 md:p-12 rounded-[50px] border-white/10 shadow-3xl space-y-8">
                      {day.dietMeals?.map((meal, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-4 md:gap-10 items-start border-b border-white/5 pb-8 last:border-0 last:pb-0">
                           <div className="w-full md:w-36 text-green-400 font-black italic text-lg uppercase tracking-tighter">{meal.time}</div>
                           <div className="flex-1 text-gray-300 text-sm font-bold leading-relaxed">{meal.foods}</div>
                        </div>
                      ))}
                      {(!day.dietMeals || day.dietMeals.length === 0) && <div className="py-10 text-center text-gray-600 italic text-xs uppercase tracking-widest">No Diet Assigned</div>}
                  </div>
                </div>
              </div>
           </div>
        ))}
      </div>
    );
  };

  const renderHistory = () => (
    <div className="max-w-5xl mx-auto space-y-12 animate-in slide-in-from-top-10 duration-700 px-2 pb-20">
        <h2 className="text-4xl md:text-6xl font-black italic text-white tracking-tighter uppercase">Program Archive</h2>
        <div className="grid gap-6">
            {programs.filter(p => p.studentId === currentUserId).map(p => (
                <div key={p.id} className="glass p-10 rounded-[50px] border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-indigo-500/20 transition-all shadow-3xl">
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 rounded-[35px] bg-white/5 flex items-center justify-center text-gray-600 shadow-inner group-hover:text-indigo-400 transition-colors"><History size={32}/></div>
                        <div>
                            <div className="text-2xl font-black text-white">برنامه شخصی سازی شده</div>
                            <div className="text-[10px] text-gray-500 font-black uppercase mt-1 tracking-widest italic">{p.startDate} - {p.endDate}</div>
                        </div>
                    </div>
                    <button onClick={() => setActiveTab('active_plan')} className="px-12 py-5 bg-white/5 rounded-[30px] font-black text-sm hover:bg-indigo-600 transition-all border border-white/5 flex items-center gap-3">مشاهده جزئیات <ChevronLeft size={20}/></button>
                </div>
            ))}
            {programs.filter(p => p.studentId === currentUserId).length === 0 && (
                <div className="py-20 text-center text-gray-800 text-2xl font-black italic uppercase opacity-20 border-4 border-dashed border-white/5 rounded-[60px]">Archive Is Empty</div>
            )}
        </div>
    </div>
  );

  return (
    <div className="pb-40 md:pb-60">
      {activeTab === 'dashboard' && renderHome()}
      {activeTab === 'new_request' && renderNewRequest()}
      {activeTab === 'supplementary' && renderSupplementary()}
      {activeTab === 'active_plan' && renderActivePlan()}
      {activeTab === 'history' && renderHistory()}
      
      {videoUrl && (
          <div className="fixed inset-0 z-[4000] bg-black/98 flex items-center justify-center p-4 md:p-20">
              <div className="w-full max-w-5xl glass rounded-[60px] border-white/10 p-4 md:p-10 relative shadow-3xl animate-in zoom-in-95">
                  <button onClick={() => setVideoUrl(null)} className="absolute -top-6 -left-6 w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center shadow-3xl hover:scale-110 transition-all z-10"><X size={32}/></button>
                  <div className="aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl border-4 border-white/5">
                      <video className="w-full h-full object-cover" controls autoPlay>
                          <source src={videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                      </video>
                  </div>
                  <div className="mt-8 text-center">
                      <h4 className="text-2xl font-black italic uppercase tracking-tighter">Exercise Technique Guide</h4>
                      <p className="text-gray-500 font-bold text-xs mt-2 italic">Follow the coach's movement patterns for best results.</p>
                  </div>
              </div>
          </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-[3000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
           <div className="w-full max-w-2xl glass p-8 md:p-12 rounded-[50px] border-white/10 space-y-10 shadow-3xl animate-in zoom-in-95 relative">
              <div className="flex justify-between items-start">
                 <div>
                    <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase leading-none">Payment</h2>
                    <p className="text-gray-500 text-[11px] font-bold mt-2 uppercase tracking-widest">Plan: {latestRequest?.planType}</p>
                 </div>
                 <button onClick={() => setShowPaymentModal(false)} className="p-4 bg-white/5 rounded-full hover:bg-red-500 transition-all shadow-xl"><X size={20}/></button>
              </div>
              <div className="bg-white/5 p-10 rounded-[40px] space-y-6 text-center border border-white/5">
                 <div className="flex flex-col items-center gap-2">
                    <span className="text-gray-500 font-black text-[10px] uppercase tracking-widest">مبلغ نهایی</span>
                    <span className="text-4xl md:text-5xl font-black text-cyan-400 tracking-tighter">{latestRequest?.price?.toLocaleString('fa-IR')} <small className="text-xs">تومان</small></span>
                 </div>
                 <div className="space-y-4 pt-6 border-t border-white/5">
                    <div className="flex justify-between items-center px-6">
                       <span className="text-gray-500 font-black text-[9px] uppercase tracking-widest">صاحب حساب</span>
                       <span className="text-white font-black text-xs uppercase">{latestRequest?.accountName || 'SHAHIN FIT'}</span>
                    </div>
                    <div className="bg-black/40 p-6 rounded-2xl text-center text-lg md:text-3xl font-black text-white tracking-[0.2em] border border-white/5">
                       {latestRequest?.cardNumber?.match(/.{1,4}/g)?.join(' - ') || '----'}
                    </div>
                 </div>
              </div>
              <label className="block p-12 rounded-[40px] border-2 border-dashed border-white/10 hover:border-cyan-500/50 transition-all cursor-pointer text-center group bg-white/5 shadow-inner">
                 <input type="file" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 500 * 1024) return alert("حجم عکس نباید بیشتر از ۵۰۰ کیلوبایت باشد");
                      const reader = new FileReader();
                      reader.onloadend = () => setReceiptPreview(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                 }} />
                 {receiptPreview ? (
                   <img src={receiptPreview} alt="Receipt" className="max-h-48 mx-auto rounded-2xl" />
                 ) : (
                   <div className="space-y-4">
                      <Camera size={48} className="text-gray-700 mx-auto group-hover:text-cyan-400 transition-colors" />
                      <div className="text-gray-500 font-bold text-xs uppercase tracking-widest">بارگذاری فیش (Max 500KB)</div>
                   </div>
                 )}
              </label>
              <button onClick={() => { if(!receiptPreview) return; setRequests(requests.map(r => r.id === latestRequest?.id ? { ...r, status: RequestStatus.PAYMENT_UPLOADED, receiptUrl: receiptPreview } : r)); setShowPaymentModal(false); setReceiptPreview(null); }} disabled={!receiptPreview} className="w-full py-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-[30px] font-black text-xl shadow-3xl disabled:opacity-20 uppercase tracking-tighter italic">تایید و ارسال فیش واریزی</button>
           </div>
        </div>
      )}

      {showApprovedModal && (
        <div className="fixed inset-0 z-[3500] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4">
           <div className="w-full max-w-xl glass p-16 rounded-[60px] text-center space-y-10 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 rounded-[40px] bg-green-500/20 flex items-center justify-center text-green-400 mx-auto animate-bounce shadow-2xl"><PartyPopper size={48} /></div>
              <div className="space-y-4">
                 <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">Congratulations!</h2>
                 <p className="text-gray-400 font-bold text-sm leading-relaxed px-6 italic">واریز شما با موفقیت تایید شد. اکنون اطلاعات بیومتریک خود را تکمیل کنید تا مربی بتواند برنامه شما را با دقت بالا طراحی کند.</p>
              </div>
              <button onClick={() => { setShowApprovedModal(false); setActiveTab('supplementary'); }} className="w-full py-6 bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-[30px] font-black text-xl shadow-3xl flex items-center justify-center gap-4 uppercase tracking-tighter italic">شروع سایزگیری <ArrowRight size={24} /></button>
           </div>
        </div>
      )}

      {showProgramReadyModal && (
        <div className="fixed inset-0 z-[5000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4">
           <div className="w-full max-w-xl glass p-12 md:p-16 rounded-[60px] text-center space-y-10 animate-in zoom-in-95 duration-700 shadow-3xl relative overflow-hidden border-cyan-500/30">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500"></div>
              <div className="w-28 h-28 rounded-[45px] bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 flex items-center justify-center text-cyan-400 mx-auto shadow-2xl border border-cyan-500/20">
                 <Trophy size={56} className="animate-bounce" />
              </div>
              <div className="space-y-4">
                 <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter">New Program!</h2>
                 <p className="text-gray-300 font-black text-lg md:text-xl leading-relaxed italic">برنامه شما ثبت شد. موفق باشید!</p>
                 <p className="text-cyan-400/70 font-bold text-sm uppercase tracking-widest">Let's reach your goals together!</p>
              </div>
              <div className="flex flex-col gap-4">
                <button onClick={() => { setShowProgramReadyModal(false); setActiveTab('active_plan'); }} className="w-full py-6 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-[35px] font-black text-xl shadow-3xl hover:scale-105 transition-all uppercase tracking-tighter italic">ورود و مشاهده برنامه</button>
                <button onClick={() => setShowProgramReadyModal(false)} className="text-gray-500 font-black text-[10px] uppercase hover:text-white transition-all">بعداً می‌بینم</button>
              </div>
           </div>
        </div>
      )}

      <button onClick={() => setActiveChatOpen(true)} className="fixed bottom-10 left-10 w-20 h-20 bg-indigo-600 text-white rounded-[30px] flex items-center justify-center shadow-3xl hover:scale-110 transition-all z-[2200] border border-white/10 group"><MessageSquare size={32} className="group-hover:rotate-12 transition-transform" /></button>
      
      {activeChatOpen && (
        <div className="fixed inset-0 z-[2800] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
           <div className="w-full max-w-xl animate-in zoom-in duration-300">
             <div className="flex justify-end mb-6">
                <button onClick={() => setActiveChatOpen(false)} className="p-4 bg-white/10 rounded-full hover:bg-red-500 transition-all shadow-xl"><X size={24} /></button>
             </div>
             <Chat messages={latestRequest?.messages || []} onSendMessage={(text) => { if(!latestRequest) return; const msg = { id: Math.random().toString(), senderId: currentUserId, text, timestamp: new Date().toISOString(), isRead: false }; setRequests(requests.map(r => r.id === latestRequest.id ? { ...r, messages: [...(r.messages || []), msg]} : r)); }} currentUserRole={UserRole.STUDENT} recipientName="Coach Admin" />
           </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;