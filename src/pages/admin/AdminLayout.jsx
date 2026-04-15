import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  MessageSquare, 
  Ticket, 
  ShieldCheck, 
  Star,
  Menu,
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getUser } from '../../lib/auth';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const usr = getUser();
    if (!usr) {
      navigate('/login?returnTo=/admin');
      return;
    }
    // "Administrator" or "3"
    if (usr.role !== 'Administrator' && usr.role !== '3') {
      navigate('/');
      return;
    }
    setUser(usr);
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-73px)] overflow-hidden bg-surface-container-low relative">
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-primary text-white p-4 rounded-2xl shadow-2xl shadow-primary/40 active:scale-95 transition-all"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative top-0 bottom-0 left-0 w-72 lg:w-64 bg-surface-container-lowest border-r border-surface-container-highest 
        flex flex-col eco-glass z-50 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h2 className="font-extrabold tracking-tight text-lg text-on-surface">Admin Console</h2>
            </div>
            <p className="text-[10px] text-on-surface-variant/70 font-black tracking-widest uppercase">Quản trị hệ thống</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-surface-container-high rounded-full transition-colors">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto no-scrollbar">
          <NavLink
            to="/admin"
            end
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-sm">Tổng quan</span>
          </NavLink>

          <NavLink
            to="/admin/accounts"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]'
              }`
            }
          >
            <Users className="w-5 h-5" />
            <span className="text-sm">Quản lí Account</span>
          </NavLink>

          <NavLink
            to="/admin/feedback"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]'
              }`
            }
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm">Quản lí Feedback</span>
          </NavLink>

          <div className="pt-6 pb-2 px-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">Mở rộng</p>
          </div>

          <NavLink
            to="/admin/rewards"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]'
              }`
            }
          >
            <Star className="w-5 h-5" />
            <span className="text-sm">Quản lí điểm thưởng</span>
          </NavLink>

          <NavLink
            to="/admin/vouchers"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]'
              }`
            }
          >
            <Ticket className="w-5 h-5" />
            <span className="text-sm">Quản lí Voucher</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-surface relative">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}></div>

        {/* Content Container */}
        <div className="p-4 md:p-8 lg:p-12 relative z-10 w-full min-h-full">
          <header className="mb-6 md:mb-10">
            <h1 className="text-2xl md:text-3xl font-serif italic text-on-surface mb-1 md:mb-2">
              Chào ngày mới, <span className="not-italic font-black text-primary">{user.displayName || 'Admin'}</span>
            </h1>
            <p className="text-sm md:text-base text-on-surface-variant font-medium opacity-70">Bảng điều khiển quản trị tối cao của EcoSort.</p>
          </header>
          
          <Outlet />
        </div>
      </main>
    </div>
  );
}
