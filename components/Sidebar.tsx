
import React from 'react';
import { UserRole, PlanRequest, RequestStatus } from '../types';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Users, 
  Bell, 
  CreditCard,
  Settings,
  LogOut,
  Dumbbell,
  CheckSquare,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  requests: PlanRequest[];
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab, requests }) => {
  const pendingRequestsCount = requests.filter(r => r.status === RequestStatus.PENDING || r.status === RequestStatus.PAYMENT_UPLOADED).length;

  const navItems = role === UserRole.TRAINER ? [
    { id: 'dashboard', label: 'پیشخوان مربی', icon: LayoutDashboard },
    { id: 'requests', label: 'درخواست‌های جدید', icon: Bell, badge: pendingRequestsCount },
    { id: 'students', label: 'مدیریت شاگردان', icon: Users },
    { id: 'templates', label: 'بانک الگوها', icon: BookOpen },
    { id: 'exercises', label: 'بانک حرکات', icon: Dumbbell },
    { id: 'settings', label: 'تنظیمات پنل', icon: Settings },
  ] : [
    { id: 'dashboard', label: 'داشبورد من', icon: LayoutDashboard },
    { id: 'active_plan', label: 'برنامه جاری', icon: CheckSquare },
    { id: 'history', label: 'آرشیو دوره‌ها', icon: History },
    { id: 'new_request', label: 'تمدید دوره', icon: PlusCircle },
    { id: 'payment', label: 'امور مالی', icon: CreditCard },
  ];

  return (
    <aside className="hidden lg:flex w-80 flex-col bg-[#0f0f13] border-l border-white/5 p-8 h-screen sticky top-0">
      <div className="flex flex-col h-full">
        <div className="mb-14 px-2">
          <div className="text-3xl font-black text-cyan-400 tracking-tighter italic">SHAHIN FIT</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-2 font-black opacity-50">Intelligent Ecosystem</div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all group ${
                activeTab === item.id 
                  ? (role === UserRole.TRAINER ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-2xl shadow-cyan-500/10' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10')
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={20} className={activeTab === item.id ? '' : 'text-gray-600 group-hover:text-gray-400'} />
                <span className="font-black text-sm">{item.label}</span>
              </div>
              {item.badge && item.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg ring-4 ring-[#0f0f13]">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-6">
          <div className="glass p-5 rounded-[30px] border-white/10 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-black text-xl italic shadow-lg">
                {role === UserRole.TRAINER ? 'T' : 'S'}
              </div>
              <div>
                <div className="text-sm font-black text-white">پروفایل کاربری</div>
                <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">Status: Online</div>
              </div>
            </div>
          </div>
          <button className="w-full flex items-center gap-4 p-4 text-red-500/50 hover:text-red-500 transition-colors font-black text-sm">
            <LogOut size={20} />
            <span>خروج از حساب</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
