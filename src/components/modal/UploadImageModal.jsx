import { useEffect, useId, useMemo, useState } from "react";
import { ImagePlus, PackageCheck, Plus, Upload, X } from "lucide-react";
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

  const [imageFiles, setImageFiles] = useState([]);
  const [proofFiles, setProofFiles] = useState([]);
  const [note, setNote] = useState("");
  const [completionNote, setCompletionNote] = useState("");
  const [completedAtUtc, setCompletedAtUtc] = useState("");
  const [weightRows, setWeightRows] = useState([{ itemId: "", weight: "" }]);

  const [submitting, setSubmitting] = useState(false);
  const [fileError, setFileError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [dragOverImages, setDragOverImages] = useState(false);
  const [dragOverProof, setDragOverProof] = useState(false);

  const previewImages = useMemo(
    () => imageFiles.map((file) => URL.createObjectURL(file)),
    [imageFiles],
  );
  const previewProof = useMemo(
    () => proofFiles.map((file) => URL.createObjectURL(file)),
    [proofFiles],
  );

  useEffect(() => {
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url));
      previewProof.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImages, previewProof]);

  useEffect(() => {
    if (!open) return;
    setImageFiles([]);
    setProofFiles([]);
    setNote("");
    setCompletionNote("");
    setCompletedAtUtc("");
    setWeightRows([{ itemId: "", weight: "" }]);
    setSubmitting(false);
    setFileError("");
    setSubmitError("");
    setDragOverImages(false);
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

  function addFilesTo(setter, fileList) {
    const next = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (next.length === 0) return;
    setter((prev) => [...prev, ...next]);
    setFileError("");
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
    setFileError("");
    setSubmitError("");

    const reportId = resolveReportId(taskId, reportIdProp);
    if (!reportId) {
      setSubmitError("Không xác định được mã báo cáo để hoàn tất.");
      return;
    }

    const hasProof = proofFiles.some((f) => f?.size > 0);
    const hasImages = imageFiles.some((f) => f?.size > 0);
    if (!hasProof && !hasImages) {
      setFileError("Vui lòng tải ít nhất một ảnh (ảnh minh chứng hoặc ảnh đính kèm).");
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
        setSubmitError("Mỗi dòng cần mã dòng rác hợp lệ.");
        return;
      }
      if (!Number.isFinite(weight) || weight < 0) {
        setSubmitError("Khối lượng thực tế phải là số không âm.");
        return;
      }
      pairs.push({ wasteReportItemId: wasteId, actualWeightKg: weight });
    }

    if (pairs.length === 0) {
      setSubmitError("Vui lòng nhập ít nhất một cặp WasteReportItemId và khối lượng thực tế.");
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
        setSubmitError("Thời điểm hoàn tất không hợp lệ.");
        return;
      }
      completedIso = d.toISOString();
    }

    setSubmitting(true);
    try {
      await completeCollectorJob(reportId, {
        images: imageFiles,
        proofImages: proofFiles,
        note: note.trim() || undefined,
        completionNote: completionNote.trim() || undefined,
        completedAtUtc: completedIso,
        wasteReportItemIds,
        actualWeightKgs,
      });
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setSubmitError(err?.message || "Không thể hoàn tất thu gom. Vui lòng thử lại.");
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
              Đính kèm ảnh, nhập khối lượng thực tế theo từng loại rác và các ghi chú liên quan đến hoàn tất thu gom.
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
          {/* Ảnh đính kèm */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface inline-flex items-center gap-2">
              <ImagePlus className="w-4 h-4 text-primary" />
              Ảnh đính kèm
            </label>
            <label
              htmlFor={`${modalId}-images`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverImages(true);
              }}
              onDragLeave={() => setDragOverImages(false)}
              onDrop={dropFactory(setImageFiles, setDragOverImages)}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors ${
                dragOverImages
                  ? "border-primary bg-primary/8"
                  : "border-surface-container-high bg-surface-container-low/50 hover:border-primary/40 hover:bg-primary/4"
              }`}
            >
              <Upload className="w-7 h-7 text-primary/80" />
              <span className="text-sm font-bold text-on-surface">Chọn hoặc kéo thả ảnh</span>
              <span className="text-xs text-on-surface-variant">PNG, JPG — có thể chọn nhiều ảnh</span>
            </label>
            <input
              id={`${modalId}-images`}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => pickImages(e, setImageFiles)}
            />
            {imageFiles.length > 0 ? (
              <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2 list-none p-0 m-0">
                {imageFiles.map((file, index) => (
                  <li
                    key={`img-${file.name}-${index}-${file.lastModified}`}
                    className="relative aspect-square rounded-xl overflow-hidden border border-surface-container-high bg-surface-container-low group"
                  >
                    <img
                      src={previewImages[index]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImageFiles((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="absolute top-1 right-1 inline-flex items-center justify-center rounded-lg bg-on-surface/70 text-white p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      aria-label={`Xóa ảnh đính kèm ${index + 1}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Ảnh minh chứng hoàn tất */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface inline-flex items-center gap-2">
              <ImagePlus className="w-4 h-4 text-rose-600" />
              Ảnh minh chứng hoàn tất
            </label>
            <p className="text-xs text-on-surface-variant">
              Nên tải ảnh chụp tại thời điểm thu gom. Có thể chỉ tải ảnh minh chứng, hoặc chỉ tải ảnh đính kèm ở phần trên — ít nhất một trong hai nhóm phải có ảnh.
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
              <span className="text-sm font-bold text-on-surface">Chọn hoặc kéo thả ảnh minh chứng</span>
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
                      src={previewProof[index]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setProofFiles((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="absolute top-1 right-1 inline-flex items-center justify-center rounded-lg bg-on-surface/70 text-white p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      aria-label={`Xóa ảnh minh chứng ${index + 1}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor={`${modalId}-note`} className="text-sm font-bold text-on-surface">
              Ghi chú
            </label>
            <input
              id={`${modalId}-note`}
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú (tuỳ chọn)"
              className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor={`${modalId}-completion-note`} className="text-sm font-bold text-on-surface">
              Ghi chú hoàn tất
            </label>
            <input
              id={`${modalId}-completion-note`}
              type="text"
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              placeholder="Mô tả khi hoàn tất (tuỳ chọn)"
              className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor={`${modalId}-completed-at`} className="text-sm font-bold text-on-surface">
              Thời điểm hoàn tất (UTC)
            </label>
            <input
              id={`${modalId}-completed-at`}
              type="datetime-local"
              value={completedAtUtc}
              onChange={(e) => setCompletedAtUtc(e.target.value)}
              className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            />
            <p className="text-xs text-on-surface-variant">
              Để trống sẽ dùng thời điểm gửi (UTC).
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-sm font-bold text-on-surface">
                Mã dòng rác / Khối lượng thực tế (kg)
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

          {fileError ? (
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{fileError}</p>
          ) : null}
          {submitError ? (
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{submitError}</p>
          ) : null}

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
