/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Bell,
} from 'lucide-react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Link
} from 'react-router-dom';
import Home from './pages/Home';
import Rewards from './pages/Rewards';
import Leaderboard from './pages/Leaderboard';

function Layout({ children }: { children: React.ReactNode }) {
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
            <button className="hidden sm:block bg-primary hover:bg-primary-container text-white px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-primary/20">
              Report Waste
            </button>

            <div className="relative p-2 hover:bg-surface-container-high rounded-full transition-all cursor-pointer">
              <Bell className="w-6 h-6 text-on-surface-variant" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error rounded-full border-2 border-white"></span>
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-surface-container-highest">
              <div className="text-right hidden lg:block">
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold opacity-60">Cá nhân</p>
                <p className="text-sm font-extrabold text-primary">1,250 Points</p>
              </div>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzVeS9GDQVWYn_jFQbpMq33BS816uiB1_KbAdgp_7-yZG00XiQo87op11mXsfg0CytlpU81KsNpLDzPDAhDpFVs5a9E9A4_DajS1JIZ9RafPp-p0O_W4EaBhyoO4WYn9t0Bx6qNZMoeZrz9G-Mp3_6iMX2tEZfrDRQIa4MugJyesj1zADiQ5N8WvDEhGOI0j_me6c35BL2Q5z8VCgnnUbFWhWbfaI-zCq4YzLz-Q1UT-MD0F97xwdiKI4bfEF_IN5XFSWvZCISNEw6"
                alt="User profile"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-container/30"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full">
        {children}
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
              <span className="text-xl font-extrabold text-primary">EcoSort</span>
            </Link>

            <p className="text-sm text-on-surface-variant font-medium text-center md:text-left">
              © 2026 EcoSort. Nurturing the Ethereal Arboretum.
            </p>

            <nav className="flex flex-wrap justify-center gap-8">
              <Link to="/privacy" className="text-sm text-on-surface-variant hover:text-primary transition-colors font-medium">Privacy Policy</Link>
              <Link to="/terms" className="text-sm text-on-surface-variant hover:text-primary transition-colors font-medium">Terms of Service</Link>
              <Link to="/support" className="text-sm text-on-surface-variant hover:text-primary transition-colors font-medium">Contact Support</Link>
              <Link to="/report" className="text-sm text-on-surface-variant hover:text-primary transition-colors font-medium">Sustainability Report</Link>
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
        </Routes>
      </Layout>
    </Router>
  );
}
