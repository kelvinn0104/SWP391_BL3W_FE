import {useMemo, useState} from 'react';
import {Eye, EyeOff, Leaf, Lock, Mail} from 'lucide-react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';

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
      // UI-only: giả lập đăng nhập, thay bằng call API sau.
      await new Promise((r) => setTimeout(r, 700));
      localStorage.setItem('ecosort_auth', '1');
      window.dispatchEvent(new Event('ecosort_auth_changed'));
      navigate(returnTo, {replace: true});
    } catch {
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
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
                Chào mừng trở lại.
                <br />
                <span className="not-italic text-primary-container">Đăng nhập</span> để tiếp tục hành trình
                xanh.
              </h1>

              <p className="text-base sm:text-lg text-surface/75 leading-relaxed font-light">
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
        <section className="lg:col-span-5">
          <div className="bg-surface-container-lowest rounded-[2.5rem] sm:rounded-[3rem] p-7 sm:p-10 border border-surface-container-high/60 botanical-shadow h-full">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface">Đăng nhập</h2>
              <p className="text-on-surface-variant text-sm sm:text-base">
                Nhập thông tin để truy cập tài khoản của bạn.
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
                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/70">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary-light transition-colors"
                    onClick={() => setError('Tính năng “Quên mật khẩu” chưa được kết nối BE.')}
                  >
                    Quên mật khẩu
                  </button>
                </div>
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

                <Link
                  to="/"
                  className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
                >
                  Trợ giúp
                </Link>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-primary hover:bg-primary-container disabled:opacity-60 disabled:hover:bg-primary text-white py-4 rounded-2xl font-extrabold transition-all active:scale-[0.99] shadow-lg shadow-primary/15"
              >
                {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
              </button>

              <div className="pt-2">
                <p className="text-sm text-on-surface-variant">
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    className="font-extrabold text-primary hover:text-primary-light transition-colors"
                    onClick={() => setError('Màn “Đăng ký” chưa được tạo.')}
                  >
                    Tạo tài khoản
                  </button>
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

