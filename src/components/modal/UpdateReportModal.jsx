import { useEffect, useId, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  Star,
  Tag,
  Type,
  X,
} from 'lucide-react';
import { getWasteReportCategories, updateWasteReport } from '../../api/WasteReportapi';

const MAX_REPORT_TOTAL_KG = 10;
const MAX_REPORT_IMAGES = 3;

function toKey(id) {
  return String(id ?? '').trim();
}

function formatPreviewItem(url) {
  return typeof url === 'string' && url.trim() !== '' ? url.trim() : null;
}

function getReportLineItems(categories, categoryDetails) {
  return categories
    .map((categoryId) => {
      const numericCategoryId = Number(categoryId);
      const rawQuantity = categoryDetails[categoryId]?.quantityKg;
      const quantityKg = Number.parseFloat(String(rawQuantity ?? '').trim());
      if (!Number.isInteger(numericCategoryId) || !Number.isFinite(quantityKg) || quantityKg <= 0) {
        return null;
      }
      return { categoryId: numericCategoryId, quantityKg };
    })
    .filter(Boolean);
}

export default function UpdateReportModal({ open, onClose, initialDetail, onUpdated }) {
  const formId = useId();
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryDetails, setCategoryDetails] = useState({});
  const [reportGallery, setReportGallery] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    if (!open) return;
    let isMounted = true;

    async function loadCategories() {
      setLoadingCategories(true);
      setCategoryError('');
      try {
        const data = await getWasteReportCategories();
        if (!isMounted) return;
        const normalized = data
          .map((item) => ({
            id: toKey(item.id),
            name: item.name ?? '',
            pointsPerKg: Number(item.pointsPerKg) || 0,
          }))
          .filter((item) => item.id && item.name);
        setCategoryOptions(normalized);
      } catch (error) {
        if (!isMounted) return;
        setCategoryOptions([]);
        setCategoryError(error?.message || 'Unable to load waste categories.');
      } finally {
        if (isMounted) setLoadingCategories(false);
      }
    }

    loadCategories();
    return () => {
      isMounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const wasteItems = Array.isArray(initialDetail?.wasteItems) ? initialDetail.wasteItems : [];
    const initialCategories = wasteItems
      .map((item) => toKey(item?.wasteCategoryId))
      .filter((item) => item !== '');
    const uniqueCategories = Array.from(new Set(initialCategories));

    const details = {};
    wasteItems.forEach((item) => {
      const key = toKey(item?.wasteCategoryId);
      if (!key) return;
      details[key] = {
        quantityKg:
          item?.estimatedWeightKg === null || item?.estimatedWeightKg === undefined
            ? ''
            : String(item.estimatedWeightKg),
      };
    });

    const seenUrls = [];
    wasteItems.forEach((item) => {
      (Array.isArray(item?.imageUrls) ? item.imageUrls : []).forEach((u) => {
        const formatted = formatPreviewItem(u);
        if (formatted && !seenUrls.includes(formatted)) {
          seenUrls.push(formatted);
        }
      });
    });
    const initialGallery = seenUrls.slice(0, MAX_REPORT_IMAGES).map((url, idx) => ({
      id: `existing-${idx}-${url.slice(-32)}`,
      kind: 'existing',
      preview: url,
    }));

    setTitle(initialDetail?.title ?? '');
    setAddress(initialDetail?.locationText ?? '');
    setDescription(initialDetail?.description ?? '');
    setCategories(uniqueCategories);
    setCategoryDetails(details);
    setReportGallery(initialGallery);
    setSubmitError('');
    setSubmitSuccess('');
    setSubmitting(false);
  }, [initialDetail, open]);

  useEffect(() => {
    return () => {
      reportGallery.forEach((item) => {
        if (item.kind === 'new' && typeof item.preview === 'string' && item.preview.startsWith('blob:')) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, [reportGallery]);

  const categoryNameMap = useMemo(() => {
    const map = new Map();
    categoryOptions.forEach((item) => {
      map.set(item.id, item.name);
    });
    return map;
  }, [categoryOptions]);

  if (!open) return null;

  function toggleCategory(categoryId) {
    setCategories((current) =>
      current.includes(categoryId) ? current.filter((item) => item !== categoryId) : [...current, categoryId]
    );

    setCategoryDetails((current) => {
      const exists = Boolean(current[categoryId]);
      if (exists) {
        const { [categoryId]: _removed, ...rest } = current;
        return rest;
      }
      return { ...current, [categoryId]: { quantityKg: '' } };
    });
  }

  function setCategoryQuantity(categoryId, value) {
    setCategoryDetails((current) => ({
      ...current,
      [categoryId]: {
        ...(current[categoryId] ?? { quantityKg: '' }),
        quantityKg: value,
      },
    }));
  }

  function onReportImagesChange(e) {
    const incoming = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    setReportGallery((prev) => {
      const slots = MAX_REPORT_IMAGES - prev.length;
      if (slots <= 0) return prev;
      const toAdd = incoming.slice(0, slots);
      const stamp = Date.now();
      const newItems = toAdd.map((file, i) => ({
        id: `new-${stamp}-${i}`,
        kind: 'new',
        file,
        preview: URL.createObjectURL(file),
      }));
      return [...prev, ...newItems];
    });
    e.target.value = '';
  }

  function removeGalleryAt(index) {
    setReportGallery((prev) => {
      const item = prev[index];
      if (item?.kind === 'new' && item.preview?.startsWith('blob:')) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  }

  const lineItems = getReportLineItems(categories, categoryDetails);
  const totalSubmitKg = lineItems.reduce((sum, item) => sum + item.quantityKg, 0);
  const isOverWeightLimit = totalSubmitKg > MAX_REPORT_TOTAL_KG;

  const hasAnyQuantity = categories.some((category) => {
    const raw = categoryDetails[category]?.quantityKg;
    return raw !== undefined && raw !== null && String(raw).trim() !== '';
  });

  const totalQuantityKg = categories.reduce((sum, category) => {
    const raw = categoryDetails[category]?.quantityKg;
    const value = Number.parseFloat(String(raw ?? '').trim());
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  const totalQuantityDisplay = hasAnyQuantity ? String(Math.round(totalQuantityKg * 10) / 10) : '';

  const estimatedPoints = hasAnyQuantity
    ? Math.max(
        0,
        Math.round(
          categories.reduce((sum, categoryId) => {
            const rawQuantity = categoryDetails[categoryId]?.quantityKg;
            const quantityKg = Number.parseFloat(String(rawQuantity ?? '').trim());
            if (!Number.isFinite(quantityKg) || quantityKg <= 0) {
              return sum;
            }
            const pointsPerKg = categoryOptions.find((option) => option.id === categoryId)?.pointsPerKg ?? 0;
            return sum + quantityKg * pointsPerKg;
          }, 0)
        )
      )
    : 0;

  const estimatedPointsDisplay = hasAnyQuantity ? new Intl.NumberFormat('en-US').format(estimatedPoints) : '';

  const estimatedPointsFormulaDisplay = hasAnyQuantity
    ? categories
        .map((categoryId) => {
          const rawQuantity = categoryDetails[categoryId]?.quantityKg;
          const quantityKg = Number.parseFloat(String(rawQuantity ?? '').trim());
          if (!Number.isFinite(quantityKg) || quantityKg <= 0) {
            return null;
          }
          const pointsPerKg = categoryOptions.find((option) => option.id === categoryId)?.pointsPerKg ?? 0;
          return `${quantityKg} kg × ${pointsPerKg}`;
        })
        .filter(Boolean)
        .join(' + ')
    : '';

  const canSubmit =
    Boolean(title.trim()) &&
    Boolean(description.trim()) &&
    !submitting &&
    !isOverWeightLimit &&
    Boolean(initialDetail?.reportId);

  async function onSubmit(e) {
    e.preventDefault();
    if (!initialDetail?.reportId) {
      setSubmitError('Thiếu mã báo cáo để cập nhật.');
      return;
    }
    if (!title.trim() || !description.trim()) {
      setSubmitError('Vui lòng nhập tiêu đề và mô tả.');
      return;
    }

    const selectedItems = getReportLineItems(categories, categoryDetails);

    if (selectedItems.length === 0) {
      setSubmitError('Vui lòng chọn ít nhất 1 thể loại và nhập số lượng lớn hơn 0.');
      return;
    }

    if (totalSubmitKg > MAX_REPORT_TOTAL_KG) {
      setSubmitError(
        `Tổng khối lượng không được vượt quá ${MAX_REPORT_TOTAL_KG} kg. Hiện tại: ${String(Math.round(totalSubmitKg * 10) / 10)} kg.`
      );
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    try {
      const images = reportGallery.filter((g) => g.kind === 'new').map((g) => g.file);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        locationText: address.trim(),
        wasteCategoryIds: selectedItems.map((item) => item.categoryId),
        estimatedWeightKgs: selectedItems.map((item) => item.quantityKg),
        images,
      };

      const updatedReport = await updateWasteReport(initialDetail.reportId, payload);
      setSubmitSuccess('Cập nhật báo cáo thành công.');
      onUpdated?.(updatedReport);
      window.setTimeout(() => {
        onClose?.();
      }, 700);
    } catch (error) {
      setSubmitError(error?.message || 'Không thể cập nhật báo cáo. Vui lòng thử lại.');
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
        className="mt-12 sm:mt-14 w-full max-w-5xl rounded-[2.5rem] border border-surface-container-high/70 bg-surface-container-lowest p-6 sm:p-8 md:p-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-black text-primary">Chỉnh sửa báo cáo</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-on-surface">{title || 'Báo cáo'}</h3>
            <p className="text-sm text-on-surface-variant">Mã report: {initialDetail?.reportId ?? '---'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-surface-container-high text-on-surface-variant hover:text-on-surface hover:border-primary/40 transition-colors"
            aria-label="Đóng pop-up chỉnh sửa báo cáo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-4 text-sm text-on-surface-variant max-w-2xl">
          Điền tiêu đề, ảnh minh họa (tối đa {MAX_REPORT_IMAGES} ảnh), thể loại, địa chỉ, số lượng và mô tả. Ảnh mới tải
          lên sẽ được gửi kèm khi lưu (tối đa {MAX_REPORT_IMAGES} ảnh trong form).
        </p>

        <form className="mt-6" id={formId} onSubmit={onSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="space-y-5 xl:col-span-9">
              <div className="space-y-2">
                <label
                  htmlFor={`${formId}-title`}
                  className="flex items-center gap-2 text-sm font-bold text-on-surface"
                >
                  <Type className="w-4 h-4 text-primary" />
                  Tiêu đề <span className="text-error">*</span>
                </label>
                <input
                  id={`${formId}-title`}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={submitting}
                  required
                  placeholder="VD: Nhựa và lon tại hẻm 12"
                  className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold text-on-surface">Hình ảnh minh họa</p>
                <p className="text-xs text-on-surface-variant">
                  Tối đa {MAX_REPORT_IMAGES} ảnh (PNG, JPG). Có thể chọn nhiều lần cho đến khi đủ {MAX_REPORT_IMAGES}{' '}
                  ảnh. Ảnh đang lưu trên báo cáo hiển thị bên dưới; thêm ảnh mới nếu cần.
                </p>
                <label
                  htmlFor={`${formId}-report-images`}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-surface-container-high bg-surface-container-low/40 px-3 py-4 text-center transition-colors ${reportGallery.length >= MAX_REPORT_IMAGES || submitting
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer hover:border-primary/40 hover:bg-surface-container-low/70'
                    }`}
                >
                  <span className="text-sm font-semibold text-on-surface">Chọn ảnh</span>
                  <span className="text-xs text-on-surface-variant">PNG, JPG</span>
                  <input
                    id={`${formId}-report-images`}
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={submitting || reportGallery.length >= MAX_REPORT_IMAGES}
                    onChange={onReportImagesChange}
                    className="sr-only"
                  />
                </label>
                {reportGallery.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {reportGallery.map((item, idx) => (
                      <div
                        key={item.id}
                        className="group relative h-20 w-20 overflow-hidden rounded-xl border border-surface-container-high bg-surface-container-low"
                      >
                        <img src={item.preview} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryAt(idx)}
                          disabled={submitting}
                          className="absolute inset-0 flex items-center justify-center bg-on-surface/55 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:pointer-events-none"
                          aria-label="Xóa ảnh"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                  <Tag className="w-4 h-4 text-primary" />
                  Category
                </div>
                <p className="text-xs text-on-surface-variant">
                  Select one or more categories that match the report.
                </p>
                {loadingCategories && (
                  <p className="text-xs text-on-surface-variant inline-flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Loading categories...
                  </p>
                )}
                {categoryError && <p className="text-xs text-error">{categoryError}</p>}
                <div className="flex flex-wrap gap-2.5">
                  {categoryOptions.map((category) => {
                    const isSelected = categories.includes(category.id);
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        aria-pressed={isSelected}
                        disabled={submitting || loadingCategories}
                        className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${isSelected
                          ? 'border-primary bg-primary text-white shadow-md shadow-primary/20'
                          : 'border-surface-container-high bg-surface text-on-surface-variant hover:border-primary/40 hover:text-primary'
                          }`}
                      >
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {categories.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-extrabold text-on-surface">Information by Category</p>
                  <div className="space-y-3 max-h-[38vh] overflow-y-auto pr-1">
                    {categories.map((categoryId) => {
                      const detail = categoryDetails[categoryId] ?? { quantityKg: '' };
                      const categoryName = categoryNameMap.get(categoryId) ?? categoryId;
                      return (
                        <div
                          key={`detail-${categoryId}`}
                          className="rounded-3xl border border-surface-container-high/70 bg-surface-container-lowest p-4 sm:p-5 space-y-3"
                        >
                          <div className="inline-flex items-center gap-2 text-sm font-extrabold text-primary">
                            <Tag className="w-4 h-4" />
                            <span>{categoryName}</span>
                          </div>
                          <div className="rounded-2xl border border-surface-container-high bg-surface p-3 space-y-2 max-w-md">
                            <label
                              htmlFor={`${formId}-qty-${categoryId}`}
                              className="text-sm font-bold text-on-surface"
                            >
                              Quantity (kg)
                            </label>
                            <input
                              id={`${formId}-qty-${categoryId}`}
                              type="number"
                              inputMode="decimal"
                              min="0"
                              step="0.1"
                              value={detail.quantityKg}
                              onChange={(e) => setCategoryQuantity(categoryId, e.target.value)}
                              disabled={submitting}
                              placeholder="Ex: 3.2"
                              className="w-full rounded-2xl border border-surface-container-high bg-surface px-3 py-2.5 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor={`${formId}-address`}
                  className="flex items-center gap-2 text-sm font-bold text-on-surface"
                >
                  <MapPin className="w-4 h-4 text-primary" />
                  Address
                </label>
                <input
                  id={`${formId}-address`}
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={submitting}
                  placeholder="Ex: District 3, HCMC — near landmark / alley"
                  className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`${formId}-description`}
                  className="flex items-center gap-2 text-sm font-bold text-on-surface"
                >
                  <FileText className="w-4 h-4 text-primary" />
                  Description <span className="text-error">*</span>
                </label>
                <textarea
                  id={`${formId}-description`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                  disabled={submitting}
                  placeholder="Briefly describe the waste location, material type, safety notes..."
                  className="w-full resize-y min-h-[110px] rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
                />
              </div>

              {submitError && (
                <p className="inline-flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {submitError}
                </p>
              )}
              {submitSuccess && (
                <p className="inline-flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {submitSuccess}
                </p>
              )}
            </div>

            <aside className="xl:col-span-3">
              <div className="rounded-3xl border border-surface-container-high/70 bg-surface p-4 sm:p-5 space-y-4 xl:sticky xl:top-6">
                <p className="text-sm font-extrabold text-on-surface">Report Overview</p>
                <div className="space-y-2">
                  <label
                    htmlFor={`${formId}-total-qty`}
                    className="flex items-center gap-2 text-sm font-bold text-on-surface"
                  >
                    <Tag className="w-4 h-4 text-primary" />
                    Total Weight
                  </label>
                  <input
                    id={`${formId}-total-qty`}
                    type="text"
                    value={totalQuantityDisplay}
                    readOnly
                    placeholder="Tự động tính"
                    className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none"
                  />
                  <p className="text-xs text-on-surface-variant">
                    Unit: kg · Max {MAX_REPORT_TOTAL_KG} kg (total of categories with valid quantities)
                  </p>
                  {isOverWeightLimit && (
                    <p className="text-xs font-semibold text-error">
                      Total weight exceeds {MAX_REPORT_TOTAL_KG} kg — please reduce to save.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor={`${formId}-estimated-points`}
                    className="flex items-center gap-2 text-sm font-bold text-on-surface"
                  >
                    <Star className="w-4 h-4 text-primary" fill="currentColor" />
                    Estimated Reward Points
                  </label>
                  <input
                    id={`${formId}-estimated-points`}
                    type="text"
                    value={estimatedPointsDisplay}
                    readOnly
                    placeholder="Tự động tính"
                    className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none"
                  />
                  <p className="text-xs text-on-surface-variant">
                    Cách tính: {estimatedPointsFormulaDisplay || 'Số kg × PointPerKg'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="inline-flex items-center justify-center rounded-2xl border border-surface-container-high px-5 py-3 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary-container disabled:opacity-50 disabled:pointer-events-none text-white px-6 py-3 text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.99]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}
