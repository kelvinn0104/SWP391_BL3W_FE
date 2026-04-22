import { useEffect, useId, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { acceptCollectorJob } from "../../api/collectorJobApi";

const TOAST_AUTO_HIDE_MS = 2600;
const TOAST_SUCCESS_CLOSE_MS = 2200;

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - reportId: number | string — mã báo cáo (path)
 * - reportTitle?: string — tiêu đề phụ
 * - onUpdated?: (jobDetail) => void — sau khi PATCH thành công
 */
export default function UpdateStatusModal({
  open,
  onClose,
  reportId,
  reportTitle,
  onUpdated,
}) {
  const modalId = useId();
  const titleId = useMemo(() => `${modalId}-title`, [modalId]);
  const noteId = `${modalId}-note`;
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

    const timer = window.setTimeout(() => {
      onClose?.();
    }, TOAST_SUCCESS_CLOSE_MS);

    return () => window.clearTimeout(timer);
  }, [submitToast, onClose]);

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
      const jobDetail = await acceptCollectorJob(numericReportId, {
        note: trimmed ? trimmed : undefined,
      });
      onUpdated?.(jobDetail);
      setSubmitToast({
        type: "success",
        title: "Xác nhận nhận việc thành công",
        message: "Bạn đã xác nhận nhận công việc thu gom.",
      });
    } catch (error) {
      setSubmitToast({
        type: "error",
        title: "Xác nhận thất bại",
        message:
          error?.message ||
          "Không thể xác nhận nhận việc. Vui lòng thử lại.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const heading = reportTitle?.trim() || "Công việc thu gom";

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-[1px] px-4 py-6 sm:py-10 flex justify-center items-start overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={`${modalId}-desc`}
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
          <div className="space-y-1 min-w-0">
            <h3 id={titleId} className="text-xl font-extrabold text-on-surface">
              Xác nhận nhận việc
            </h3>
            <p className="text-sm text-on-surface-variant font-bold">{heading}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-surface-container-high text-on-surface-variant hover:text-on-surface hover:border-primary/40 transition-colors disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor={noteId}
              className="text-sm font-bold text-on-surface"
            >
              Ghi chú
            </label>
            <textarea
              id={noteId}
              name="note"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={submitting}
              placeholder="Nhập ghi chú kèm khi xác nhận (tuỳ chọn)…"
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
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-white hover:opacity-95 transition-opacity disabled:opacity-60 shadow-lg shadow-primary/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang gửi…
                </>
              ) : (
                "Xác nhận"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
