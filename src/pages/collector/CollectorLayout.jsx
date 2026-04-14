import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, History, Truck } from 'lucide-react';
import { getUser } from '../../lib/auth';

export default function CollectorLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const usr = getUser();
    if (!usr) {
      navigate('/login?returnTo=/collector');
      return;
    }
    // "Collector" or "2"
    if (usr.role !== 'Collector' && usr.role !== '2') {
      navigate('/');
      return;
    }
    setUser(usr);
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-73px)] overflow-hidden bg-surface-container-low">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-container-lowest border-r border-surface-container-highest flex flex-col eco-glass z-10 transition-all">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="w-6 h-6 text-primary" />
            <h2 className="font-extrabold tracking-tight text-lg text-on-surface">Cổng nhân viên</h2>
          </div>
          <p className="text-[10px] text-on-surface-variant/70 font-black tracking-widest uppercase">Khu vực thu gom</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <NavLink
            to="/collector"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            Tổng quan
          </NavLink>

          <NavLink
            to="/collector/tasks"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]'
              }`
            }
          >
            <Briefcase className="w-5 h-5" />
            Quản lí công việc
          </NavLink>

          <NavLink
            to="/collector/history"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]'
              }`
            }
          >
            <History className="w-5 h-5" />
            Lịch sử công việc
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-surface relative">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}></div>
        <div className="p-8 md:p-12 relative z-10 w-full">
          {/* Header Dashboard Placeholder */}
          <header className="mb-10">
            <h1 className="text-3xl font-serif italic text-on-surface mb-2">
              Xin chào, <span className="not-italic font-black text-primary">{user.displayName || 'Nhân viên'}</span>
            </h1>
            <p className="text-on-surface-variant font-medium">Bắt đầu ngày làm việc của bạn ngay hôm nay.</p>
          </header>
          
          <Outlet />
        </div>
      </main>
    </div>
  );
}
