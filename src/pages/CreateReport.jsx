import { useEffect, useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    FileText,
    Loader2,
    MapPin,
    PlusCircle,
    Star,
    Tag,
    Type,
} from 'lucide-react';
import { getUser } from '../lib/auth';

const CATEGORY_OPTIONS = [
    'Giấy',
    'Nhựa',
    'Kim loại',
];

const POINTS_PER_KG = 100;

export default function CreateReport() {
    const navigate = useNavigate();
    const formId = useId();

    const [title, setTitle] = useState('');
    const [categories, setCategories] = useState([]);
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [categoryDetails, setCategoryDetails] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showPhoneToast, setShowPhoneToast] = useState(false);
    const [submitToast, setSubmitToast] = useState(null);

    useEffect(() => {
        return () => {
            Object.values(categoryDetails).forEach((detail) => {
                detail.imagePreviews.forEach((url) => URL.revokeObjectURL(url));
            });
        };
    }, [categoryDetails]);

    useEffect(() => {
        if (!showPhoneToast) return undefined;

        const timer = window.setTimeout(() => {
            setShowPhoneToast(false);
        }, 3200);

        return () => window.clearTimeout(timer);
    }, [showPhoneToast]);

    useEffect(() => {
        if (!submitToast) return undefined;

        const timer = window.setTimeout(() => {
            setSubmitToast(null);
        }, 2600);

        return () => window.clearTimeout(timer);
    }, [submitToast]);

    function toggleCategory(category) {
        setCategories((current) =>
            current.includes(category)
                ? current.filter((item) => item !== category)
                : [...current, category]
        );

        setCategoryDetails((current) => {
            const exists = Boolean(current[category]);
            if (exists) {
                current[category].imagePreviews.forEach((url) => URL.revokeObjectURL(url));
                const { [category]: _removed, ...rest } = current;
                return rest;
            }
            return { ...current, [category]: { quantityKg: '', imagePreviews: [] } };
        });
    }

    function setCategoryQuantity(category, value) {
        setCategoryDetails((current) => ({
            ...current,
            [category]: {
                ...(current[category] ?? { quantityKg: '', imagePreviews: [] }),
                quantityKg: value,
            },
        }));
    }

    function onCategoryImagesChange(category, e) {
        const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
        setCategoryDetails((current) => {
            const prev = current[category] ?? { quantityKg: '', imagePreviews: [] };
            prev.imagePreviews.forEach((url) => URL.revokeObjectURL(url));
            return {
                ...current,
                [category]: {
                    ...prev,
                    imagePreviews: files.map((file) => URL.createObjectURL(file)),
                },
            };
        });
    }

    async function onSubmit(e) {
        e.preventDefault();
        if (!title.trim()) return;

        const user = getUser();
        const hasPhone = Boolean(user?.phone && String(user.phone).trim());
        if (!hasPhone) {
            setShowPhoneToast(true);
            return;
        }

        setSubmitting(true);
        try {
            await new Promise((r) => setTimeout(r, 600));
            setSubmitToast({
                type: 'success',
                title: 'Tạo báo cáo thành công',
                message: 'Báo cáo của bạn đã được gửi và đang chờ xử lý.',
            });
            window.setTimeout(() => {
                navigate('/report');
            }, 700);
        } catch (error) {
            setSubmitToast({
                type: 'error',
                title: 'Tạo báo cáo thất bại',
                message: 'Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.',
            });
        } finally {
            setSubmitting(false);
        }
    }

    const canSubmit = Boolean(title.trim()) && !submitting;

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
    const estimatedPoints = hasAnyQuantity ? Math.max(0, Math.round(totalQuantityKg * POINTS_PER_KG)) : 0;
    const estimatedPointsDisplay = hasAnyQuantity
        ? new Intl.NumberFormat('en-US').format(estimatedPoints)
        : '';

    return (
        <div className="relative min-h-full overflow-x-hidden">
            {/* Nền chủ đề xanh lá (đồng bộ Home) */}
            <div
                className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/[0.07] via-surface to-primary-container/[0.08]"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,rgba(16,185,129,0.14),transparent_55%)]"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_100%_40%,rgba(0,108,73,0.06),transparent_50%)]"
                aria-hidden
            />

            <div className="relative z-0 px-4 sm:px-6 md:px-10 py-10 sm:py-14">
                <div className="mx-auto w-full max-w-5xl space-y-6">
                    {showPhoneToast && (
                        <div
                            role="alert"
                            className="fixed right-4 top-24 z-[80] w-[min(92vw,24rem)] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 shadow-xl"
                        >
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold">Thiếu số điện thoại</p>
                                    <p className="text-xs leading-relaxed text-amber-800">
                                        Vui lòng cập nhật số điện thoại trong trang Profile trước khi tạo báo cáo.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    {submitToast && (
                        <div
                            role="status"
                            className={`fixed right-4 top-24 z-[80] w-[min(92vw,24rem)] rounded-2xl border px-4 py-3 shadow-xl ${
                                submitToast.type === 'success'
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                                    : 'border-red-200 bg-red-50 text-red-900'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                {submitToast.type === 'success' ? (
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                                ) : (
                                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                                )}
                                <div className="space-y-1">
                                    <p className="text-sm font-bold">{submitToast.title}</p>
                                    <p className="text-xs leading-relaxed opacity-90">{submitToast.message}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <Link
                        to="/report"
                        className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại danh sách
                    </Link>

                    <section className="bg-surface-container-lowest rounded-[2.5rem] sm:rounded-[3rem] p-7 sm:p-10 border border-surface-container-high/60 botanical-shadow space-y-8">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 text-primary font-extrabold">
                                <PlusCircle className="w-5 h-5" />
                                <span>Tạo báo cáo mới</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-serif italic text-on-surface">
                                Báo cáo <span className="not-italic text-primary">rác thải tái chế</span>
                            </h1>
                            <p className="text-on-surface-variant max-w-2xl">
                                Điền tiêu đề, ảnh minh họa, thể loại, địa chỉ, số lượng (khối lượng ước tính) và mô tả để gửi
                                yêu cầu thu gom.
                            </p>
                        </div>

                        <form id={formId} onSubmit={onSubmit}>
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
                                            required
                                            placeholder="VD: Nhựa và lon tại hẻm 12"
                                            className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                                            <Tag className="w-4 h-4 text-primary" />
                                            Thể loại
                                        </div>
                                        <p className="text-xs text-on-surface-variant">
                                            Chọn một hoặc nhiều thể loại phù hợp với báo cáo.
                                        </p>
                                        <div className="flex flex-wrap gap-2.5">
                                            {CATEGORY_OPTIONS.map((category) => {
                                                const isSelected = categories.includes(category);
                                                return (
                                                    <button
                                                        key={category}
                                                        type="button"
                                                        onClick={() => toggleCategory(category)}
                                                        aria-pressed={isSelected}
                                                        className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${isSelected
                                                            ? 'border-primary bg-primary text-white shadow-md shadow-primary/20'
                                                            : 'border-surface-container-high bg-surface text-on-surface-variant hover:border-primary/40 hover:text-primary'
                                                            }`}
                                                    >
                                                        {category}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {categories.length > 0 && (
                                        <div className="space-y-3">
                                            <p className="text-sm font-extrabold text-on-surface">Thông tin theo từng thể loại</p>
                                            <div className="space-y-3">
                                                {categories.map((category) => {
                                                    const detail = categoryDetails[category] ?? { quantityKg: '', imagePreviews: [] };
                                                    return (
                                                        <div
                                                            key={`detail-${category}`}
                                                            className="rounded-3xl border border-surface-container-high/70 bg-surface-container-lowest p-4 sm:p-5 space-y-3"
                                                        >
                                                            <div className="inline-flex items-center gap-2 text-sm font-extrabold text-primary">
                                                                <Tag className="w-4 h-4" />
                                                                <span>{category}</span>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                                                <div className="rounded-2xl border border-surface-container-high bg-surface p-3 space-y-2 md:col-span-4">
                                                                    <label
                                                                        htmlFor={`${formId}-qty-${category}`}
                                                                        className="text-sm font-bold text-on-surface"
                                                                    >
                                                                        Số lượng (kg)
                                                                    </label>
                                                                    <input
                                                                        id={`${formId}-qty-${category}`}
                                                                        type="number"
                                                                        inputMode="decimal"
                                                                        min="0"
                                                                        step="0.1"
                                                                        value={detail.quantityKg}
                                                                        onChange={(e) => setCategoryQuantity(category, e.target.value)}
                                                                        placeholder="VD: 3.2"
                                                                        className="w-full rounded-2xl border border-surface-container-high bg-surface px-3 py-2.5 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
                                                                    />
                                                                </div>

                                                                <div className="rounded-2xl border border-surface-container-high bg-surface p-3 space-y-2 md:col-span-8">
                                                                    <p className="text-sm font-bold text-on-surface">Hình ảnh minh họa</p>
                                                                    <label
                                                                        htmlFor={`${formId}-images-${category}`}
                                                                        className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-surface-container-high bg-surface-container-low/40 px-3 py-4 text-center cursor-pointer hover:border-primary/40 hover:bg-surface-container-low/70 transition-colors"
                                                                    >
                                                                        <span className="text-sm font-semibold text-on-surface">Chọn ảnh</span>
                                                                        <span className="text-xs text-on-surface-variant">PNG, JPG</span>
                                                                        <input
                                                                            id={`${formId}-images-${category}`}
                                                                            type="file"
                                                                            accept="image/*"
                                                                            multiple
                                                                            onChange={(e) => onCategoryImagesChange(category, e)}
                                                                            className="sr-only"
                                                                        />
                                                                    </label>
                                                                    {detail.imagePreviews.length > 0 && (
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {detail.imagePreviews.map((src) => (
                                                                                <div
                                                                                    key={src}
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
                                        <label
                                            htmlFor={`${formId}-address`}
                                            className="flex items-center gap-2 text-sm font-bold text-on-surface"
                                        >
                                            <MapPin className="w-4 h-4 text-primary" />
                                            Địa chỉ
                                        </label>
                                        <input
                                            id={`${formId}-address`}
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="VD: Quận 3, TP.HCM — gần địa danh / hẻm"
                                            className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor={`${formId}-desc`}
                                            className="flex items-center gap-2 text-sm font-bold text-on-surface"
                                        >
                                            <FileText className="w-4 h-4 text-primary" />
                                            Mô tả
                                        </label>
                                        <textarea
                                            id={`${formId}-desc`}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={4}
                                            placeholder="Mô tả ngắn vị trí đặt rác, loại vật liệu, lưu ý an toàn…"
                                            className="w-full resize-y min-h-[110px] rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
                                        />
                                    </div>
                                </div>

                                <aside className="xl:col-span-3">
                                    <div className="rounded-3xl border border-surface-container-high/70 bg-surface p-4 sm:p-5 space-y-4 xl:sticky xl:top-6">
                                        <p className="text-sm font-extrabold text-on-surface">Tổng quan báo cáo</p>
                                        <div className="space-y-2">
                                            <label
                                                htmlFor={`${formId}-total-qty`}
                                                className="flex items-center gap-2 text-sm font-bold text-on-surface"
                                            >
                                                <Tag className="w-4 h-4 text-primary" />
                                                Tổng khối lượng
                                            </label>
                                            <input
                                                id={`${formId}-total-qty`}
                                                type="text"
                                                value={totalQuantityDisplay}
                                                readOnly
                                                placeholder="Tự động tính"
                                                className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none"
                                            />
                                            <p className="text-xs text-on-surface-variant">Đơn vị: kg</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label
                                                htmlFor={`${formId}-estimated-points`}
                                                className="flex items-center gap-2 text-sm font-bold text-on-surface"
                                            >
                                                <Star className="w-4 h-4 text-primary" fill="currentColor" />
                                                Điểm thưởng dự kiến
                                            </label>
                                            <input
                                                id={`${formId}-estimated-points`}
                                                type="text"
                                                value={estimatedPointsDisplay}
                                                readOnly
                                                placeholder="Tự động tính"
                                                className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none"
                                            />
                                            <p className="text-xs text-on-surface-variant">Tạm tính theo {POINTS_PER_KG} điểm/kg.</p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3 pt-1">
                                            <Link
                                                to="/report"
                                                className="inline-flex items-center justify-center rounded-2xl border border-surface-container-high px-5 py-3 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
                                            >
                                                Hủy
                                            </Link>
                                            <button
                                                type="submit"
                                                disabled={!canSubmit}
                                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary-container disabled:opacity-50 disabled:pointer-events-none text-white px-6 py-3 text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.99]"
                                            >
                                                {submitting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Đang gửi…
                                                    </>
                                                ) : (
                                                    'Gửi báo cáo'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
}
