import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { cancelWasteReport } from '../../api/WasteReportapi';

export default function CancelModal({ open, report, onClose, onCanceled }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!open) {
      setReason('');
      setSubmitting(false);
      setSubmitError('');
    }
  }, [open]);

  if (!open) return null;

  const reportTitle = report?.title || 'Báo cáo';
  const reportId = report?.id || '---';
  const reasonValue = reason.trim();

  async function handleConfirmCancel() {
    if (!report?.id) {
      setSubmitError('Không xác định được mã báo cáo để hủy.');
      return;
    }
    if (!reasonValue) {
      setSubmitError('Vui lòng nhập lý do hủy.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const response = await cancelWasteReport(report.id, reasonValue);
      const currentStatus = response?.currentStatus || response?.status || 'Canceled';
      onCanceled?.(report.id, currentStatus);
      onClose?.();
    } catch (error) {
      setSubmitError(error?.message || 'Không thể hủy báo cáo. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-[1px] px-4 py-6 sm:py-10 flex justify-center items-start overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="mt-20 sm:mt-24 w-full max-w-lg rounded-3xl border border-surface-container-high/70 bg-surface-container-lowest p-6 sm:p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-2 text-sm font-black text-rose-600">
              <AlertTriangle className="w-4 h-4" />
              Hủy báo cáo
            </p>
            <h3 className="text-xl font-extrabold text-on-surface">{reportTitle}</h3>
            <p className="text-sm text-on-surface-variant">Mã report: {reportId}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-surface-container-high text-on-surface-variant hover:text-on-surface hover:border-primary/40 transition-colors"
            aria-label="Đóng pop-up hủy báo cáo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-2">
          <label htmlFor="cancel-report-reason" className="text-sm font-bold text-on-surface">
            Lý do hủy
          </label>
          <textarea
            id="cancel-report-reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={submitting}
            placeholder="Nhập lý do bạn muốn hủy báo cáo này..."
            className="w-full resize-y min-h-[110px] rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
          />
          {submitError ? (
            <p className="text-xs text-red-600">{submitError}</p>
          ) : (
            <p className="text-xs text-on-surface-variant">Nhập lý do để xác nhận hủy báo cáo.</p>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-2xl border border-surface-container-high px-5 py-3 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-2xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 text-sm font-bold shadow-lg shadow-rose-700/20 transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Đang hủy...
              </>
            ) : (
              'Xác nhận hủy'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
