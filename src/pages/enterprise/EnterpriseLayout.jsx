import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Scale,
  ListTodo,
  Building2,
  Gift,
  Briefcase,
  Users,
  Settings,
  MessageSquare,
  Ticket,
  LogOut,
} from "lucide-react";
import { clearAuth, getUser } from "../../lib/auth";

export default function EnterpriseLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const usr = getUser();
    if (!usr) {
      navigate("/login?returnTo=/enterprise");
      return;
    }
    // "RecyclingEnterprise" or "4" depending on how backend returns role
    if (usr.role !== "RecyclingEnterprise" && usr.role !== "4") {
      navigate("/");
      return;
    }
    setUser(usr);
  }, [navigate]);

  if (!user) return null;

  function onLogout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-surface-container-low min-h-0">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-container-lowest border-r border-surface-container-highest flex flex-col eco-glass z-10 transition-all min-h-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-6 h-6 text-primary" />
            <h2 className="font-extrabold tracking-tight text-lg text-on-surface">
              Trung tâm Doanh nghiệp
            </h2>
          </div>
          <p className="text-xs text-on-surface-variant/70 font-medium tracking-wide uppercase">
            Hệ thống quản lý rác
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto min-h-0">
          <NavLink
            to="/enterprise"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]"
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            Tổng quan
          </NavLink>

          <NavLink
            to="/enterprise/requests"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]"
              }`
            }
          >
            <ListTodo className="w-5 h-5" />
            Quản lý thu gom
          </NavLink>

          <NavLink
            to="/enterprise/area"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]"
              }`
            }
          >
            <Scale className="w-5 h-5" />
            Năng lực & Khu vực
          </NavLink>

          <NavLink
            to="/enterprise/system"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]"
              }`
            }
          >
            <Settings className="w-5 h-5" />
            Quản lí hệ thống
          </NavLink>

          <NavLink
            to="/enterprise/tasks"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]"
              }`
            }
          >
            <Briefcase className="w-5 h-5" />
            Quản lí công việc
          </NavLink>

          <NavLink
            to="/enterprise/accounts"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]"
              }`
            }
          >
            <Users className="w-5 h-5" />
            Quản lí Account
          </NavLink>

          <NavLink
            to="/enterprise/feedback"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]"
              }`
            }
          >
            <MessageSquare className="w-5 h-5" />
            Quản lí Feedback
          </NavLink>

          <div className="pt-6 pb-2 px-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
              Mở rộng
            </p>
          </div>

          <NavLink
            to="/enterprise/rewards"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]"
              }`
            }
          >
            <Gift className="w-5 h-5" />
            Quản lí điểm thưởng
          </NavLink>

          <NavLink
            to="/enterprise/vouchers"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]"
              }`
            }
          >
            <Ticket className="w-5 h-5" />
            Quản lí Voucher
          </NavLink>
        </nav>

        {/* Bottom user card + logout */}
        <div className="mt-auto border-t border-surface-container-highest p-4">
          <div className="flex items-center gap-3">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzVeS9GDQVWYn_jFQbpMq33BS816uiB1_KbAdgp_7-yZG00XiQo87op11mXsfg0CytlpU81KsNpLDzPDAhDpFVs5a9E9A4_DajS1JIZ9RafPp-p0O_W4EaBhyoO4WYn9t0Bx6qNZMoeZrz9G-Mp3_6iMX2tEZfrDRQIa4MugJyesj1zADiQ5N8WvDEhGOI0j_me6c35BL2Q5z8VCgnnUbFWhWbfaI-zCq4YzLz-Q1UT-MD0F97xwdiKI4bfEF_IN5XFSWvZCISNEw6"
              alt="User profile"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-container/30"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-on-surface truncate">
                {user.displayName || user.email || "Enterprise"}
              </p>
              <p className="text-[10px] font-black tracking-widest uppercase text-on-surface-variant/60">
                {user.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="mt-4 w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98] transition-all"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-surface relative min-h-0">
        <div
          className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, black 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        ></div>
        <div className="p-8 md:p-12 relative z-10 w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
