import { useEffect, useId, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  PackageCheck,
  Plus,
  Star,
  Tag,
  Upload,
  X,
} from "lucide-react";
import { completeCollectorJob } from "../../api/collectorJobApi";
import { getWasteReportCategories } from "../../api/WasteReportapi";

const TOAST_AUTO_HIDE_MS = 2600;
const TOAST_SUCCESS_CLOSE_MS = 700;

function resolveReportId(taskId, reportIdProp) {
  if (reportIdProp != null) {
    const n = Number(reportIdProp);
    if (Number.isFinite(n) && n > 0) return n;
  }
  const digits = String(taskId ?? "").replace(/\D/g, "");
  const n = digits ? Number(digits) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

function nowForDatetimeLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

/** Một dòng: danh mục từ API hoặc nhập tay. */
function rowsFromWasteItems(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const rows = items
    .map((item) => {
      const name = String(item?.wasteCategoryName ?? "").trim();
      const est = item?.estimatedWeightKg;
      const weightStr =
        est != null && est !== "" && Number.isFinite(Number(est))
          ? String(Number(est))
          : "";
      const estKg = Number(item?.estimatedWeightKg);
      const estPts = Number(item?.estimatedPoints);
      const pointsPerKg =
        Number.isFinite(estKg) &&
        estKg > 0 &&
        Number.isFinite(estPts) &&
        estPts >= 0
          ? estPts / estKg
          : undefined;
      return {
        categoryName: name,
        weight: weightStr,
        rowKey: item?.wasteReportItemId ?? name,
        pointsPerKg,
      };
    })
    .filter((r) => r.categoryName);
  return rows.length > 0 ? rows : null;
}

export default function UploadImageModal({
  open,
  onClose,
  taskId,
  reportId: reportIdProp,
  wasteItems,
  onSuccess,
}) {
  const modalId = useId();
  const titleId = `${modalId}-title`;

  const [proofFiles, setProofFiles] = useState([]);
  const [completionNote, setCompletionNote] = useState("");
  const [completedAtUtc, setCompletedAtUtc] = useState("");
  const [weightRows, setWeightRows] = useState([
    { categoryName: "", weight: "" },
  ]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState("");

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

  const presetRows = useMemo(
    () => rowsFromWasteItems(wasteItems),
    [wasteItems],
  );
  const fixedCategoriesFromApi = Boolean(presetRows?.length);

  useEffect(() => {
    if (!open) return undefined;
    let isMounted = true;

    (async () => {
      setLoadingCategories(true);
      setCategoryError("");
      try {
        const data = await getWasteReportCategories();
        if (!isMounted) return;
        const rows = (Array.isArray(data) ? data : [])
          .map((item) => ({
            name: String(item?.name ?? "").trim(),
            pointsPerKg: Number(item?.pointsPerKg) || 0,
          }))
          .filter((item) => item.name);
        const uniqueByName = new Map();
        for (const item of rows) {
          if (!uniqueByName.has(item.name)) uniqueByName.set(item.name, item);
        }
        const normalized = Array.from(uniqueByName.values());
        normalized.sort((a, b) => a.name.localeCompare(b.name, "vi"));
        setCategoryOptions(normalized);
      } catch (err) {
        if (!isMounted) return;
        setCategoryOptions([]);
        setCategoryError(
          err?.message || "Không thể tải danh sách danh mục. Vui lòng thử lại.",
        );
      } finally {
        if (isMounted) setLoadingCategories(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [open]);

  const categoryPointsByName = useMemo(() => {
    const map = new Map();
    for (const option of categoryOptions) {
      map.set(option.name, Number(option.pointsPerKg) || 0);
    }
    return map;
  }, [categoryOptions]);

  useEffect(() => {
    if (!open) return;
    if (categoryPointsByName.size === 0) return;
    setWeightRows((prev) =>
      prev.map((row) => {
        const name = String(row?.categoryName ?? "").trim();
        if (!name) return row;
        const nextRate = categoryPointsByName.get(name);
        if (nextRate === undefined) return row;
        if (row.pointsPerKg === nextRate) return row;
        return { ...row, pointsPerKg: nextRate };
      }),
    );
  }, [open, categoryPointsByName]);

  const weightSummary = useMemo(() => {
    let totalKg = 0;
    let pointsSum = 0;
    const formulaParts = [];
    for (const row of weightRows) {
      const raw = String(row.weight ?? "").trim();
      if (raw === "") continue;
      const kg = Number.parseFloat(raw.replace(",", "."));
      if (!Number.isFinite(kg) || kg <= 0) continue;
      totalKg += kg;
      const name = String(row?.categoryName ?? "").trim();
      const rate =
        name && categoryPointsByName.has(name)
          ? categoryPointsByName.get(name)
          : Number.isFinite(row.pointsPerKg)
            ? row.pointsPerKg
            : 0;
      const safeRate = Math.max(0, Number(rate) || 0);
      pointsSum += kg * safeRate;
      const rateRounded = Math.round(safeRate * 100) / 100;
      formulaParts.push(`${Math.round(kg * 10) / 10} kg × ${rateRounded}`);
    }
    const hasKg = totalKg > 0;
    const roundedPts = Math.max(0, Math.round(pointsSum));
    return {
      totalKgDisplay: hasKg ? String(Math.round(totalKg * 10) / 10) : "",
      pointsDisplay: hasKg
        ? new Intl.NumberFormat("vi-VN").format(roundedPts)
        : "",
      formulaDisplay: formulaParts.join(" + "),
    };
  }, [weightRows, categoryPointsByName]);

  useEffect(() => {
    if (!open) return;
    setProofFiles([]);
    setCompletionNote("");
    setCompletedAtUtc(nowForDatetimeLocal());
    setWeightRows(presetRows ?? [{ categoryName: "", weight: "" }]);
    setSubmitting(false);
    setSubmitToast(null);
    setDragOverProof(false);
  }, [open, presetRows]);

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
    }, TOAST_AUTO_HIDE_MS);

    return () => window.clearTimeout(timer);
  }, [submitToast]);

  useEffect(() => {
    if (!submitToast || submitToast.type !== "success") return undefined;

    const timer = window.setTimeout(() => {
      onSuccess?.();
      onClose?.();
    }, TOAST_SUCCESS_CLOSE_MS);

    return () => window.clearTimeout(timer);
  }, [submitToast, onSuccess, onClose]);

  function addFilesTo(setter, fileList) {
    const next = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/"),
    );
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
      if (e.dataTransfer.files?.length)
        addFilesTo(setter, e.dataTransfer.files);
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
        message: "Vui lòng tải ít nhất một ảnh minh chứng.",
      });
      return;
    }

    const pairs = [];
    for (const row of weightRows) {
      const nameRaw = row.categoryName.trim();
      const wRaw = row.weight.trim();
      if (!nameRaw && !wRaw) continue;
      const weight = Number(wRaw.replace(",", "."));
      if (!nameRaw) {
        setSubmitToast({
          type: "error",
          title: "Thiếu danh mục",
          message:
            "Mỗi dòng đã nhập cần có tên danh mục (không được để trống).",
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
      pairs.push({ categoryName: nameRaw, actualWeightKg: weight });
    }

    if (pairs.length === 0) {
      setSubmitToast({
        type: "error",
        title: "Thiếu danh mục và khối lượng",
        message:
          "Vui lòng nhập ít nhất một cặp danh mục và khối lượng thực tế.",
      });
      return;
    }

    const categoryNames = pairs.map((p) => p.categoryName);
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
        categoryNames,
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
          err?.message || "Không thể hoàn tất thu gom. Vui lòng thử lại.",
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
            <p
              id={titleId}
              className="inline-flex items-center gap-2 text-lg font-extrabold text-primary"
            >
              <PackageCheck className="w-5 h-5 shrink-0" />
              Xác nhận thu gom
            </p>
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
              <span className="text-sm font-bold text-on-surface">
                Chọn hoặc kéo thả ảnh
              </span>
              <span className="text-xs text-on-surface-variant">
                PNG, JPG — có thể chọn nhiều ảnh
              </span>
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
                        setProofFiles((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
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
            <label
              htmlFor={`${modalId}-completed-at`}
              className="text-sm font-bold text-on-surface"
            >
              Thời điểm hoàn tất{" "}
            </label>
            <input
              id={`${modalId}-completed-at`}
              type="datetime-local"
              value={completedAtUtc}
              onChange={(e) => setCompletedAtUtc(e.target.value)}
              disabled
              className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-sm font-bold text-on-surface">
                Danh mục / Khối lượng (kg)
              </span>
              <button
                type="button"
                onClick={() =>
                  setWeightRows((prev) => [
                    ...prev,
                    { categoryName: "", weight: "" },
                  ])
                }
                className="inline-flex items-center gap-1 rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/15 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm dòng
              </button>
            </div>

            <div className="space-y-2">
              {weightRows.map((row, index) => (
                <div
                  key={String(row.rowKey ?? `row-${index}`)}
                  className="flex flex-col sm:flex-row gap-2 sm:items-center"
                >
                  {weightRows.length > 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setWeightRows((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                      className="sm:self-stretch inline-flex items-center justify-center rounded-xl border border-surface-container-high px-3 py-2 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface text-sm font-bold shrink-0"
                      aria-label="Xóa dòng"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : null}
                  <div className="flex-1 min-w-0 space-y-1">
                    <select
                      value={row.categoryName}
                      onChange={(e) => {
                        const v = e.target.value;
                        setWeightRows((prev) =>
                          prev.map((r, i) =>
                            i === index
                              ? {
                                  ...r,
                                  categoryName: v,
                                  pointsPerKg: categoryPointsByName.get(v) ?? 0,
                                }
                              : r,
                          ),
                        );
                      }}
                      disabled={loadingCategories}
                      className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary disabled:opacity-60"
                    >
                      <option value="">
                        {loadingCategories
                          ? "Đang tải danh mục…"
                          : "Chọn danh mục"}
                      </option>
                      {categoryOptions
                        .map((o) => o.name)
                        .filter((name) => {
                          if (name === row.categoryName) return true;
                          return !weightRows.some(
                            (r, i) => i !== index && r?.categoryName === name,
                          );
                        })
                        .map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                    </select>
                    {categoryError ? (
                      <p className="text-xs text-error">{categoryError}</p>
                    ) : null}
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={row.weight}
                    onChange={(e) => {
                      const rawV = e.target.value;
                      // Chỉ cho phép số, tối đa 1 dấu chấm hoặc 1 dấu phẩy
                      const sanitized = rawV
                        .replace(/[^0-9.,]/g, "")
                        .replace(/([.,])(?=.*[.,])/g, "");

                      setWeightRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, weight: sanitized } : r,
                        ),
                      );
                    }}
                    placeholder="Khối lượng (kg)"
                    className="flex-1 min-w-0 sm:max-w-[160px] rounded-2xl border border-surface-container-high bg-surface px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary"
                  />
                </div>
              ))}
            </div>

            <div className="rounded-2xl px-0 py-4 space-y-3">
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[auto,160px] sm:items-center sm:gap-x-3 sm:gap-y-2">
                  <label
                    htmlFor={`${modalId}-total-kg`}
                    className="flex items-center gap-2 text-sm font-bold text-on-surface sm:justify-self-end"
                  >
                    <Tag className="w-4 h-4 text-primary shrink-0" />
                    Tổng khối lượng
                  </label>
                  <input
                    id={`${modalId}-total-kg`}
                    type="text"
                    readOnly
                    value={weightSummary.totalKgDisplay}
                    placeholder="Tự động tính"
                    className="w-full min-w-0 sm:max-w-[160px] rounded-2xl border border-surface-container-high bg-surface px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary text-left"
                  />
                  <p className="text-xs text-on-surface-variant sm:col-span-2 sm:justify-self-end sm:text-right">
                    Đơn vị: kg (tổng các dòng có khối lượng hợp lệ)
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[auto,160px] sm:items-center sm:gap-x-3 sm:gap-y-2">
                  <label
                    htmlFor={`${modalId}-official-points`}
                    className="flex items-center gap-2 text-sm font-bold text-on-surface sm:justify-self-end"
                  >
                    <Star
                      className="w-4 h-4 text-primary shrink-0"
                      fill="currentColor"
                    />
                    Điểm thưởng chính thức
                  </label>
                  <input
                    id={`${modalId}-official-points`}
                    type="text"
                    readOnly
                    value={weightSummary.pointsDisplay}
                    placeholder="Tự động tính"
                    className="w-full min-w-0 sm:max-w-[160px] rounded-2xl border border-surface-container-high bg-surface px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary text-left"
                  />
                  <p className="text-xs text-on-surface-variant sm:col-span-2 sm:justify-self-end sm:text-right">
                    Cách tính:{" "}
                    {weightSummary.formulaDisplay
                      ? `${weightSummary.formulaDisplay} (kg × điểm/kg theo từng danh mục)`
                      : "Số kg × điểm mỗi kg theo báo cáo (khi có dữ liệu danh mục)"}
                  </p>
                </div>
              </div>
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
