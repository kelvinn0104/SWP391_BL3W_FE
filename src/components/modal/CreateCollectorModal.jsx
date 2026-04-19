import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  X,
} from "lucide-react";
import { createCollector } from "../../api/userApi";

const initialForm = () => ({
  email: "",
  password: "",
  confirmPassword: "",
  displayName: "",
  fullName: "",
  phoneNumber: "",
  address: "",
});

const labelClass =
  "text-[10px] font-black uppercase text-on-surface-variant/40 ml-1 tracking-widest opacity-70";

const inputClass =
  "w-full px-4 md:px-5 py-2.5 md:py-3 rounded-xl bg-surface-container-low border border-surface-container-high font-bold text-sm outline-none focus:ring-2 focus:ring-primary/25 transition-all shadow-sm disabled:opacity-60";

/** Giống Register.jsx — mật khẩu tối thiểu 6 ký tự */
const MIN_PASSWORD_LENGTH = 6;

export default function CreateCollectorModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitToast, setSubmitToast] = useState(null);
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const passwordError = useMemo(() => {
    if (!touched.password) return null;
    if (!form.password) return "Vui lòng nhập mật khẩu.";
    if (form.password.length < MIN_PASSWORD_LENGTH)
      return "Mật khẩu tối thiểu 6 ký tự.";
    return null;
  }, [form.password, touched.password]);

  const confirmPasswordError = useMemo(() => {
    if (!touched.confirmPassword) return null;
    if (!form.confirmPassword) return "Vui lòng nhập lại mật khẩu.";
    if (form.confirmPassword !== form.password)
      return "Mật khẩu nhập lại không khớp.";
    return null;
  }, [form.confirmPassword, form.password, touched.confirmPassword]);

  useEffect(() => {
    if (open) {
      setSubmitToast(null);
      return;
    }
    setForm(initialForm());
    setSubmitting(false);
    setShowPassword(false);
    setTouched({ password: false, confirmPassword: false });
  }, [open]);

  useEffect(() => {
    if (!submitToast) return undefined;
    const timer = window.setTimeout(() => setSubmitToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [submitToast]);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched((t) => ({ ...t, password: true, confirmPassword: true }));

    const email = form.email.trim();
    const password = form.password;
    const confirmPassword = form.confirmPassword;
    const displayName = form.displayName.trim();
    const fullName = form.fullName.trim();
    const phoneNumber = form.phoneNumber.trim();
    const address = form.address.trim();

    if (
      !email ||
      !password ||
      !confirmPassword ||
      !displayName ||
      !fullName ||
      !phoneNumber ||
      !address
    ) {
      setSubmitToast({
        type: "error",
        title: "Thiếu thông tin",
        message: "Vui lòng điền đầy đủ các trường bắt buộc.",
      });
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) return;
    if (password !== confirmPassword) return;

    setSubmitting(true);
    try {
      await createCollector({
        email,
        password,
        confirmPassword,
        displayName,
        fullName,
        phoneNumber,
        address,
      });
      setSubmitToast({
        type: "success",
        title: "Tạo tài khoản thành công",
        message: "Tài khoản người thu gom đã được thêm vào hệ thống.",
      });
      window.setTimeout(() => {
        onCreated?.();
        onClose?.();
      }, 700);
    } catch (error) {
      let msg = error?.message || "Không tạo được tài khoản. Vui lòng thử lại.";
      try {
        const parsed = JSON.parse(msg);
        const first =
          parsed?.errors && Object.values(parsed.errors).flat?.()?.[0];
        if (typeof first === "string") msg = first;
        else if (parsed?.title) msg = parsed.title;
        else if (parsed?.message) msg = parsed.message;
      } catch {
        // keep msg as plain text
      }
      setSubmitToast({
        type: "error",
        title: "Tạo tài khoản thất bại",
        message: msg,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <>
      <AnimatePresence>
        {open && (
          <div
          className="fixed inset-0 z-200 flex items-start justify-center p-4 md:p-6 pt-8 md:pt-12 pb-10 bg-on-surface/50 backdrop-blur-sm overflow-y-auto min-h-0"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-collector-title"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="bg-surface-container-lowest w-full max-w-5xl rounded-3xl md:rounded-4xl p-5 md:p-7 botanical-shadow-lg border border-surface-container-high shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-3 mb-4 md:mb-5 pb-3 md:pb-4 border-b border-surface-container-high/50">
              <div className="min-w-0 pr-2">
                <h2
                  id="create-collector-title"
                  className="text-lg md:text-2xl font-black text-on-surface flex items-center gap-2 md:gap-3"
                >
                  <UserPlus className="text-primary w-6 h-6 shrink-0" />
                  <span className="truncate">Thêm người thu gom</span>
                </h2>
                <p className="text-xs md:text-sm font-bold text-on-surface-variant/80 mt-1 ml-0 opacity-70 leading-snug">
                  Tạo tài khoản — nhập thông tin đăng nhập và hồ sơ người thu
                  gom.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="p-2 md:p-3 hover:bg-surface-container-high rounded-full transition-colors shrink-0 disabled:opacity-50"
                aria-label="Đóng"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4 md:space-y-5"
            >
              <div className="rounded-2xl border border-surface-container-high/55 bg-surface-container-low/25 p-4 md:p-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
                  <div className="space-y-1 min-w-0">
                    <label htmlFor="collector-email" className={labelClass}>
                      Email <span className="text-error">*</span>
                    </label>
                    <input
                      id="collector-email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      disabled={submitting}
                      placeholder="Nhập email"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <label htmlFor="collector-password" className={labelClass}>
                      Mật khẩu <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="collector-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={form.password}
                        onChange={(e) => setField("password", e.target.value)}
                        onBlur={() =>
                          setTouched((t) => ({ ...t, password: true }))
                        }
                        disabled={submitting}
                        placeholder="Nhập mật khẩu"
                        aria-invalid={Boolean(passwordError)}
                        className={`${inputClass} pr-11 ${passwordError ? "border-error focus:ring-error/25" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        disabled={submitting}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors disabled:opacity-50"
                        aria-label={
                          showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {passwordError ? (
                      <p className="text-xs font-semibold text-error">
                        {passwordError}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <label htmlFor="collector-confirm" className={labelClass}>
                      Xác nhận mật khẩu <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="collector-confirm"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={form.confirmPassword}
                        onChange={(e) =>
                          setField("confirmPassword", e.target.value)
                        }
                        onBlur={() =>
                          setTouched((t) => ({ ...t, confirmPassword: true }))
                        }
                        disabled={submitting}
                        placeholder="Nhập lại mật khẩu"
                        aria-invalid={Boolean(confirmPasswordError)}
                        className={`${inputClass} pr-11 ${confirmPasswordError ? "border-error focus:ring-error/25" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        disabled={submitting}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors disabled:opacity-50"
                        aria-label={
                          showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {confirmPasswordError ? (
                      <p className="text-xs font-semibold text-error">
                        {confirmPasswordError}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <label htmlFor="collector-display" className={labelClass}>
                      Tên hiển thị <span className="text-error">*</span>
                    </label>
                    <input
                      id="collector-display"
                      type="text"
                      value={form.displayName}
                      onChange={(e) => setField("displayName", e.target.value)}
                      disabled={submitting}
                      placeholder="Nhập tên hiển thị"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <label htmlFor="collector-fullname" className={labelClass}>
                      Họ và tên <span className="text-error">*</span>
                    </label>
                    <input
                      id="collector-fullname"
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setField("fullName", e.target.value)}
                      disabled={submitting}
                      placeholder="Nhập họ và tên"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <label htmlFor="collector-phone" className={labelClass}>
                      Số điện thoại <span className="text-error">*</span>
                    </label>
                    <input
                      id="collector-phone"
                      type="tel"
                      inputMode="tel"
                      value={form.phoneNumber}
                      onChange={(e) => setField("phoneNumber", e.target.value)}
                      disabled={submitting}
                      placeholder="Nhập số điện thoại"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1 min-w-0 lg:col-span-3">
                    <label htmlFor="collector-address" className={labelClass}>
                      Địa chỉ <span className="text-error">*</span>
                    </label>
                    <textarea
                      id="collector-address"
                      rows={3}
                      value={form.address}
                      onChange={(e) => setField("address", e.target.value)}
                      disabled={submitting}
                      placeholder="Nhập địa chỉ"
                      className={`${inputClass} resize-y min-h-18 font-bold`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 md:gap-4 pt-4 border-t border-surface-container-high/50 bg-surface-container-lowest">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 py-3 md:py-3.5 rounded-xl font-black text-sm bg-surface-container-low hover:bg-surface-container-high transition-all order-2 sm:order-1 disabled:opacity-60"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 md:py-3.5 rounded-xl font-black text-sm bg-primary text-white shadow-lg shadow-primary/25 active:scale-[0.98] transition-all order-1 sm:order-2 inline-flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                      Đang tạo…
                    </>
                  ) : (
                    "Tạo tài khoản"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
          </div>
        )}
      </AnimatePresence>

      {submitToast ? (
        <div
          role="status"
          className={`fixed right-4 top-24 z-210 w-[min(92vw,24rem)] rounded-2xl border px-4 py-3 shadow-xl ${
            submitToast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <div className="flex items-start gap-3">
            {submitToast.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            )}
            <div className="space-y-1">
              <p className="text-sm font-bold">{submitToast.title}</p>
              <p className="text-xs leading-relaxed opacity-90">
                {submitToast.message}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>,
    document.body,
  );
}
