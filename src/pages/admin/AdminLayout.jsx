import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, MessageSquare, Gift, ShieldCheck } from 'lucide-react';
import { getUser } from '../../lib/auth';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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
    <div className="flex h-[calc(100vh-73px)] overflow-hidden bg-surface-container-low">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-container-lowest border-r border-surface-container-highest flex flex-col eco-glass z-10 transition-all">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <h2 className="font-extrabold tracking-tight text-lg text-on-surface">Admin Console</h2>
          </div>
          <p className="text-[10px] text-on-surface-variant/70 font-black tracking-widest uppercase">Quản trị hệ thống</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <NavLink
            to="/admin"
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
            to="/admin/system"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            Quản lí hệ thống
          </NavLink>

          <NavLink
            to="/admin/accounts"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]'
              }`
            }
          >
            <Users className="w-5 h-5" />
            Quản lí Account
          </NavLink>

          <NavLink
            to="/admin/feedback"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]'
              }`
            }
          >
            <MessageSquare className="w-5 h-5" />
            Quản lí Feedback
          </NavLink>

          <div className="pt-6 pb-2 px-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">Mở rộng</p>
          </div>

          <NavLink
            to="/admin/rewards"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]'
              }`
            }
          >
            <Gift className="w-5 h-5" />
            Quản lí điểm thưởng
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
          <header className="mb-10">
            <h1 className="text-3xl font-serif italic text-on-surface mb-2">
              Chào ngày mới, <span className="not-italic font-black text-primary">{user.displayName || 'Admin'}</span>
            </h1>
            <p className="text-on-surface-variant font-medium">Bảng điều khiển quản trị tối cao của EcoSort.</p>
          </header>
          
          <Outlet />
        </div>
      </main>
    </div>
  );
}
