import {useMemo, useState} from 'react';
import {Leaf, Mail} from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom';
import {getApiBaseUrl} from '../lib/auth';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const emailError = useMemo(() => {
    if (!touched) return null;
    if (!email.trim()) return 'Vui lòng nhập email.';
    if (!isValidEmail(email)) return 'Email không hợp lệ.';
    return null;
  }, [email, touched]);

  const canSubmit = !submitting && !emailError && Boolean(email);

  async function onSubmit(e) {
    e.preventDefault();
    setTouched(true);
    setError(null);
    setMessage(null);
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email}),
      });
      const text = await res.text();
      if (!res.ok) {
        setError(text || 'Không thể gửi mã. Vui lòng thử lại.');
        return;
      }
      setMessage('Nếu email tồn tại, mã 6 số đã được gửi. Vui lòng kiểm tra Gmail.');
      navigate(`/verify-code?email=${encodeURIComponent(email.trim())}`, {replace: true});
    } catch {
      setError('Không thể kết nối BE. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full px-4 sm:px-6 md:px-16 py-10 sm:py-14">
      <div className="max-w-xl mx-auto bg-surface-container-lowest rounded-[2.5rem] sm:rounded-[3rem] p-7 sm:p-10 border border-surface-container-high/60 botanical-shadow">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-3 bg-primary/5 px-5 py-2 rounded-full border border-primary/10">
            <Leaf className="w-4 h-4 text-primary" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Reset password</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface">Quên mật khẩu</h1>
          <p className="text-on-surface-variant">
            Nhập email để nhận mã xác nhận 6 số.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="rounded-2xl border border-error/30 bg-error/5 px-4 py-3">
              <p className="text-sm font-semibold text-error">{error}</p>
            </div>
          )}
          {message && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
              <p className="text-sm font-semibold text-primary">{message}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/70">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/60" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-2xl bg-surface px-12 py-4 border border-surface-container-highest focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary/40 transition"
              />
            </div>
            {emailError && <p className="text-xs font-semibold text-error">{emailError}</p>}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 bg-primary hover:bg-primary-container disabled:opacity-60 disabled:hover:bg-primary text-white py-4 rounded-2xl font-extrabold transition-all active:scale-[0.99] shadow-lg shadow-primary/15"
            >
              {submitting ? 'Đang gửi…' : 'Gửi mã'}
            </button>
            <a
              href="https://mail.google.com/"
              target="_blank"
              rel="noreferrer"
              className="shrink-0 px-4 py-4 rounded-2xl border border-surface-container-highest hover:bg-surface-container-low transition-all text-sm font-extrabold text-on-surface"
              title="Mở Gmail"
            >
              Mở Gmail
            </a>
          </div>

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

