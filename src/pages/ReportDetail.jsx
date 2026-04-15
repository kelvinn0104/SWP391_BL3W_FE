import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowLeft,
    CalendarDays,
    FileText,
    Map as MapIcon,
    MapPin,
    PackageCheck,
    Tag,
} from 'lucide-react';
import { getStatusLabel, MY_REPORTS, statusClassName } from './Report';
import FeedbackModal from '../components/modal/FeedbackModal';

function mapEmbedSrc(lat, lng) {
    const q = `${lat},${lng}`;
    return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=16&hl=vi&output=embed`;
}

export default function ReportDetail() {
    const { id: rawId } = useParams();
    const id = rawId ? decodeURIComponent(rawId) : '';
    const report = MY_REPORTS.find((r) => r.id === id);

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [complaintOpen, setComplaintOpen] = useState(false);

    useEffect(() => {
        setActiveImageIndex(0);
    }, [id]);

    const images = report?.images ?? [];
    const activeSrc = images[activeImageIndex] ?? images[0];

    const embedSrc = useMemo(() => {
        if (!report?.coordinates) return null;
        return mapEmbedSrc(report.coordinates.lat, report.coordinates.lng);
    }, [report]);

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
                        Không tìm thấy báo cáo với mã{' '}
                        <span className="font-bold text-on-surface">{id || '—'}</span>.
                    </div>
                </div>
            </div>
        );
    }

    const showComplaintButton = report.status === 'Collected' || report.status === 'Canceled';
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
                            <h1 className="text-3xl sm:text-4xl font-serif italic text-on-surface">{report.title}</h1>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-black border ${statusClassName(report.status)}`}
                            >
                                {getStatusLabel(report.status)}
                            </span>
                        </div>
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
            </div>
        </div>
    );
}
