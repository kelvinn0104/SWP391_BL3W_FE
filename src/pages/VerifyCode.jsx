import {useMemo, useState} from 'react';
import {KeyRound, Leaf} from 'lucide-react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import {getApiBaseUrl} from '../lib/auth';

export default function VerifyCode() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [code, setCode] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const codeError = useMemo(() => {
    if (!touched) return null;
    const v = code.trim();
    if (!v) return 'Vui lòng nhập mã 6 số.';
    if (!/^\d{6}$/.test(v)) return 'Mã phải gồm 6 chữ số.';
    return null;
  }, [code, touched]);

  const canSubmit = !submitting && !codeError && Boolean(email);

  async function onSubmit(e) {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/verify-reset-code`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, code: code.trim()}),
      });
      const text = await res.text();
      if (!res.ok) {
        setError(text || 'Mã không hợp lệ hoặc đã hết hạn.');
        return;
      }
      const data = JSON.parse(text);
      navigate(
        `/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(data.resetToken)}`,
        {replace: true},
      );
    } catch {
      setError('Không thể kết nối BE. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!email) {
    return (
      <div className="px-4 sm:px-6 md:px-16 py-10 sm:py-14">
        <div className="max-w-xl mx-auto bg-surface-container-lowest rounded-[2.5rem] sm:rounded-[3rem] p-7 sm:p-10 border border-surface-container-high/60 botanical-shadow">
          <p className="text-on-surface-variant">Thiếu email. Vui lòng quay lại trang quên mật khẩu.</p>
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
        <div className="space-y-3">
          <div className="inline-flex items-center gap-3 bg-primary/5 px-5 py-2 rounded-full border border-primary/10">
            <Leaf className="w-4 h-4 text-primary" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Reset password</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface">Xác nhận mã</h1>
          <p className="text-on-surface-variant">
            Mình đã gửi mã xác nhận tới <b>{email}</b>. Hãy mở Gmail và nhập mã 6 số.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="rounded-2xl border border-error/30 bg-error/5 px-4 py-3">
              <p className="text-sm font-semibold text-error">{error}</p>
            </div>
          )}

          <div className="rounded-3xl bg-surface border border-surface-container-highest p-5 sm:p-6">
            <div className="flex items-center gap-2 text-primary font-extrabold">
              <KeyRound className="w-5 h-5" />
              <span>Nhập mã 6 số</span>
            </div>
            <p className="text-sm text-on-surface-variant mt-2">
              Mã có hiệu lực trong 10 phút. Nếu bạn bấm “Gửi lại”, hãy dùng mã mới nhất.
            </p>
            <div className="mt-4 space-y-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                onBlur={() => setTouched(true)}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="615783"
                className="w-full rounded-2xl bg-surface px-5 py-4 border border-surface-container-highest focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary/40 transition text-xl tracking-[0.45em] font-extrabold text-center"
              />
              {codeError && <p className="text-xs font-semibold text-error">{codeError}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 bg-primary hover:bg-primary-container disabled:opacity-60 disabled:hover:bg-primary text-white py-4 rounded-2xl font-extrabold transition-all active:scale-[0.99] shadow-lg shadow-primary/15"
            >
              {submitting ? 'Đang xác nhận…' : 'Xác nhận'}
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
            Chưa nhận được mã?{' '}
            <Link
              to={`/forgot-password`}
              className="font-extrabold text-primary hover:text-primary-light transition-colors"
            >
              Gửi lại
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

