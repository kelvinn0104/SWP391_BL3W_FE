import {useMemo, useState} from 'react';
import {Eye, EyeOff, Lock} from 'lucide-react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import {getApiBaseUrl} from '../lib/auth';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState({pw: false, pw2: false});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(false);

  const pwError = useMemo(() => {
    if (!touched.pw) return null;
    if (!pw) return 'Vui lòng nhập mật khẩu mới.';
    if (pw.length < 6) return 'Mật khẩu tối thiểu 6 ký tự.';
    return null;
  }, [pw, touched.pw]);

  const pw2Error = useMemo(() => {
    if (!touched.pw2) return null;
    if (!pw2) return 'Vui lòng nhập lại mật khẩu.';
    if (pw2 !== pw) return 'Mật khẩu nhập lại không khớp.';
    return null;
  }, [pw2, pw, touched.pw2]);

  const canSubmit = !submitting && !pwError && !pw2Error && email && token;

  async function onSubmit(e) {
    e.preventDefault();
    setTouched({pw: true, pw2: true});
    setError(null);
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/reset-password`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, resetToken: token, newPassword: pw}),
      });
      const text = await res.text();
      if (!res.ok) {
        setError(text || 'Không thể đổi mật khẩu.');
        return;
      }
      setOk(true);
      setTimeout(() => navigate('/login', {replace: true}), 600);
    } catch {
      setError('Không thể kết nối BE. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!email || !token) {
    return (
      <div className="px-4 sm:px-6 md:px-16 py-10 sm:py-14">
        <div className="max-w-xl mx-auto bg-surface-container-lowest rounded-[2.5rem] sm:rounded-[3rem] p-7 sm:p-10 border border-surface-container-high/60 botanical-shadow">
          <p className="text-on-surface-variant">Thiếu thông tin reset. Vui lòng bắt đầu lại.</p>
          <Link to="/forgot-password" className="inline-block mt-4 font-extrabold text-primary">
            Quên mật khẩu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full px-4 sm:px-6 md:px-16 py-10 sm:py-14">
      <div className="max-w-xl mx-auto bg-surface-container-lowest rounded-[2.5rem] sm:rounded-[3rem] p-7 sm:p-10 border border-surface-container-high/60 botanical-shadow">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-primary font-extrabold">
            <Lock className="w-5 h-5" />
            <span>Đổi mật khẩu</span>
          </div>
          <p className="text-on-surface-variant">
            Tạo mật khẩu mới cho <b>{email}</b>.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="rounded-2xl border border-error/30 bg-error/5 px-4 py-3">
              <p className="text-sm font-semibold text-error">{error}</p>
            </div>
          )}
          {ok && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
              <p className="text-sm font-semibold text-primary">Đổi mật khẩu thành công. Đang chuyển về đăng nhập…</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/70">
              Mật khẩu mới
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/60" />
              <input
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onBlur={() => setTouched((t) => ({...t, pw: true}))}
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-2xl bg-surface px-12 py-4 pr-12 border border-surface-container-highest focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary/40 transition"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-surface-container-low transition"
                aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {show ? (
                  <EyeOff className="w-5 h-5 text-on-surface-variant/70" />
                ) : (
                  <Eye className="w-5 h-5 text-on-surface-variant/70" />
                )}
              </button>
            </div>
            {pwError && <p className="text-xs font-semibold text-error">{pwError}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/70">
              Nhập lại mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/60" />
              <input
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                onBlur={() => setTouched((t) => ({...t, pw2: true}))}
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-2xl bg-surface px-12 py-4 border border-surface-container-highest focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary/40 transition"
              />
            </div>
            {pw2Error && <p className="text-xs font-semibold text-error">{pw2Error}</p>}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-primary hover:bg-primary-container disabled:opacity-60 disabled:hover:bg-primary text-white py-4 rounded-2xl font-extrabold transition-all active:scale-[0.99] shadow-lg shadow-primary/15"
          >
            {submitting ? 'Đang cập nhật…' : 'Cập nhật mật khẩu'}
          </button>

          <p className="text-sm text-on-surface-variant">
            Quay lại{' '}
            <Link to="/login" className="font-extrabold text-primary hover:text-primary-light transition-colors">
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

