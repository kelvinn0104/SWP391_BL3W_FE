import { useEffect, useId, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, MapPin, Tag, Type, X, FileText, AlertCircle } from 'lucide-react';
import { getWasteReportCategories, updateWasteReport } from '../../api/WasteReportapi';

function toKey(id) {
  return String(id ?? '').trim();
}

function formatPreviewItem(url) {
  return typeof url === 'string' && url.trim() !== '' ? url : null;
}

export default function UpdateReportModal({ open, onClose, initialDetail, onUpdated }) {
  const formId = useId();
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryDetails, setCategoryDetails] = useState({});
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
          }))
          .filter((item) => item.id && item.name);
        setCategoryOptions(normalized);
      } catch (error) {
        if (!isMounted) return;
        setCategoryOptions([]);
        setCategoryError(error?.message || 'Không thể tải thể loại rác.');
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
      const previews = (Array.isArray(item?.imageUrls) ? item.imageUrls : [])
        .map(formatPreviewItem)
        .filter(Boolean);
      details[key] = {
        quantityKg:
          item?.estimatedWeightKg === null || item?.estimatedWeightKg === undefined
            ? ''
            : String(item.estimatedWeightKg),
        imagePreviews: previews,
        imageFiles: [],
      };
    });

    setTitle(initialDetail?.title ?? '');
    setAddress(initialDetail?.locationText ?? '');
    setDescription(initialDetail?.description ?? '');
    setCategories(uniqueCategories);
    setCategoryDetails(details);
    setSubmitError('');
    setSubmitSuccess('');
    setSubmitting(false);
  }, [initialDetail, open]);

  useEffect(() => {
    return () => {
      Object.values(categoryDetails).forEach((detail) => {
        (detail?.imagePreviews ?? []).forEach((url) => {
          if (typeof url === 'string' && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      });
    };
  }, [categoryDetails]);

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
        (current[categoryId]?.imagePreviews ?? []).forEach((url) => {
          if (typeof url === 'string' && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
        const { [categoryId]: _removed, ...rest } = current;
        return rest;
      }
      return { ...current, [categoryId]: { quantityKg: '', imagePreviews: [], imageFiles: [] } };
    });
  }

  function setCategoryQuantity(categoryId, value) {
    setCategoryDetails((current) => ({
      ...current,
      [categoryId]: {
        ...(current[categoryId] ?? { quantityKg: '', imagePreviews: [], imageFiles: [] }),
        quantityKg: value,
      },
    }));
  }

  function onCategoryImagesChange(categoryId, e) {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) {
      return;
    }
    setCategoryDetails((current) => {
      const prev = current[categoryId] ?? { quantityKg: '', imagePreviews: [], imageFiles: [] };
      const nextPreviews = [...(prev.imagePreviews ?? []), ...files.map((file) => URL.createObjectURL(file))];
      const nextImageFiles = [...(prev.imageFiles ?? []), ...files];
      return {
        ...current,
        [categoryId]: {
          ...prev,
          imageFiles: nextImageFiles,
          imagePreviews: nextPreviews,
        },
      };
    });
    e.target.value = '';
  }

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

    const selectedItems = categories
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

    if (selectedItems.length === 0) {
      setSubmitError('Vui lòng chọn ít nhất 1 thể loại và nhập số lượng lớn hơn 0.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    try {
      const allImageFiles = categories.flatMap((categoryId) => categoryDetails[categoryId]?.imageFiles ?? []);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        locationText: address.trim(),
        wasteCategoryIds: selectedItems.map((item) => item.categoryId),
        estimatedWeightKgs: selectedItems.map((item) => item.quantityKg),
        images: allImageFiles,
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
        className="mt-12 sm:mt-14 w-full max-w-5xl rounded-3xl border border-surface-container-high/70 bg-surface-container-lowest p-6 sm:p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-black text-primary">Chỉnh sửa báo cáo</p>
            <h3 className="text-xl font-extrabold text-on-surface">{title || 'Báo cáo'}</h3>
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

        <form className="mt-5 space-y-5" id={formId} onSubmit={onSubmit}>
          <div className="space-y-2">
            <label htmlFor={`${formId}-title`} className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <Type className="w-4 h-4 text-primary" />
              Tiêu đề
            </label>
            <input
              id={`${formId}-title`}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <Tag className="w-4 h-4 text-primary" />
              Thể loại
            </div>
            {loadingCategories && (
              <p className="text-xs text-on-surface-variant inline-flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Đang tải danh sách thể loại...
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
                    disabled={submitting}
                    className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-bold transition-all ${isSelected
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
              <p className="text-sm font-extrabold text-on-surface">Thông tin theo từng thể loại</p>
              <div className="space-y-3 max-h-[38vh] overflow-y-auto pr-1">
                {categories.map((categoryId) => {
                  const detail = categoryDetails[categoryId] ?? { quantityKg: '', imagePreviews: [], imageFiles: [] };
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
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="rounded-2xl border border-surface-container-high bg-surface p-3 space-y-2 md:col-span-4">
                          <label htmlFor={`${formId}-qty-${categoryId}`} className="text-sm font-bold text-on-surface">
                            Số lượng (kg)
                          </label>
                          <input
                            id={`${formId}-qty-${categoryId}`}
                            type="number"
                            min="0"
                            step="0.1"
                            value={detail.quantityKg}
                            onChange={(e) => setCategoryQuantity(categoryId, e.target.value)}
                            disabled={submitting}
                            className="w-full rounded-2xl border border-surface-container-high bg-surface px-3 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
                          />
                        </div>

                        <div className="rounded-2xl border border-surface-container-high bg-surface p-3 space-y-2 md:col-span-8">
                          <p className="text-sm font-bold text-on-surface">Hình ảnh minh họa</p>
                          <label
                            htmlFor={`${formId}-images-${categoryId}`}
                            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-surface-container-high bg-surface-container-low/40 px-3 py-4 text-center cursor-pointer hover:border-primary/40 hover:bg-surface-container-low/70 transition-colors"
                          >
                            <span className="text-sm font-semibold text-on-surface">Chọn ảnh</span>
                            <span className="text-xs text-on-surface-variant">PNG, JPG</span>
                            <input
                              id={`${formId}-images-${categoryId}`}
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => onCategoryImagesChange(categoryId, e)}
                              disabled={submitting}
                              className="sr-only"
                            />
                          </label>
                          {detail.imagePreviews.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {detail.imagePreviews.map((src) => (
                                <div
                                  key={`${categoryId}-${src}`}
                                  className="h-16 w-16 overflow-hidden rounded-xl border border-surface-container-high bg-surface-container-low"
                                >
                                  <img src={src} alt="" className="h-full w-full object-cover" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor={`${formId}-address`} className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <MapPin className="w-4 h-4 text-primary" />
              Địa chỉ
            </label>
            <input
              id={`${formId}-address`}
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={submitting}
              className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor={`${formId}-description`} className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <FileText className="w-4 h-4 text-primary" />
              Mô tả
            </label>
            <textarea
              id={`${formId}-description`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={submitting}
              className="w-full resize-y min-h-[110px] rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            />
          </div>

          {submitError && (
            <p className="inline-flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {submitError}
            </p>
          )}
          {submitSuccess && (
            <p className="inline-flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              {submitSuccess}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-2xl border border-surface-container-high px-5 py-3 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-2xl bg-primary hover:bg-primary-container text-white px-6 py-3 text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.99]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
