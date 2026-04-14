import {useMemo, useState} from 'react';
import {Eye, EyeOff, Leaf, Lock, Mail} from 'lucide-react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import {getApiBaseUrl, setAuth} from '../lib/auth';

function getGoogleClientId() {
  // Có thể set ở Vite env sau (VITE_GOOGLE_CLIENT_ID). Hiện để trống thì sẽ báo lỗi rõ ràng.
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
}

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.73 1.22 9.26 3.62l6.9-6.9C35.98 2.37 30.42 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.12 6.3C12.57 13.1 17.86 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.59-.14-3.12-.4-4.6H24v9.2h12.65c-.55 2.95-2.2 5.45-4.67 7.12l7.16 5.54C43.62 37.91 46.5 31.73 46.5 24.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.68 28.52a14.4 14.4 0 0 1 0-9.04l-8.12-6.3A24.01 24.01 0 0 0 0 24c0 3.87.93 7.52 2.56 10.82l8.12-6.3z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.42 0 11.98-2.12 15.98-5.76l-7.16-5.54c-2 1.35-4.57 2.15-8.82 2.15-6.14 0-11.43-3.6-13.32-8.72l-8.12 6.3C6.51 42.62 14.62 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const returnTo = searchParams.get('returnTo') || '/';

  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const [error, setError] = useState(null);

  const emailError = useMemo(() => {
    if (!touched.email) return null;
    if (!form.email.trim()) return 'Vui lòng nhập email.';
    if (!isValidEmail(form.email)) return 'Email không hợp lệ.';
    return null;
  }, [form.email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return null;
    if (!form.password) return 'Vui lòng nhập mật khẩu.';
    if (form.password.length < 6) return 'Mật khẩu tối thiểu 6 ký tự.';
    return null;
  }, [form.password, touched.password]);

  const canSubmit =
    !submitting && !emailError && !passwordError && Boolean(form.email) && Boolean(form.password);

  async function onSubmit(e) {
    e.preventDefault();
    setTouched({email: true, password: true});
    setError(null);
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: form.email, password: form.password}),
      });
      const text = await res.text();
      if (!res.ok) {
        setError(text || 'Đăng nhập thất bại. Vui lòng thử lại.');
        return;
      }
      const data = JSON.parse(text);
      setAuth({
        accessToken: data.accessToken,
        user: {
          userId: data.userId,
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          points: data.points,
        },
      });
      let dest = returnTo;
      if (data.role === 'RecyclingEnterprise' || data.role === '4') {
        dest = '/enterprise';
      } else if (data.role === 'Administrator' || data.role === '3') {
        dest = '/admin';
      } else if (data.role === 'Collector' || data.role === '2') {
        dest = '/collector';
      }
      navigate(dest, {replace: true});
    } catch {
      setError('Không thể kết nối BE. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  async function onGoogleLogin() {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const clientId = getGoogleClientId();
      if (!clientId || clientId.startsWith('CHANGE_ME')) {
        setError('Chưa cấu hình Google Client ID (VITE_GOOGLE_CLIENT_ID).');
        return;
      }
      const gsi = window?.google?.accounts?.id;
      if (!gsi) {
        setError('Google Identity Services chưa sẵn sàng. Vui lòng refresh trang.');
        return;
      }

      const credential = await new Promise((resolve, reject) => {
        try {
          gsi.initialize({
            client_id: clientId,
            callback: (resp) => {
              if (resp?.credential) resolve(resp.credential);
              else reject(new Error('Không nhận được credential từ Google.'));
            },
          });
          gsi.prompt((notification) => {
            if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
              reject(new Error('Google popup bị chặn hoặc bị bỏ qua.'));
            }
          });
        } catch (e) {
          reject(e);
        }
      });

      const res = await fetch(`${getApiBaseUrl()}/api/auth/google`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({credential}),
      });
      const text = await res.text();
      if (!res.ok) {
        setError(text || 'Đăng nhập Google thất bại.');
        return;
      }
      const data = JSON.parse(text);
      setAuth({
        accessToken: data.accessToken,
        user: {
          userId: data.userId,
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          points: data.points,
        },
      });
      let dest = returnTo;
      if (data.role === 'RecyclingEnterprise' || data.role === '4') {
        dest = '/enterprise';
      } else if (data.role === 'Administrator' || data.role === '3') {
        dest = '/admin';
      } else if (data.role === 'Collector' || data.role === '2') {
        dest = '/collector';
      }
      navigate(dest, {replace: true});
    } catch {
      setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-dvh w-full overflow-hidden px-4 sm:px-6 md:px-10 py-4">
      <div className="mx-auto max-w-6xl h-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center min-h-0">
        {/* Left: brand / value */}
        <section className="lg:col-span-7 rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden bg-on-surface text-surface relative botanical-shadow min-h-0">
          <div className="absolute inset-0 bg-linear-to-br from-primary/35 via-transparent to-primary-container/20" />
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/25 blur-[120px] rounded-full" />
          <div className="absolute -bottom-28 -left-24 w-96 h-96 bg-primary-container/25 blur-[140px] rounded-full" />

          <div className="relative p-6 sm:p-8 md:p-10 h-full flex flex-col justify-between gap-6">
            <div className="space-y-6 max-w-2xl">
              <div className="inline-flex items-center gap-3 bg-white/10 px-5 py-2 rounded-full border border-white/15">
                <Leaf className="w-4 h-4 text-primary-container" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-surface/90">
                  EcoSort access
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic leading-tight tracking-tight">
                Chào mừng trở lại.
                <br />
                <span className="not-italic text-primary-container">Đăng nhập</span> để tiếp tục hành trình
                xanh.
              </h1>

              <p className="text-sm sm:text-base text-surface/75 leading-relaxed font-light">
                Quản lý điểm thưởng, theo dõi tác động, và báo cáo rác thải chỉ với vài thao tác.
              </p>
            </div>

            <div className="eco-glass rounded-3xl p-6 sm:p-7 border border-white/20">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Tip</p>
                  <p className="text-sm sm:text-base text-on-surface-variant font-medium">
                    Dùng email và mật khẩu của bạn để đăng nhập. Nếu quên, hãy dùng “Quên mật khẩu”.
                  </p>
                </div>
                <Link
                  to="/"
                  className="shrink-0 text-xs font-black uppercase tracking-widest text-primary hover:text-primary-light transition-colors"
                >
                  Về trang chủ
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Right: form */}
        <section className="lg:col-span-5 min-h-0">
          <div className="bg-surface-container-lowest rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-8 border border-surface-container-high/60 botanical-shadow h-full min-h-0">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface">Đăng nhập</h2>
              <p className="text-on-surface-variant text-sm sm:text-base">
                Nhập thông tin để truy cập tài khoản của bạn.
              </p>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              {error && (
                <div className="rounded-2xl border border-error/30 bg-error/5 px-4 py-3">
                  <p className="text-sm font-semibold text-error">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/70">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/60" />
                  <input
                    value={form.email}
                    onChange={(e) => setForm((s) => ({...s, email: e.target.value}))}
                    onBlur={() => setTouched((t) => ({...t, email: true}))}
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full rounded-2xl bg-surface px-12 py-4 border border-surface-container-highest focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary/40 transition"
                  />
                </div>
                {emailError && <p className="text-xs font-semibold text-error">{emailError}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/70">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/60" />
                  <input
                    value={form.password}
                    onChange={(e) => setForm((s) => ({...s, password: e.target.value}))}
                    onBlur={() => setTouched((t) => ({...t, password: true}))}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full rounded-2xl bg-surface px-12 py-4 pr-12 border border-surface-container-highest focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary/40 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-surface-container-low transition"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-on-surface-variant/70" />
                    ) : (
                      <Eye className="w-5 h-5 text-on-surface-variant/70" />
                    )}
                  </button>
                </div>
                {passwordError && <p className="text-xs font-semibold text-error">{passwordError}</p>}
              </div>

              <div className="flex items-center justify-between gap-4 pt-1">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => setForm((s) => ({...s, remember: e.target.checked}))}
                    className="h-5 w-5 rounded-lg border-surface-container-highest text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm font-semibold text-on-surface-variant">Ghi nhớ đăng nhập</span>
                </label>

                <button
                  type="button"
                  onClick={() => navigate(`/forgot-password`)}
                  className="text-sm font-extrabold text-primary hover:text-primary-light transition-colors"
                >
                  Quên mật khẩu
                </button>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-primary hover:bg-primary-container disabled:opacity-60 disabled:hover:bg-primary text-white py-4 rounded-2xl font-extrabold transition-all active:scale-[0.99] shadow-lg shadow-primary/15"
              >
                {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
              </button>

              <div className="flex items-center gap-4 pt-1">
                <div className="h-px bg-surface-container-highest flex-1" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/50">
                  Hoặc
                </span>
                <div className="h-px bg-surface-container-highest flex-1" />
              </div>

              <button
                type="button"
                onClick={onGoogleLogin}
                disabled={submitting}
                className="w-full bg-surface hover:bg-surface-container-low disabled:opacity-60 text-on-surface py-4 rounded-2xl font-extrabold transition-all active:scale-[0.99] border border-surface-container-highest flex items-center justify-center gap-3"
              >
                <GoogleIcon className="w-5 h-5" />
                Đăng nhập với Google
              </button>

              <div className="pt-2">
                <p className="text-sm text-on-surface-variant">
                  Chưa có tài khoản?{' '}
                  <Link
                    to={`/register?returnTo=${encodeURIComponent(returnTo)}`}
                    className="font-extrabold text-primary hover:text-primary-light transition-colors"
                  >
                    Tạo tài khoản
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

