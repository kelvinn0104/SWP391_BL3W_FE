import {useMemo, useState} from 'react';
import {Eye, EyeOff, Leaf, Lock, Mail, User} from 'lucide-react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import {getApiBaseUrl, setAuth} from '../lib/auth';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';

  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({
    displayName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [error, setError] = useState(null);

  const displayNameError = useMemo(() => {
    if (!touched.displayName) return null;
    if (!form.displayName.trim()) return 'Vui lòng nhập tên hiển thị.';
    if (form.displayName.trim().length > 100) return 'Tên hiển thị tối đa 100 ký tự.';
    return null;
  }, [form.displayName, touched.displayName]);

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

  const confirmPasswordError = useMemo(() => {
    if (!touched.confirmPassword) return null;
    if (!form.confirmPassword) return 'Vui lòng nhập lại mật khẩu.';
    if (form.confirmPassword !== form.password) return 'Mật khẩu nhập lại không khớp.';
    return null;
  }, [form.confirmPassword, form.password, touched.confirmPassword]);

  const canSubmit =
    !submitting &&
    !displayNameError &&
    !emailError &&
    !passwordError &&
    !confirmPasswordError &&
    form.displayName &&
    form.email &&
    form.password &&
    form.confirmPassword;

  async function onSubmit(e) {
    e.preventDefault();
    setTouched({displayName: true, email: true, password: true, confirmPassword: true});
    setError(null);
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          displayName: form.displayName,
        }),
      });

      const text = await res.text();
      if (!res.ok) {
        setError(text || 'Tạo tài khoản thất bại.');
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
      navigate(returnTo, {replace: true});
    } catch {
      setError('Không thể kết nối BE. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full px-4 sm:px-6 md:px-16 py-10 sm:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        {/* Left: brand / value */}
        <section className="lg:col-span-7 rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden bg-on-surface text-surface relative botanical-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/35 via-transparent to-primary-container/20" />
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/25 blur-[120px] rounded-full" />
          <div className="absolute -bottom-28 -left-24 w-96 h-96 bg-primary-container/25 blur-[140px] rounded-full" />

          <div className="relative p-8 sm:p-12 md:p-16 h-full flex flex-col justify-between gap-10">
            <div className="space-y-6 max-w-2xl">
              <div className="inline-flex items-center gap-3 bg-white/10 px-5 py-2 rounded-full border border-white/15">
                <Leaf className="w-4 h-4 text-primary-container" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-surface/90">
                  EcoSort access
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif italic leading-tight tracking-tight">
                Bắt đầu ngay hôm nay.
                <br />
                <span className="not-italic text-primary-container">Tạo tài khoản</span> để tích điểm xanh.
              </h1>

              <p className="text-base sm:text-lg text-surface/75 leading-relaxed font-light">
                Tham gia cộng đồng EcoSort để theo dõi tác động và nhận phần thưởng bền vững.
              </p>
            </div>

            <div className="eco-glass rounded-3xl p-6 sm:p-7 border border-white/20">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Tip</p>
                  <p className="text-sm sm:text-base text-on-surface-variant font-medium">
                    Dùng email thật để tiện khôi phục tài khoản về sau.
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
        <section className="lg:col-span-5">
          <div className="bg-surface-container-lowest rounded-[2.5rem] sm:rounded-[3rem] p-7 sm:p-10 border border-surface-container-high/60 botanical-shadow h-full">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface">Tạo tài khoản</h2>
              <p className="text-on-surface-variant text-sm sm:text-base">
                Điền thông tin để tạo tài khoản mới.
              </p>
            </div>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="rounded-2xl border border-error/30 bg-error/5 px-4 py-3">
                  <p className="text-sm font-semibold text-error">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/70">
                  Tên hiển thị
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/60" />
                  <input
                    value={form.displayName}
                    onChange={(e) => setForm((s) => ({...s, displayName: e.target.value}))}
                    onBlur={() => setTouched((t) => ({...t, displayName: true}))}
                    placeholder="Ví dụ: Song Nguyen"
                    className="w-full rounded-2xl bg-surface px-12 py-4 border border-surface-container-highest focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary/40 transition"
                  />
                </div>
                {displayNameError && <p className="text-xs font-semibold text-error">{displayNameError}</p>}
              </div>

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
                    autoComplete="new-password"
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

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/70">
                  Nhập lại mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/60" />
                  <input
                    value={form.confirmPassword}
                    onChange={(e) => setForm((s) => ({...s, confirmPassword: e.target.value}))}
                    onBlur={() => setTouched((t) => ({...t, confirmPassword: true}))}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full rounded-2xl bg-surface px-12 py-4 border border-surface-container-highest focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary/40 transition"
                  />
                </div>
                {confirmPasswordError && (
                  <p className="text-xs font-semibold text-error">{confirmPasswordError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-primary hover:bg-primary-container disabled:opacity-60 disabled:hover:bg-primary text-white py-4 rounded-2xl font-extrabold transition-all active:scale-[0.99] shadow-lg shadow-primary/15"
              >
                {submitting ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}
              </button>

              <div className="pt-2">
                <p className="text-sm text-on-surface-variant">
                  Đã có tài khoản?{' '}
                  <Link
                    to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
                    className="font-extrabold text-primary hover:text-primary-light transition-colors"
                  >
                    Đăng nhập
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

