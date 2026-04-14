/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCheck,
  ChevronDown,
  Clock,
  LogIn,
  LogOut,
  User,
  History,
} from "lucide-react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Link,
  useNavigate,
  Outlet,
} from "react-router-dom";
import Home from "./pages/Home";
import Rewards from "./pages/Rewards";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./pages/VerifyCode";
import ResetPassword from "./pages/ResetPassword";
import { clearAuth, fetchMe, getToken, getUser } from "./lib/auth";

import EnterpriseLayout from "./pages/enterprise/EnterpriseLayout";
import EnterpriseDashboard from "./pages/enterprise/Dashboard";
import EnterpriseArea from "./pages/enterprise/Area";
import EnterpriseRequests from "./pages/enterprise/Requests";
import CollectorLayout from "./pages/collector/CollectorLayout";
import AdminLayout from "./pages/admin/AdminLayout";
import Report from "./pages/Report";
import CreateReport from "./pages/CreateReport";
import ReportDetail from "./pages/ReportDetail";
import HistoryPage from "./pages/History";

function readAuth() {
  return Boolean(getToken()) || localStorage.getItem("ecosort_auth") === "1";
}

function Layout() {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(() => readAuth());
  const [user, setUser] = useState(() => getUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const syncIdRef = useRef(0);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Công suất tới hạn",
      message: "Khu vực Quận 1 đã đạt 95% công suất xử lý tháng này.",
      time: "5 phút trước",
      type: "warning",
      isRead: false,
    },
    {
      id: 2,
      title: "Đơn hàng hoàn tất",
      message: "Yêu cầu thu gom mã #REQ-2024 tại Phường 5 đã xong.",
      time: "2 giờ trước",
      type: "success",
      isRead: false,
    },
    {
      id: 3,
      title: "Thông báo hệ thống",
      message: "Cập nhật chính sách phần thưởng mới cho tháng 4 đã sẵn sàng.",
      time: "1 ngày trước",
      type: "info",
      isRead: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const sync = () => {
      setIsAuthed(readAuth());
      setUser(getUser());
    };

    const onAuthEvent = () => {
      sync();
    };

    const onStorageEvent = () => {
      sync();
    };

    window.addEventListener("storage", onStorageEvent);
    window.addEventListener("ecosort_auth_changed", onAuthEvent);

    // Khởi động đồng bộ ban đầu
    sync();

    // Chỉ gọi fetchMe một lần duy nhất khi load trang để lấy dữ liệu mới nhất (như điểm thưởng)
    if (readAuth()) {
      fetchMe().then((me) => {
        if (me) setUser(getUser());
      });
    }

    return () => {
      window.removeEventListener("storage", onStorageEvent);
      window.removeEventListener("ecosort_auth_changed", onAuthEvent);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => {
      // Handle user menu
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      // Handle notification menu
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [menuOpen, notifOpen]);

  function logout() {
    syncIdRef.current++;
    clearAuth();
    setMenuOpen(false);
    setUser(null);
    setIsAuthed(false);
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* TopNavBar */}
      <header className="sticky top-0 w-full z-50 eco-glass botanical-shadow">
        <div className="flex items-center justify-between px-6 md:px-16 py-4 w-full">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo/Ecosort-logo.png"
                alt="EcoSort"
                className="h-10 w-auto"
                draggable={false}
              />
              <span className="text-2xl font-extrabold tracking-tight text-primary">
                EcoSort
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `font-bold transition-colors ${isActive ? "text-primary border-b-2 border-primary pb-1" : "text-on-surface-variant hover:text-primary"}`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/rewards"
                className={({ isActive }) =>
                  `font-bold transition-colors ${isActive ? "text-primary border-b-2 border-primary pb-1" : "text-on-surface-variant hover:text-primary"}`
                }
              >
                Rewards
              </NavLink>
              <NavLink
                to="/leaderboard"
                className={({ isActive }) =>
                  `font-bold transition-colors ${isActive ? "text-primary border-b-2 border-primary pb-1" : "text-on-surface-variant hover:text-primary"}`
                }
              >
                Leaderboard
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="/report"
              className="hidden sm:inline-flex items-center justify-center bg-primary hover:bg-primary-container text-white px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              Report Waste
            </Link>

            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className={`p-2 rounded-full transition-all relative ${notifOpen ? "bg-primary/10 text-primary" : "hover:bg-surface-container-high text-on-surface-variant"}`}
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-[2rem] bg-surface-container-lowest border border-surface-container-high/70 botanical-shadow overflow-hidden animate-in slide-in-from-top-2 duration-300 z-[60]">
                  <div className="p-6 border-b border-surface-container-high flex items-center justify-between bg-surface-container-low/30">
                    <h3 className="font-black text-on-surface flex items-center gap-2">
                      Thông báo
                      {unreadCount > 0 && (
                        <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full">
                          {unreadCount} mới
                        </span>
                      )}
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() =>
                          setNotifications((prev) =>
                            prev.map((n) => ({ ...n, isRead: true })),
                          )
                        }
                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="w-3 h-3" />
                        Đọc tất cả
                      </button>
                    )}
                  </div>

                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-surface-container-high">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-5 flex gap-4 hover:bg-surface-container-low transition-colors group cursor-pointer relative ${!notif.isRead ? "bg-primary/[0.02]" : ""}`}
                            onClick={() => {
                              setNotifications((prev) =>
                                prev.map((n) =>
                                  n.id === notif.id
                                    ? { ...n, isRead: true }
                                    : n,
                                ),
                              );
                            }}
                          >
                            {!notif.isRead && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>
                            )}
                            <div
                              className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center ${
                                notif.type === "warning"
                                  ? "bg-amber-100 text-amber-600"
                                  : notif.type === "success"
                                    ? "bg-emerald-100 text-emerald-600"
                                    : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              {notif.type === "warning" ? (
                                <Bell className="w-6 h-6" />
                              ) : notif.type === "success" ? (
                                <CheckCheck className="w-6 h-6" />
                              ) : (
                                <Bell className="w-6 h-6" />
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <p
                                className={`text-sm font-black leading-tight ${!notif.isRead ? "text-on-surface" : "text-on-surface-variant"}`}
                              >
                                {notif.title}
                              </p>
                              <p className="text-xs font-medium text-on-surface-variant/80 line-clamp-2">
                                {notif.message}
                              </p>
                              <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant/50 pt-1">
                                <Clock className="w-3 h-3" />
                                {notif.time}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center flex flex-col items-center justify-center opacity-40">
                        <Bell className="w-12 h-12 mb-4" />
                        <p className="font-bold">Không có thông báo nào</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-surface-container-low/30 border-t border-surface-container-high text-center">
                    <button className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
                      Xem tất cả hoạt động
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!isAuthed ? (
              <Link
                to="/login"
                className="flex items-center gap-2 pl-6 border-l border-surface-container-highest text-sm font-extrabold text-on-surface hover:text-primary transition-colors"
              >
                <LogIn className="w-4 h-4 text-primary" />
                Đăng nhập
              </Link>
            ) : (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  className="flex items-center gap-3 pl-6 border-l border-surface-container-highest hover:bg-surface-container-low rounded-2xl px-3 py-2 transition-all"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <div className="text-right hidden lg:block">
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold opacity-60">
                      {user?.displayName || user?.email || "Cá nhân"}
                    </p>
                    <p className="text-sm font-extrabold text-primary">
                      {typeof user?.points === "number"
                        ? user.points.toLocaleString()
                        : "0"}{" "}
                      Points
                    </p>
                  </div>
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzVeS9GDQVWYn_jFQbpMq33BS816uiB1_KbAdgp_7-yZG00XiQo87op11mXsfg0CytlpU81KsNpLDzPDAhDpFVs5a9E9A4_DajS1JIZ9RafPp-p0O_W4EaBhyoO4WYn9t0Bx6qNZMoeZrz9G-Mp3_6iMX2tEZfrDRQIa4MugJyesj1zADiQ5N8WvDEhGOI0j_me6c35BL2Q5z8VCgnnUbFWhWbfaI-zCq4YzLz-Q1UT-MD0F97xwdiKI4bfEF_IN5XFSWvZCISNEw6"
                    alt="User profile"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-container/30"
                    referrerPolicy="no-referrer"
                  />
                  <ChevronDown className="w-4 h-4 text-on-surface-variant/70" />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-container-lowest border border-surface-container-high/70 botanical-shadow overflow-hidden"
                  >
                    <Link
                      to="/profile"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <User className="w-4 h-4 text-primary" />
                      Trang cá nhân
                    </Link>
                    <Link
                      to="/history"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <History className="w-4 h-4 text-primary" />
                      Lịch sử
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-primary" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low w-full mt-20 border-t border-surface-container-highest">
        <div className="w-full px-6 md:px-16 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo/Ecosort-logo.png"
                alt="EcoSort"
                className="h-9 w-auto"
                draggable={false}
              />
              <span className="text-xl font-extrabold text-primary">
                EcoSort
              </span>
            </Link>

            <p className="text-sm text-on-surface-variant font-medium text-center md:text-left">
              © 2026 EcoSort. Nurturing the Ethereal Arboretum.
            </p>

            <nav className="flex flex-wrap justify-center gap-8">
              <Link
                to="/privacy"
                className="text-sm text-on-surface-variant hover:text-primary transition-colors font-medium"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-on-surface-variant hover:text-primary transition-colors font-medium"
              >
                Terms of Service
              </Link>
              <Link
                to="/support"
                className="text-sm text-on-surface-variant hover:text-primary transition-colors font-medium"
              >
                Contact Support
              </Link>
              <Link
                to="/report"
                className="text-sm text-on-surface-variant hover:text-primary transition-colors font-medium"
              >
                Sustainability Report
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="verify-code" element={<VerifyCode />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="register" element={<Register />} />

        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="profile" element={<Profile />} />

          <Route path="report" element={<Report />} />
          <Route path="report/create" element={<CreateReport />} />
          <Route path="report/:id" element={<ReportDetail />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>

        <Route path="enterprise" element={<EnterpriseLayout />}>
          <Route index element={<EnterpriseDashboard />} />
          <Route path="area" element={<EnterpriseArea />} />
          <Route path="requests" element={<EnterpriseRequests />} />
        </Route>

        <Route path="collector" element={<CollectorLayout />}>
          <Route
            index
            element={
              <div className="p-10 text-center font-bold opacity-50">
                Dashboard Collector đang được phát triển...
              </div>
            }
          />
          <Route
            path="tasks"
            element={
              <div className="p-10 text-center font-bold opacity-50">
                Quản lí công việc đang được phát triển...
              </div>
            }
          />
          <Route
            path="history"
            element={
              <div className="p-10 text-center font-bold opacity-50">
                Lịch sử công việc đang được phát triển...
              </div>
            }
          />
        </Route>

        <Route path="admin" element={<AdminLayout />}>
          <Route
            index
            element={
              <div className="p-10 text-center font-bold opacity-50">
                Dashboard Admin đang được phát triển...
              </div>
            }
          />
          <Route
            path="system"
            element={
              <div className="p-10 text-center font-bold opacity-50">
                Quản trị hệ thống đang được phát triển...
              </div>
            }
          />
          <Route
            path="accounts"
            element={
              <div className="p-10 text-center font-bold opacity-50">
                Quản lí tài khoản đang được phát triển...
              </div>
            }
          />
          <Route
            path="feedback"
            element={
              <div className="p-10 text-center font-bold opacity-50">
                Quản lí feedback đang được phát triển...
              </div>
            }
          />
          <Route
            path="rewards"
            element={
              <div className="p-10 text-center font-bold opacity-50">
                Quản lí điểm thưởng đang được phát triển...
              </div>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}
