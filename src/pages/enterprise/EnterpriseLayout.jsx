import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Scale, ListTodo, Building2, Gift, Briefcase, Users, Settings, MessageSquare, Ticket } from 'lucide-react';
import { getUser } from '../../lib/auth';

export default function EnterpriseLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const usr = getUser();
    if (!usr) {
      navigate('/login?returnTo=/enterprise');
      return;
    }
    // "RecyclingEnterprise" or "4" depending on how backend returns role
    if (usr.role !== 'RecyclingEnterprise' && usr.role !== '4') {
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
            <Building2 className="w-6 h-6 text-primary" />
            <h2 className="font-extrabold tracking-tight text-lg text-on-surface">Trung tâm Doanh nghiệp</h2>
          </div>
          <p className="text-xs text-on-surface-variant/70 font-medium tracking-wide uppercase">Hệ thống quản lý rác</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <NavLink
            to="/enterprise"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            Tổng quan
          </NavLink>

          <NavLink
            to="/enterprise/requests"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]'
              }`
            }
          >
            <ListTodo className="w-5 h-5" />
            Quản lý thu gom
          </NavLink>

          <NavLink
            to="/enterprise/area"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]'
              }`
            }
          >
            <Scale className="w-5 h-5" />
            Năng lực & Khu vực
          </NavLink>

          <NavLink
            to="/enterprise/system"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            Quản lí hệ thống
          </NavLink>

          <NavLink
            to="/enterprise/tasks"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]'
              }`
            }
          >
            <Briefcase className="w-5 h-5" />
            Quản lí công việc
          </NavLink>

          <NavLink
            to="/enterprise/accounts"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]'
              }`
            }
          >
            <Users className="w-5 h-5" />
            Quản lí Account
          </NavLink>

          <NavLink
            to="/enterprise/feedback"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
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
            to="/enterprise/rewards"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]'
              }`
            }
          >
            <Gift className="w-5 h-5" />
            Quản lí điểm thưởng
          </NavLink>

          <NavLink
            to="/enterprise/vouchers"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]'
              }`
            }
          >
            <Ticket className="w-5 h-5" />
            Quản lí Voucher
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
          <Outlet />
        </div>
      </main>
    </div>
  );
}
