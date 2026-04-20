import { useEffect, useId, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  PackageCheck,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { completeCollectorJob } from "../../api/collectorJobApi";

function resolveReportId(taskId, reportIdProp) {
  if (reportIdProp != null) {
    const n = Number(reportIdProp);
    if (Number.isFinite(n) && n > 0) return n;
  }
  const digits = String(taskId ?? "").replace(/\D/g, "");
  const n = digits ? Number(digits) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default function UploadImageModal({
  open,
  onClose,
  taskId,
  reportId: reportIdProp,
  taskTitle,
  onSuccess,
}) {
  const modalId = useId();
  const titleId = `${modalId}-title`;
  const descId = `${modalId}-desc`;

  const [proofFiles, setProofFiles] = useState([]);
  const [completionNote, setCompletionNote] = useState("");
  const [completedAtUtc, setCompletedAtUtc] = useState("");
  const [weightRows, setWeightRows] = useState([{ itemId: "", weight: "" }]);

  const [submitting, setSubmitting] = useState(false);
  const [submitToast, setSubmitToast] = useState(null);
  const [dragOverProof, setDragOverProof] = useState(false);

  const previewUrls = useMemo(
    () => proofFiles.map((file) => URL.createObjectURL(file)),
    [proofFiles],
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  useEffect(() => {
    if (!open) return;
    setProofFiles([]);
    setCompletionNote("");
    setCompletedAtUtc("");
    setWeightRows([{ itemId: "", weight: "" }]);
    setSubmitting(false);
    setSubmitToast(null);
    setDragOverProof(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!submitToast) return undefined;

    const timer = window.setTimeout(() => {
      setSubmitToast(null);
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [submitToast]);

  useEffect(() => {
    if (!submitToast || submitToast.type !== "success") return undefined;

    const timer = window.setTimeout(() => {
      onSuccess?.();
      onClose?.();
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [submitToast, onSuccess, onClose]);

  function addFilesTo(setter, fileList) {
    const next = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (next.length === 0) return;
    setter((prev) => [...prev, ...next]);
    setSubmitToast(null);
  }

  function pickImages(e, setter) {
    const list = e.target.files;
    if (!list?.length) return;
    addFilesTo(setter, list);
    e.target.value = "";
  }

  function dropFactory(setter, setDrag) {
    return (e) => {
      e.preventDefault();
      setDrag(false);
      if (e.dataTransfer.files?.length) addFilesTo(setter, e.dataTransfer.files);
    };
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitToast(null);

    const reportId = resolveReportId(taskId, reportIdProp);
    if (!reportId) {
      setSubmitToast({
        type: "error",
        title: "Thiếu mã báo cáo",
        message: "Không xác định được mã báo cáo để hoàn tất thu gom.",
      });
      return;
    }

    const hasProofImages = proofFiles.some((f) => f?.size > 0);
    if (!hasProofImages) {
      setSubmitToast({
        type: "error",
        title: "Thiếu ảnh minh chứng",
        message: "Vui lòng tải ít nhất một ảnh (ProofImages).",
      });
      return;
    }

    const pairs = [];
    for (const row of weightRows) {
      const idRaw = row.itemId.trim();
      const wRaw = row.weight.trim();
      if (!idRaw && !wRaw) continue;
      const wasteId = Number(idRaw);
      const weight = Number(wRaw.replace(",", "."));
      if (!Number.isFinite(wasteId) || wasteId <= 0) {
        setSubmitToast({
          type: "error",
          title: "Mã dòng rác không hợp lệ",
          message: "Mỗi dòng đã nhập cần có mã dòng rác (số nguyên dương).",
        });
        return;
      }
      if (!Number.isFinite(weight) || weight < 0) {
        setSubmitToast({
          type: "error",
          title: "Khối lượng không hợp lệ",
          message: "Khối lượng thực tế phải là số không âm.",
        });
        return;
      }
      pairs.push({ wasteReportItemId: wasteId, actualWeightKg: weight });
    }

    if (pairs.length === 0) {
      setSubmitToast({
        type: "error",
        title: "Thiếu khối lượng theo dòng",
        message:
          "Vui lòng nhập ít nhất một cặp mã dòng rác và khối lượng thực tế.",
      });
      return;
    }

    const wasteReportItemIds = pairs.map((p) => p.wasteReportItemId);
    const actualWeightKgs = pairs.map((p) => p.actualWeightKg);

    let completedIso;
    if (completedAtUtc.trim() === "") {
      completedIso = new Date().toISOString();
    } else {
      const d = new Date(completedAtUtc);
      if (Number.isNaN(d.getTime())) {
        setSubmitToast({
          type: "error",
          title: "Thời điểm không hợp lệ",
          message: "Thời điểm hoàn tất không hợp lệ. Kiểm tra lại ô thời gian.",
        });
        return;
      }
      completedIso = d.toISOString();
    }

    const trimmedNote = completionNote.trim();
    const completionNotePayload = trimmedNote ? trimmedNote : undefined;

    setSubmitting(true);
    try {
      await completeCollectorJob(reportId, {
        proofImages: proofFiles,
        completionNote: completionNotePayload,
        completedAtUtc: completedIso,
        wasteReportItemIds,
        actualWeightKgs,
      });
      setSubmitToast({
        type: "success",
        title: "Hoàn tất thu gom thành công",
        message: "Dữ liệu hoàn tất đã được gửi.",
      });
    } catch (err) {
      setSubmitToast({
        type: "error",
        title: "Hoàn tất thất bại",
        message:
          err?.message ||
          "Không thể hoàn tất thu gom. Vui lòng thử lại.",
      });
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
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="Đóng"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-3xl border border-surface-container-high/70 bg-surface-container-lowest botanical-shadow overflow-hidden max-h-[min(92vh,720px)] flex flex-col">
        <div className="flex items-start justify-between gap-4 p-6 sm:p-7 border-b border-surface-container-high/60 shrink-0">
          <div className="space-y-1.5 min-w-0">
            <p className="inline-flex items-center gap-2 text-primary font-extrabold text-sm">
              <PackageCheck className="w-4 h-4 shrink-0" />
              Xác nhận thu gom
            </p>
            <h2
              id={titleId}
              className="text-xl sm:text-2xl font-extrabold text-on-surface"
            >
              Hoàn tất thu gom
            </h2>
            <p id={descId} className="text-sm text-on-surface-variant leading-relaxed">
              Form <span className="font-mono text-xs">multipart/form-data</span>: ProofImages, CompletionNote,
              CompletedAtUtc, WasteReportItemIds và ActualWeightKgs (hai mảng id và kg cùng thứ tự).
            </p>
            {taskId ? (
              <p className="text-xs font-semibold text-on-surface-variant pt-1">
                Mã:{" "}
                <span className="font-mono text-on-surface">{taskId}</span>
                {taskTitle ? (
                  <>
                    {" "}
                    • <span className="text-on-surface">{taskTitle}</span>
                  </>
                ) : null}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-2xl border border-surface-container-high bg-surface px-3 py-2 text-on-surface-variant hover:text-on-surface hover:border-primary/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest shrink-0"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="p-6 sm:p-7 space-y-5 overflow-y-auto flex-1 min-h-0"
        >
          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface inline-flex items-center gap-2">
              <ImagePlus className="w-4 h-4 text-primary" />
              Ảnh minh chứng{" "}
              <span className="text-xs font-mono font-normal text-on-surface-variant">
                (ProofImages)
              </span>
            </label>
            <p className="text-xs text-on-surface-variant">
              Mỗi file gửi một phần cùng tên trường ProofImages (multipart/form-data).
            </p>
            <label
              htmlFor={`${modalId}-proof`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverProof(true);
              }}
              onDragLeave={() => setDragOverProof(false)}
              onDrop={dropFactory(setProofFiles, setDragOverProof)}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors ${
                dragOverProof
                  ? "border-primary bg-primary/8"
                  : "border-surface-container-high bg-surface-container-low/50 hover:border-primary/40 hover:bg-primary/4"
              }`}
            >
              <Upload className="w-7 h-7 text-primary/80" />
              <span className="text-sm font-bold text-on-surface">Chọn hoặc kéo thả ảnh</span>
              <span className="text-xs text-on-surface-variant">PNG, JPG — có thể chọn nhiều ảnh</span>
            </label>
            <input
              id={`${modalId}-proof`}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => pickImages(e, setProofFiles)}
            />
            {proofFiles.length > 0 ? (
              <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2 list-none p-0 m-0">
                {proofFiles.map((file, index) => (
                  <li
                    key={`proof-${file.name}-${index}-${file.lastModified}`}
                    className="relative aspect-square rounded-xl overflow-hidden border border-surface-container-high bg-surface-container-low group"
                  >
                    <img
                      src={previewUrls[index]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setProofFiles((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="absolute top-1 right-1 inline-flex items-center justify-center rounded-lg bg-on-surface/70 text-white p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      aria-label={`Xóa ảnh ${index + 1}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`${modalId}-completion-note`}
              className="text-sm font-bold text-on-surface"
            >
              Ghi chú hoàn tất{" "}
              <span className="text-xs font-mono font-normal text-on-surface-variant">
                (CompletionNote)
              </span>
            </label>
            <textarea
              id={`${modalId}-completion-note`}
              name="CompletionNote"
              rows={3}
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              placeholder="Nhập ghi chú khi hoàn tất (tuỳ chọn)…"
              className="w-full resize-y min-h-[88px] rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor={`${modalId}-completed-at`} className="text-sm font-bold text-on-surface">
              Thời điểm hoàn tất{" "}
              <span className="text-xs font-mono font-normal text-on-surface-variant">
                (CompletedAtUtc)
              </span>
            </label>
            <input
              id={`${modalId}-completed-at`}
              type="datetime-local"
              value={completedAtUtc}
              onChange={(e) => setCompletedAtUtc(e.target.value)}
              className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            />
            <p className="text-xs text-on-surface-variant">
              ISO 8601 khi gửi API. Để trống sẽ dùng thời điểm hiện tại (UTC).
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-sm font-bold text-on-surface">
                Mã dòng rác / Khối lượng (kg)
              </span>
              <span className="text-[11px] font-mono text-on-surface-variant sm:text-xs">
                WasteReportItemIds / ActualWeightKgs
              </span>
              <button
                type="button"
                onClick={() =>
                  setWeightRows((prev) => [...prev, { itemId: "", weight: "" }])
                }
                className="inline-flex items-center gap-1 rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/15 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm dòng
              </button>
            </div>
            <p className="text-xs text-on-surface-variant">
              Mỗi dòng gồm một mã dòng rác và một khối lượng thực tế (kg), khớp với báo cáo.
            </p>
            <div className="space-y-2">
              {weightRows.map((row, index) => (
                <div
                  key={`row-${index}`}
                  className="flex flex-col sm:flex-row gap-2 sm:items-center"
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    value={row.itemId}
                    onChange={(e) => {
                      const v = e.target.value;
                      setWeightRows((prev) =>
                        prev.map((r, i) => (i === index ? { ...r, itemId: v } : r)),
                      );
                    }}
                    placeholder="Mã dòng rác"
                    className="flex-1 min-w-0 rounded-2xl border border-surface-container-high bg-surface px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.weight}
                    onChange={(e) => {
                      const v = e.target.value;
                      setWeightRows((prev) =>
                        prev.map((r, i) => (i === index ? { ...r, weight: v } : r)),
                      );
                    }}
                    placeholder="Khối lượng (kg)"
                    className="flex-1 min-w-0 sm:max-w-[160px] rounded-2xl border border-surface-container-high bg-surface px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary"
                  />
                  {weightRows.length > 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setWeightRows((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="sm:self-stretch inline-flex items-center justify-center rounded-xl border border-surface-container-high px-3 py-2 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface text-sm font-bold shrink-0"
                      aria-label="Xóa dòng"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
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
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:pointer-events-none text-white px-6 py-3 text-sm font-extrabold shadow-lg shadow-primary/20 transition-all active:scale-[0.99]"
            >
              <PackageCheck className="w-4 h-4" />
              {submitting ? "Đang gửi…" : "Xác nhận hoàn tất"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
