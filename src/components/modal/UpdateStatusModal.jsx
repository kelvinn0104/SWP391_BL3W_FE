import { useEffect, useId, useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { updateCollectorJobStatus } from '../../api/collectorJobApi';

/** Khớp WasteReportStatus — PATCH collector/job cho phép từ Assigned → Accepted hoặc Pending */
const STATUS_OPTIONS = [
  { value: 'Assigned', label: 'Đã phân công' },
  { value: 'Accepted', label: 'Đang trên đường' },
];

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - reportId: number | string — mã báo cáo (report)
 * - reportTitle?: string — hiển thị tiêu đề phụ (tuỳ chọn)
 * - initialStatus?: 'Assigned' | 'Accepted'
 * - onUpdated?: (jobDetail) => void — sau khi PATCH thành công
 */
export default function UpdateStatusModal({
  open,
  onClose,
  reportId,
  reportTitle,
  initialStatus = 'Assigned',
  onUpdated,
}) {
  const modalId = useId();
  const titleId = useMemo(() => `${modalId}-title`, [modalId]);
  const [status, setStatus] = useState(initialStatus);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!open) return;
    setStatus(initialStatus);
    setNote('');
    setSubmitting(false);
    setSubmitError('');
  }, [open, initialStatus]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const numericReportId = useMemo(() => {
    const n = Number(reportId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [reportId]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    if (!numericReportId) {
      setSubmitError('Không xác định được mã báo cáo.');
      return;
    }

    setSubmitting(true);
    try {
      const trimmed = note.trim();
      const jobDetail = await updateCollectorJobStatus(numericReportId, {
        status,
        note: trimmed ? trimmed : undefined,
      });
      onUpdated?.(jobDetail);
      onClose?.();
    } catch (error) {
      setSubmitError(error?.message || 'Không thể cập nhật trạng thái. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  const heading = reportTitle?.trim() || 'Cập nhật trạng thái';

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-[1px] px-4 py-6 sm:py-10 flex justify-center items-start overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="mt-20 sm:mt-24 w-full max-w-lg rounded-3xl border border-surface-container-high/70 bg-surface-container-lowest p-6 sm:p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 id={titleId} className="text-xl font-extrabold text-on-surface">
              Cập nhật trạng thái
            </h3>
            <p className="text-sm text-on-surface-variant">{heading}</p>
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
            <label htmlFor={`${modalId}-status`} className="text-sm font-bold text-on-surface">
              Trạng thái
            </label>
            <select
              id={`${modalId}-status`}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={submitting}
              className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-on-surface-variant">
              Khi việc đang ở trạng thái đã phân công, chọn &quot;Đang trên đường&quot; để xác nhận đã nhận việc (đồng ý thu gom).
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor={`${modalId}-note`} className="text-sm font-bold text-on-surface">
              Ghi chú
            </label>
            <textarea
              id={`${modalId}-note`}
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={submitting}
              placeholder="Nhập ghi chú (tuỳ chọn)..."
              className="w-full resize-y min-h-[110px] rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            />
          </div>

          {submitError ? (
            <p className="text-xs text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}

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
                  Đang lưu...
                </>
              ) : (
                'Lưu'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
