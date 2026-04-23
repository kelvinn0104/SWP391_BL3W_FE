import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  ImageUp,
  Loader2,
  Save,
  UserCog,
  X,
} from "lucide-react";
import { updateAccount } from "../../api/userApi";

const labelClass =
  "text-[10px] font-black uppercase text-on-surface-variant/40 ml-1 tracking-widest opacity-70";

const inputClass =
  "w-full px-4 md:px-5 py-2.5 md:py-3 rounded-xl bg-surface-container-low border border-surface-container-high font-bold text-sm outline-none focus:ring-2 focus:ring-primary/25 transition-all shadow-sm disabled:opacity-60";

const initialForm = () => ({
  displayName: "",
  fullName: "",
  phoneNumber: "",
  address: "",
  gender: "",
  dateOfBirth: "",
  language: "",
  avatarUrl: "",
  avatarFile: null,
});

function toInputDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return "";
  }
}

export default function UpdateCollectorProfileModal({
  open,
  onClose,
  collector,
  onUpdated,
}) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitToast, setSubmitToast] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const collectorId = collector?.id ?? collector?.userId ?? collector?.UserId;

  useEffect(() => {
    if (!open) return;
    setSubmitToast(null);
    setSubmitting(false);

    setForm((prev) => ({
      ...prev,
      displayName: collector?.displayName ?? collector?.DisplayName ?? "",
      fullName: collector?.fullName ?? collector?.FullName ?? "",
      phoneNumber: collector?.phoneNumber ?? collector?.PhoneNumber ?? "",
      address: collector?.address ?? collector?.Address ?? "",
      gender: collector?.gender ?? collector?.Gender ?? "",
      dateOfBirth: toInputDate(
        collector?.dateOfBirth ?? collector?.DateOfBirth,
      ),
      language: collector?.language ?? collector?.Language ?? "",
      avatarUrl: collector?.avatarUrl ?? collector?.AvatarUrl ?? "",
      avatarFile: null,
    }));

    setPreviewUrl("");
  }, [open, collector]);

  useEffect(() => {
    if (!submitToast) return undefined;
    const timer = window.setTimeout(() => setSubmitToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [submitToast]);

  useEffect(() => {
    if (!form.avatarFile) return undefined;
    const url = URL.createObjectURL(form.avatarFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [form.avatarFile]);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const avatarPreview = useMemo(() => {
    if (previewUrl) return previewUrl;
    if (form.avatarUrl) return form.avatarUrl;
    return "";
  }, [form.avatarUrl, previewUrl]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!collectorId) {
      setSubmitToast({
        type: "error",
        title: "Thiếu ID tài khoản",
        message: "Không tìm thấy id của người thu gom để cập nhật.",
      });
      return;
    }

    const displayName = form.displayName.trim();
    const fullName = form.fullName.trim();
    const phoneNumber = form.phoneNumber.trim();
    const address = form.address.trim();

    if (!displayName || !fullName || !phoneNumber || !address) {
      setSubmitToast({
        type: "error",
        title: "Thiếu thông tin",
        message: "Vui lòng điền đầy đủ các trường bắt buộc.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        DisplayName: displayName,
        FullName: fullName,
        PhoneNumber: phoneNumber,
        Address: address,
        Gender: form.gender || null,
        DateOfBirth: form.dateOfBirth || null,
        Language: form.language || null,
      };

      await updateAccount(collectorId, payload);
      setSubmitToast({
        type: "success",
        title: "Cập nhật thành công",
        message: "Thông tin người thu gom đã được cập nhật.",
      });
      window.setTimeout(() => {
        onUpdated?.();
        onClose?.();
      }, 700);
    } catch (error) {
      let msg =
        error?.message || "Không cập nhật được tài khoản. Vui lòng thử lại.";
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
        title: "Cập nhật thất bại",
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
            aria-labelledby="update-collector-title"
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
                    id="update-collector-title"
                    className="text-lg md:text-2xl font-black text-on-surface flex items-center gap-2 md:gap-3"
                  >
                    <UserCog className="text-primary w-6 h-6 shrink-0" />
                    <span className="truncate">
                      Cập nhật thông tin người thu gom
                    </span>
                  </h2>
                  <p className="text-xs md:text-sm font-bold text-on-surface-variant/80 mt-1 ml-0 opacity-70 leading-snug">
                    Nhập thông tin để cập nhật thông tin hồ sơ của người thu
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
                      <label htmlFor="upd-display" className={labelClass}>
                        Tên hiển thị <span className="text-error">*</span>
                      </label>
                      <input
                        id="upd-display"
                        type="text"
                        value={form.displayName}
                        onChange={(e) =>
                          setField("displayName", e.target.value)
                        }
                        disabled={submitting}
                        placeholder="Nhập tên hiển thị"
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <label htmlFor="upd-fullname" className={labelClass}>
                        Họ và tên <span className="text-error">*</span>
                      </label>
                      <input
                        id="upd-fullname"
                        type="text"
                        value={form.fullName}
                        onChange={(e) => setField("fullName", e.target.value)}
                        disabled={submitting}
                        placeholder="Nhập họ và tên"
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <label htmlFor="upd-phone" className={labelClass}>
                        Số điện thoại <span className="text-error">*</span>
                      </label>
                      <input
                        id="upd-phone"
                        type="tel"
                        inputMode="tel"
                        value={form.phoneNumber}
                        onChange={(e) =>
                          setField("phoneNumber", e.target.value)
                        }
                        disabled={submitting}
                        placeholder="Nhập số điện thoại"
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <label htmlFor="upd-gender" className={labelClass}>
                        Giới tính
                      </label>
                      <select
                        id="upd-gender"
                        value={form.gender}
                        onChange={(e) => setField("gender", e.target.value)}
                        disabled={submitting}
                        className={inputClass}
                      >
                        <option value="">—</option>
                        <option value="Male">Nam</option>
                        <option value="Female">Nữ</option>
                      </select>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <label htmlFor="upd-dob" className={labelClass}>
                        Ngày sinh
                      </label>
                      <input
                        id="upd-dob"
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(e) =>
                          setField("dateOfBirth", e.target.value)
                        }
                        disabled={submitting}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <label htmlFor="upd-language" className={labelClass}>
                        Ngôn ngữ
                      </label>
                      <input
                        id="upd-language"
                        type="text"
                        value={form.language}
                        onChange={(e) => setField("language", e.target.value)}
                        disabled={submitting}
                        placeholder="Tiếng Việt / Tiếng Anh / ..."
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1 min-w-0 lg:col-span-3">
                      <label htmlFor="upd-address" className={labelClass}>
                        Địa chỉ <span className="text-error">*</span>
                      </label>
                      <textarea
                        id="upd-address"
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
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 md:py-3.5 rounded-xl font-black text-sm bg-primary text-white shadow-lg shadow-primary/25 active:scale-[0.98] transition-all order-1 sm:order-2 inline-flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                        Đang lưu…
                      </>
                    ) : (
                      <>
                        <Save className="w-4.5 h-4.5" />
                        Lưu thay đổi
                      </>
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
