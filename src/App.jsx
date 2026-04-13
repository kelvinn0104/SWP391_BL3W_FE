/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, LogIn, LogOut, User } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';
import Home from './pages/Home';
import Rewards from './pages/Rewards';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Report from './pages/Report';

function readAuth() {
  return localStorage.getItem('ecosort_auth') === '1';
}

function Layout({ children }) {
  const [isAuthed, setIsAuthed] = useState(() => readAuth());
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onChanged = () => setIsAuthed(readAuth());
    window.addEventListener('storage', onChanged);
    window.addEventListener('ecosort_auth_changed', onChanged);
    return () => {
      window.removeEventListener('storage', onChanged);
      window.removeEventListener('ecosort_auth_changed', onChanged);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target)) return;
      setMenuOpen(false);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [menuOpen]);

  function logout() {
    localStorage.removeItem('ecosort_auth');
    window.dispatchEvent(new Event('ecosort_auth_changed'));
    setMenuOpen(false);
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
              <span className="text-2xl font-extrabold tracking-tight text-primary">EcoSort</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `font-bold transition-colors ${isActive ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/rewards"
                className={({ isActive }) =>
                  `font-bold transition-colors ${isActive ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`
                }
              >
                Rewards
              </NavLink>
              <NavLink
                to="/leaderboard"
                className={({ isActive }) =>
                  `font-bold transition-colors ${isActive ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`
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

            <div className="relative p-2 hover:bg-surface-container-high rounded-full transition-all cursor-pointer">
              <Bell className="w-6 h-6 text-on-surface-variant" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error rounded-full border-2 border-white"></span>
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
                      Cá nhân
                    </p>
                    <p className="text-sm font-extrabold text-primary">1,250 Points</p>
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

      <main className="flex-grow w-full">{children}</main>

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
              <span className="text-xl font-extrabold text-primary">EcoSort</span>
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
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </Layout>
    </Router>
  );
}

