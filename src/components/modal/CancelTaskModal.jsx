import { useEffect, useId, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { cancelCollectorJob } from "../../api/collectorJobApi";

/** Đồng bộ với UploadImageModal.jsx */
const TOAST_AUTO_HIDE_MS = 2600;
const TOAST_SUCCESS_CLOSE_MS = 2200;

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - reportId: number | string | null — mã báo cáo
 * - onRejected?: (jobDetail) => void — sau khi PATCH thành công
 */
export default function CancelTaskModal({
  open,
  onClose,
  reportId,
  onRejected,
}) {
  const modalId = useId();
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitToast, setSubmitToast] = useState(null);

  useEffect(() => {
    if (!open) return;
    setNote("");
    setSubmitting(false);
    setSubmitToast(null);
  }, [open]);

  useEffect(() => {
    if (!submitToast) return undefined;

    const timer = window.setTimeout(() => {
      setSubmitToast(null);
    }, TOAST_AUTO_HIDE_MS);

    return () => window.clearTimeout(timer);
  }, [submitToast]);

  useEffect(() => {
    if (!submitToast || submitToast.type !== "success") return undefined;

    const detail = submitToast.jobDetail;
    const timer = window.setTimeout(() => {
      onRejected?.(detail);
      onClose?.();
    }, TOAST_SUCCESS_CLOSE_MS);

    return () => window.clearTimeout(timer);
  }, [submitToast, onRejected, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const numericReportId = useMemo(() => {
    const n = Number(reportId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [reportId]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitToast(null);
    if (!numericReportId) {
      setSubmitToast({
        type: "error",
        title: "Thiếu mã báo cáo",
        message: "Không xác định được mã báo cáo để gửi yêu cầu.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const trimmed = note.trim();
      const jobDetail = await cancelCollectorJob(numericReportId, {
        note: trimmed ? trimmed : undefined,
      });
      setSubmitToast({
        type: "success",
        title: "Đã từ chối công việc",
        message: "Báo cáo đã được cập nhật theo yêu cầu từ chối.",
        jobDetail,
      });
    } catch (error) {
      setSubmitToast({
        type: "error",
        title: "Từ chối thất bại",
        message:
          error?.message || "Không thể từ chối công việc. Vui lòng thử lại.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-[1px] px-4 py-6 sm:py-10 flex justify-center items-start overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Từ chối công việc"
      onClick={onClose}
    >
      {submitToast ? (
        <div
          role="status"
          onClick={(e) => e.stopPropagation()}
          className={`fixed right-4 top-24 z-[100] w-[min(92vw,24rem)] rounded-2xl border px-4 py-3 shadow-xl ${
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
      <div
        className="mt-20 sm:mt-24 w-full max-w-lg rounded-3xl border border-surface-container-high/70 bg-surface-container-lowest p-6 sm:p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-2 text-lg font-extrabold text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              Từ chối công việc
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-surface-container-high text-on-surface-variant hover:text-on-surface hover:border-primary/40 transition-colors disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor={`${modalId}-note`}
              className="text-sm font-bold text-on-surface"
            >
              Ghi chú
            </label>
            <textarea
              id={`${modalId}-note`}
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={submitting}
              placeholder="Nhập lý do hoặc ghi chú (tuỳ chọn)..."
              className="w-full resize-y min-h-[110px] rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-2xl border border-surface-container-high py-3 text-sm font-bold text-on-surface hover:bg-surface-container-high/40 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-60 shadow-md shadow-red-600/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Xác nhận từ chối"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
