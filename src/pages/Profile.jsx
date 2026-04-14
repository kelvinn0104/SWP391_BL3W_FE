import {LogOut, User} from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom';
import {clearAuth, getUser} from '../lib/auth';

export default function Profile() {
  const navigate = useNavigate();
  const user = getUser();

  function onLogout() {
    clearAuth();
    navigate('/', {replace: true});
  }

  return (
    <div className="px-4 sm:px-6 md:px-16 py-10 sm:py-14">
      <div className="bg-surface-container-lowest rounded-[2.5rem] sm:rounded-[3rem] p-7 sm:p-10 border border-surface-container-high/60 botanical-shadow">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-primary font-extrabold">
              <User className="w-5 h-5" />
              <span>Trang cá nhân</span>
            </div>
            <p className="text-on-surface-variant">
              {user
                ? `Xin chào ${user.displayName || user.email}.`
                : 'Bạn chưa đăng nhập.'}
            </p>
          </div>

          <Link
            to="/"
            className="shrink-0 px-4 py-2 rounded-xl border border-surface-container-highest hover:bg-surface-container-low transition-all text-sm font-extrabold text-on-surface"
          >
            Về trang chủ
          </Link>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-white px-5 py-3 rounded-2xl font-extrabold transition-all active:scale-[0.99] shadow-lg shadow-primary/15"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}

