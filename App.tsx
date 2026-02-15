import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, PlanRequest, Program, Exercise } from './types';
import Sidebar from './components/Sidebar';
import TrainerDashboard from './components/TrainerDashboard';
import StudentDashboard from './components/StudentDashboard';
import { Loader2, CloudUpload, Lock, WifiOff } from 'lucide-react';
import { EXERCISES_DB } from './constants';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [requests, setRequests] = useState<PlanRequest[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>(EXERCISES_DB);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setAuthError(false);
    setConnectionError(false);
    try {
      // استفاده از credentials: 'include' برای ارسال کوکی‌های وردپرس
      const response = await fetch('/wp-json/shahin-fit/v1/data', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.requests) setRequests(data.requests);
        if (data.programs) setPrograms(data.programs);
        if (data.exercises && data.exercises.length > 0) setExercises(data.exercises);
        if (data.currentUser) setCurrentUserId(data.currentUser.id);
        
        if (data.role) {
          setRole(data.role as UserRole);
        } else {
          setRole(UserRole.STUDENT);
        }
      } else if (response.status === 401 || response.status === 403) {
        setAuthError(true);
      } else {
        console.error("Server error:", response.status);
        // Fallback for demo/dev mode if API is missing (e.g. 404)
        // Note: In production, you might want to show an error instead.
        // For now, let's assume if 404 (API not found), we might default to Student for UI testing
        // OR show connection error. Let's show connection error to be safe.
        setConnectionError(true);
      }
    } catch (error) {
      console.error("Connection error:", error);
      setConnectionError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveToServer = useCallback(async (updatedRequests: PlanRequest[], updatedPrograms: Program[]) => {
    if (role !== UserRole.TRAINER) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/wp-json/shahin-fit/v1/data', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include', // ارسال کوکی برای متد POST الزامی است
        body: JSON.stringify({
          requests: updatedRequests,
          programs: updatedPrograms,
          exercises: exercises
        })
      });
      if (!response.ok) throw new Error("Save failed");
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setTimeout(() => setIsSaving(false), 800);
    }
  }, [role, exercises]);

  useEffect(() => {
    if (!isLoading && !authError && !connectionError && role === UserRole.TRAINER) {
      const timer = setTimeout(() => {
        saveToServer(requests, programs);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [requests, programs, role, isLoading, authError, connectionError, saveToServer]);

  // نمایش رابط کاربری برای حالتی که کاربر لاگین نیست
  if (authError) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
          <Lock size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2 italic">احراز هویت ناموفق</h2>
        <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
          برای دسترسی به اپلیکیشن شاهین فیت، ابتدا باید وارد حساب کاربری خود در وردپرس شوید.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.href = '/wp-login.php'}
            className="px-10 py-4 bg-cyan-600 text-white font-black rounded-2xl shadow-2xl hover:scale-105 transition-all"
          >
            ورود به وردپرس
          </button>
          <button 
            onClick={() => fetchData()}
            className="px-10 py-4 bg-white/5 text-gray-400 font-black rounded-2xl hover:text-white transition-all"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // نمایش خطا در اتصال به سرور
  if (connectionError) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-yellow-500/10 flex items-center justify-center mb-6 border border-yellow-500/20">
          <WifiOff size={40} className="text-yellow-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2 italic">خطا در دریافت اطلاعات</h2>
        <p className="text-gray-500 max-w-sm mb-8 leading-relaxed text-sm">
          ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کنید یا مطمئن شوید پلاگین شاهین فیت در وردپرس فعال است.
        </p>
        <button 
          onClick={() => fetchData()}
          className="px-10 py-4 bg-cyan-600 text-white font-black rounded-2xl shadow-2xl hover:scale-105 transition-all"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (isLoading || role === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 rounded-[30px] bg-cyan-500/10 flex items-center justify-center animate-pulse">
           <Loader2 size={40} className="text-cyan-400 animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-gray-500 font-black tracking-widest uppercase text-[10px] animate-bounce">
            SHAHIN FIT OS
          </p>
          <p className="text-gray-700 text-[8px] font-bold uppercase">
            Initialising Secure Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0c] text-white" dir="rtl">
      <Sidebar role={role} activeTab={activeTab} setActiveTab={setActiveTab} requests={requests} />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/40 shadow-lg shadow-cyan-500/5">
              <span className="text-cyan-400 font-bold text-xl italic">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight italic">SHAHIN FIT <span className="text-cyan-500 not-italic">●</span></h1>
              <div className="flex items-center gap-2 mt-0.5">
                {isSaving ? (
                  <span className="flex items-center gap-1 text-[8px] text-yellow-500 font-black uppercase"><CloudUpload size={10} /> Syncing Data...</span>
                ) : (
                  <span className="text-[8px] text-green-500/50 font-black uppercase italic tracking-widest">System Online</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 glass px-4 py-2.5 rounded-2xl border-white/5 items-center">
            <span className={`px-4 py-1 rounded-lg font-black text-[9px] uppercase italic tracking-wider ${
              role === UserRole.TRAINER ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
            }`}>
              {role === UserRole.TRAINER ? 'Access: Trainer' : 'Access: Athlete'}
            </span>
          </div>
        </div>

        {role === UserRole.TRAINER ? (
          <TrainerDashboard 
            currentUserId={currentUserId || 'ADMIN'}
            requests={requests} 
            setRequests={setRequests} 
            programs={programs}
            setPrograms={setPrograms}
            exercises={exercises}
            setExercises={setExercises}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        ) : (
          <StudentDashboard 
            currentUserId={currentUserId || 'S1'}
            requests={requests} 
            setRequests={setRequests} 
            programs={programs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </main>
    </div>
  );
};

export default App;