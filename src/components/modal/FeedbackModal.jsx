import { useEffect, useId, useMemo, useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';

const DEFAULT_REASONS = [
  'Thu gom không đúng địa điểm',
  'Thu gom thiếu / không đúng loại rác',
  'Trạng thái cập nhật sai',
  'Nhân viên thu gom thái độ không phù hợp',
  'Khác',
];

export default function FeedbackModal({
  open,
  onClose,
  reportId,
  reportStatusLabel,
  reasons = DEFAULT_REASONS,
}) {
  const modalId = useId();
  const [reason, setReason] = useState(reasons[0] ?? '');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const titleId = useMemo(() => `${modalId}-title`, [modalId]);
  const descId = useMemo(() => `${modalId}-desc`, [modalId]);

  useEffect(() => {
    if (!open) return;
    setReason(reasons[0] ?? '');
    setMessage('');
    setSubmitting(false);
  }, [open, reasons]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!reason) return;
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="Đóng"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl rounded-3xl border border-surface-container-high/70 bg-surface-container-lowest botanical-shadow overflow-hidden">
        <div className="flex items-start justify-between gap-4 p-6 sm:p-7 border-b border-surface-container-high/60">
          <div className="space-y-1.5">
            <p className="inline-flex items-center gap-2 text-rose-700 font-extrabold text-sm">
              <AlertTriangle className="w-4 h-4" />
              Khiếu nại
            </p>
            <h2 id={titleId} className="text-xl sm:text-2xl font-extrabold text-on-surface">
              Gửi phản hồi cho báo cáo
            </h2>
            <p id={descId} className="text-sm text-on-surface-variant">
              Báo cáo: <span className="font-bold text-on-surface">{reportId || '—'}</span>
              {reportStatusLabel ? (
                <>
                  {' '}
                  • Trạng thái: <span className="font-bold text-on-surface">{reportStatusLabel}</span>
                </>
              ) : null}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-2xl border border-surface-container-high bg-surface px-3 py-2 text-on-surface-variant hover:text-on-surface hover:border-primary/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 sm:p-7 space-y-5">
          <div className="space-y-2">
            <label htmlFor={`${modalId}-reason`} className="text-sm font-bold text-on-surface">
              Lý do khiếu nại
            </label>
            <select
              id={`${modalId}-reason`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            >
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor={`${modalId}-message`} className="text-sm font-bold text-on-surface">
              Nội dung chi tiết
            </label>
            <textarea
              id={`${modalId}-message`}
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mô tả chi tiết vấn đề bạn gặp phải…"
              className="w-full resize-y min-h-[130px] rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            />
            <p className="text-xs text-on-surface-variant">
              Mẹo: thêm mốc thời gian, địa điểm, hoặc thông tin liên quan để xử lý nhanh hơn.
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-2xl border border-surface-container-high px-5 py-3 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 disabled:pointer-events-none text-white px-6 py-3 text-sm font-extrabold shadow-lg shadow-rose-600/20 transition-all active:scale-[0.99]"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Đang gửi…' : 'Gửi khiếu nại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

