import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  History,
  Truck,
  LogOut,
} from "lucide-react";
import { clearAuth, getUser } from "../../lib/auth";

export default function CollectorLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const usr = getUser();
    if (!usr) {
      navigate("/login?returnTo=/collector");
      return;
    }
    // "Collector" or "2"
    if (usr.role !== "Collector" && usr.role !== "2") {
      navigate("/");
      return;
    }
    setUser(usr);
  }, [navigate]);

  if (!user) return null;

  function getInitial(nameOrEmail) {
    const s = String(nameOrEmail || "").trim();
    if (!s) return "U";
    const parts = s.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first + last).toUpperCase() || "U";
  }

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
            <Truck className="w-6 h-6 text-primary" />
            <h2 className="font-extrabold tracking-tight text-lg text-on-surface">
              Cổng nhân viên
            </h2>
          </div>
          <p className="text-[10px] text-on-surface-variant/70 font-black tracking-widest uppercase">
            Khu vực thu gom
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto min-h-0">
          <NavLink
            to="/collector"
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
            to="/collector/tasks"
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
            to="/collector/history"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]"
              }`
            }
          >
            <History className="w-5 h-5" />
            Lịch sử công việc
          </NavLink>
        </nav>

        {/* Bottom user card + logout (like screenshot) */}
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
                {user.displayName || user.email || "Collector"}
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
          {/* Header Dashboard Placeholder */}
          <header className="mb-10">
            <h1 className="text-3xl font-serif italic text-on-surface mb-2">
              Xin chào,{" "}
              <span className="not-italic font-black text-primary">
                {user.displayName || "Nhân viên"}
              </span>
            </h1>
            <p className="text-on-surface-variant font-medium">
              Bắt đầu ngày làm việc của bạn ngay hôm nay.
            </p>
          </header>

          <Outlet />
        </div>
      </main>
    </div>
  );
}
