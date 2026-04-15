import { useEffect, useId, useMemo, useState } from "react";
import { ImagePlus, PackageCheck, Upload, X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "complete_match", label: "Thu gom đủ khối lượng và đúng loại" },
  { value: "complete_partial", label: "Thu gom một phần / khối lượng khác báo cáo" },
  { value: "issue_site", label: "Có phát sinh tại hiện trường (ghi chú bên dưới)" },
];

export default function UploadImageModal({
  open,
  onClose,
  taskId,
  taskTitle,
  onSuccess,
}) {
  const modalId = useId();
  const titleId = `${modalId}-title`;
  const descId = `${modalId}-desc`;

  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fileError, setFileError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const previewUrls = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  useEffect(() => {
    if (!open) return;
    setFiles([]);
    setStatus(STATUS_OPTIONS[0].value);
    setNote("");
    setSubmitting(false);
    setFileError("");
    setDragOver(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  function addImageFiles(fileList) {
    const next = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (next.length === 0) return;
    setFiles((prev) => [...prev, ...next]);
    setFileError("");
  }

  function onPickFiles(e) {
    const list = e.target.files;
    if (!list?.length) return;
    addImageFiles(list);
    e.target.value = "";
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addImageFiles(e.dataTransfer.files);
  }

  function removeAt(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (files.length === 0) {
      setFileError("Vui lòng tải lên ít nhất một ảnh minh chứng.");
      return;
    }
    setSubmitting(true);
    setFileError("");
    try {
      // TODO: FormData — upload ảnh + status + note lên API
      await new Promise((r) => setTimeout(r, 600));
      onSuccess?.();
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
              Xác nhận hoàn tất thu gom bằng hình ảnh và thông tin trạng thái.
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
              Ảnh minh chứng
            </label>
            <label
              htmlFor={`${modalId}-files`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-primary bg-primary/8"
                  : "border-surface-container-high bg-surface-container-low/50 hover:border-primary/40 hover:bg-primary/4"
              }`}
            >
              <Upload className="w-8 h-8 text-primary/80" />
              <span className="text-sm font-bold text-on-surface">
                Chọn hoặc kéo thả ảnh vào đây
              </span>
              <span className="text-xs text-on-surface-variant">
                PNG, JPG — có thể chọn nhiều ảnh
              </span>
            </label>
            <input
              id={`${modalId}-files`}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={onPickFiles}
            />
            {fileError ? (
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                {fileError}
              </p>
            ) : null}
            {files.length > 0 ? (
              <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2 list-none p-0 m-0">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}-${file.lastModified}`}
                    className="relative aspect-square rounded-xl overflow-hidden border border-surface-container-high bg-surface-container-low group"
                  >
                    <img
                      src={previewUrls[index]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeAt(index)}
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
              htmlFor={`${modalId}-status`}
              className="text-sm font-bold text-on-surface"
            >
              Thông tin trạng thái
            </label>
            <select
              id={`${modalId}-status`}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`${modalId}-note`}
              className="text-sm font-bold text-on-surface"
            >
              Ghi chú (không bắt buộc)
            </label>
            <textarea
              id={`${modalId}-note`}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Mô tả nhanh thực tế tại chỗ nếu cần…"
              className="w-full resize-y min-h-[88px] rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            />
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
