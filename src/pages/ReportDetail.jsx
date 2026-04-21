import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowLeft,
    CalendarDays,
    FilePenLine,
    FileText,
    Loader2,
    Map as MapIcon,
    MapPin,
    PackageCheck,
    Tag,
} from 'lucide-react';
import { getStatusLabel, statusClassName } from './Report';
import FeedbackModal from '../components/modal/FeedbackModal';
import { getWasteReportDetail } from '../api/WasteReportapi';
import { getApiBaseUrl, resolveImageUrl } from '../lib/auth';
import UpdateReportModal from '../components/modal/UpdateReportModal';

const ESTIMATED_POINT_VISIBLE_STATUSES = new Set(['Pending', 'Accepted', 'Assigned']);

function mapEmbedSrcFromAddress(address) {
    const q = String(address ?? '').trim();
    if (!q) return null;
    return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=16&hl=vi&output=embed`;
}

function formatDateTime(value) {
    if (!value) return '---';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(date);
}

function formatKg(value) {
    const kg = Number(value);
    if (!Number.isFinite(kg) || kg <= 0) return '0 kg';
    return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(kg)} kg`;
}

function normalizeImageUrls(input) {
    if (!Array.isArray(input)) return [];
    return input.filter((item) => typeof item === 'string' && item.trim() !== '');
}

/** API thường trả đường dẫn tương đối (/report-images/...); img cần URL đầy đủ tới BE. */
function resolveReportImageUrl(path) {
    return resolveImageUrl(path);
}

function mapReportDetail(apiData) {
    if (!apiData || typeof apiData !== 'object') return null;

    const wasteItems = Array.isArray(apiData.wasteItems) ? apiData.wasteItems : [];
    const categories = wasteItems
        .map((item) => item?.wasteCategoryName)
        .filter((name) => typeof name === 'string' && name.trim() !== '');
    const totalWeight = wasteItems.reduce((sum, item) => {
        const weight = Number(item?.estimatedWeightKg);
        return sum + (Number.isFinite(weight) ? weight : 0);
    }, 0);

    const topLevelImages = normalizeImageUrls(apiData.imageUrls);
    const itemImages = wasteItems.flatMap((item) => normalizeImageUrls(item?.imageUrls));
    const uniqueImages = Array.from(new Set([...topLevelImages, ...itemImages])).map(resolveReportImageUrl);

    return {
        id: String(apiData.reportId ?? ''),
        title: apiData.title ?? 'Báo cáo không có tiêu đề',
        status: apiData.status ?? 'Pending',
        category: categories.length > 0 ? categories.join(', ') : '---',
        location: apiData.locationText ?? '---',
        createdAt: formatDateTime(apiData.createdAtUtc),
        description: apiData.description ?? '---',
        weight: formatKg(totalWeight),
        estimatedTotalPoints: Number(apiData.estimatedTotalPoints ?? 0),
        finalRewardPoints: Number(apiData.finalRewardPoints ?? 0),
        images: uniqueImages,
        coordinates: null,
    };
}

export default function ReportDetail() {
    const { id: rawId } = useParams();
    const id = rawId ? decodeURIComponent(rawId) : '';

    const [report, setReport] = useState(null);
    const [reportDetailRaw, setReportDetailRaw] = useState(null);
    const [loadingReport, setLoadingReport] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [complaintOpen, setComplaintOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);

    const applyReportDetail = useCallback((data) => {
        setReport(mapReportDetail(data));
        setReportDetailRaw(data);
    }, []);

    useEffect(() => {
        setActiveImageIndex(0);
    }, [id]);

    useEffect(() => {
        let isMounted = true;

        async function loadReportDetail() {
            if (!id) {
                setReport(null);
                setReportDetailRaw(null);
                setLoadError('Thiếu mã báo cáo.');
                setLoadingReport(false);
                return;
            }

            setLoadingReport(true);
            setLoadError('');

            try {
                const data = await getWasteReportDetail(id);
                if (!isMounted) return;
                applyReportDetail(data);
            } catch (error) {
                if (!isMounted) return;
                setReport(null);
                setReportDetailRaw(null);
                setLoadError(error?.message || 'Không thể tải chi tiết báo cáo.');
            } finally {
                if (isMounted) {
                    setLoadingReport(false);
                }
            }
        }

        loadReportDetail();
        return () => {
            isMounted = false;
        };
    }, [applyReportDetail, id]);

    const images = report?.images ?? [];
    const activeSrc = images[activeImageIndex] ?? images[0];

    const embedSrc = useMemo(() => {
        return mapEmbedSrcFromAddress(report?.location);
    }, [report]);

    if (loadingReport) {
        return (
            <div className="relative min-h-full overflow-x-hidden">
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

                <div className="relative z-0 px-4 sm:px-6 md:px-16 py-10 sm:py-14 space-y-6">
                    <Link
                        to="/report"
                        className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại danh sách
                    </Link>
                    <div className="bg-surface-container-lowest rounded-3xl p-8 border border-surface-container-high/60 text-on-surface-variant inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        Đang tải chi tiết báo cáo...
                    </div>
                </div>
            </div>
        );
    }

    if (!report) {
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

                <div className="relative z-0 px-4 sm:px-6 md:px-16 py-10 sm:py-14 space-y-6">
                    <Link
                        to="/report"
                        className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại danh sách
                    </Link>
                    <div className="bg-surface-container-lowest rounded-3xl p-8 border border-surface-container-high/60 text-on-surface-variant">
                        {loadError || (
                            <>
                                Không tìm thấy báo cáo với mã{' '}
                                <span className="font-bold text-on-surface">{id || '---'}</span>.
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const showComplaintButton = report.status === 'Collected' || report.status === 'Canceled';
    const showEditButton = report.status === 'Pending';
    const statusLabel = getStatusLabel(report.status);

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

            <div className="relative z-0 px-4 sm:px-6 md:px-16 py-10 sm:py-14 space-y-8">
                <Link
                    to="/report"
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại danh sách
                </Link>

                <article className="bg-surface-container-lowest rounded-[2.5rem] sm:rounded-[3rem] p-7 sm:p-10 border border-surface-container-high/60 botanical-shadow space-y-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="space-y-3 min-w-0 flex-1">
                            <p className="text-sm font-bold text-primary">Chi tiết báo cáo</p>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl sm:text-4xl font-sans italic text-on-surface">{report.title}</h1>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-black border ${statusClassName(report.status)}`}
                                >
                                    {getStatusLabel(report.status)}
                                </span>
                            </div>
                            {(ESTIMATED_POINT_VISIBLE_STATUSES.has(report.status) || report.status === 'Collected') && (
                                <div className="flex flex-wrap items-center gap-2">
                                    {ESTIMATED_POINT_VISIBLE_STATUSES.has(report.status) && (
                                        <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-black text-primary">
                                            Điểm thưởng dự kiến:{' '}
                                            {new Intl.NumberFormat('en-US').format(
                                                Number.isFinite(report.estimatedTotalPoints) ? report.estimatedTotalPoints : 0
                                            )}
                                        </div>
                                    )}
                                    {report.status === 'Collected' && (
                                        <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
                                            Điểm thưởng nhận được:{' '}
                                            {new Intl.NumberFormat('en-US').format(
                                                Number.isFinite(report.finalRewardPoints) ? report.finalRewardPoints : 0
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            <p className="text-sm font-semibold text-on-surface-variant">Mã report: {report.id}</p>
                            <div className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                                <Tag className="w-4 h-4 shrink-0" />
                                <span>Danh mục: {report.category}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-on-surface-variant pt-1">
                                <div className="inline-flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                                    <span>{report.location}</span>
                                </div>
                                <div className="inline-flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4 text-primary shrink-0" />
                                    <span>Ngày tạo: {report.createdAt}</span>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-surface-container-high/70 bg-surface-container-low/50 p-4 sm:p-5">
                                <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Mô tả</p>
                                <p className="text-sm sm:text-base text-on-surface leading-relaxed inline-flex gap-2">
                                    <FileText className="w-4 h-4 text-primary shrink-0 mt-1" />
                                    <span>{report.description}</span>
                                </p>
                            </div>
                        </div>

                        <div className="self-start shrink-0 w-full lg:w-auto lg:min-w-[14rem] space-y-3">
                            <div className="inline-flex w-full lg:w-auto items-center justify-center gap-2 bg-primary/5 text-primary rounded-xl px-4 py-2.5 text-sm font-bold">
                                <PackageCheck className="w-4 h-4" />
                                {report.weight}
                            </div>
                            {showEditButton && (
                                <button
                                    type="button"
                                    onClick={() => setUpdateModalOpen(true)}
                                    className="inline-flex w-full lg:w-auto items-center justify-center gap-2 rounded-xl bg-primary text-white px-4 py-2.5 text-sm font-extrabold shadow-sm shadow-primary/25 transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest"
                                >
                                    <FilePenLine className="w-4 h-4" />
                                    Chỉnh sửa báo cáo
                                </button>
                            )}
                            {showComplaintButton && (
                                <button
                                    type="button"
                                    onClick={() => setComplaintOpen(true)}
                                    className="inline-flex w-full lg:w-auto items-center justify-center gap-2 rounded-xl bg-rose-600 text-white px-4 py-2.5 text-sm font-extrabold shadow-sm shadow-rose-600/25 transition-colors hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest"
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    Khiếu nại báo cáo
                                </button>
                            )}
                        </div>
                    </div>

                    {images.length > 0 && (
                        <div className="space-y-4 border-t border-surface-container-high/60 pt-8">
                            <h2 className="text-lg font-extrabold text-on-surface">Hình ảnh hiện trường</h2>
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-4">
                                <div className="min-w-0 w-full max-w-full overflow-hidden rounded-2xl border border-surface-container-high/60 bg-surface-container-low aspect-[4/3] sm:aspect-video lg:max-w-[min(100%,42rem)]">
                                    {activeSrc ? (
                                        <img
                                            src={activeSrc}
                                            alt={`Ảnh ${activeImageIndex + 1} của báo cáo ${report.id}`}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : null}
                                </div>
                                {images.length > 1 && (
                                    <div className="flex gap-2 lg:flex-col lg:w-28 shrink-0 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0 -mx-1 px-1 lg:mx-0 lg:px-0">
                                        {images.map((src, index) => {
                                            const isActive = index === activeImageIndex;
                                            return (
                                                <button
                                                    key={`${report.id}-img-${index}`}
                                                    type="button"
                                                    onClick={() => setActiveImageIndex(index)}
                                                    className={`relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 lg:w-full lg:aspect-square rounded-xl overflow-hidden border-2 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${isActive
                                                        ? 'border-primary ring-2 ring-primary/25 shadow-md'
                                                        : 'border-transparent opacity-90 hover:opacity-100 hover:border-surface-container-high'
                                                        }`}
                                                    aria-label={`Xem ảnh ${index + 1}`}
                                                    aria-pressed={isActive}
                                                >
                                                    <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 border-t border-surface-container-high/60 pt-8">
                        <h2 className="text-lg font-extrabold text-on-surface inline-flex items-center gap-2">
                            <MapIcon className="w-5 h-5 text-primary" />
                            Vị trí trên bản đồ
                        </h2>
                        {embedSrc ? (
                            <div className="overflow-hidden rounded-2xl border border-surface-container-high/60 bg-surface-container-low shadow-inner">
                                <iframe
                                    title={`Bản đồ khu vực: ${report.location}`}
                                    className="h-[min(420px,55vh)] w-full border-0"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={embedSrc}
                                />
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-surface-container-high p-8 text-center text-sm text-on-surface-variant">
                                Chưa có dữ liệu bản đồ cho báo cáo này.
                            </div>
                        )}
                    </div>
                </article>

                <FeedbackModal
                    open={complaintOpen}
                    onClose={() => setComplaintOpen(false)}
                    reportId={report.id}
                    reportStatusLabel={statusLabel}
                />
                <UpdateReportModal
                    open={updateModalOpen}
                    onClose={() => setUpdateModalOpen(false)}
                    initialDetail={reportDetailRaw}
                    onUpdated={(updatedReport) => {
                        if (updatedReport && typeof updatedReport === 'object') {
                            applyReportDetail(updatedReport);
                        }
                    }}
                />
            </div>
        </div>
    );
}
