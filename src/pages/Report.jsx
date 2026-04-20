import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, FileText, Filter, MapPin, PackageCheck, Plus, Tag, Trash2, User } from 'lucide-react';
import { getMyWasteReports } from '../api/WasteReportapi';
import CancelModal from '../components/modal/CancelModal';

const FILTER_ALL = 'All';
const REPORTS_PER_PAGE = 5;

const REPORT_STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'Assigned', label: 'Assigned' },
  { value: 'Collected', label: 'Collected' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const REPORT_FILTER_OPTIONS = [{ value: FILTER_ALL, label: 'All' }, ...REPORT_STATUS_OPTIONS];
export const MY_REPORTS = [];
const ESTIMATED_POINT_VISIBLE_STATUSES = new Set(['Pending', 'Accepted', 'Assigned']);
const CANCELED_STATUSES = new Set(['Cancelled', 'Canceled']);

export function getStatusLabel(status) {
  return REPORT_STATUS_OPTIONS.find((item) => item.value === status)?.label ?? status;
}

export function statusClassName(status) {
  switch (status) {
    case 'Pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Accepted':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Assigned':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'Collected':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Cancelled':
    case 'Canceled':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-surface-container-low text-on-surface-variant border-surface-container-high';
  }
}

export default function Report() {
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState('');
  const [activeStatus, setActiveStatus] = useState(FILTER_ALL);
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedReportForCancel, setSelectedReportForCancel] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadReports() {
      setLoadingReports(true);
      setReportsError('');
      try {
        const data = await getMyWasteReports();
        if (!isMounted) return;

        const normalized = data.map((report) => {
          const wasteItems = Array.isArray(report.wasteItems) ? report.wasteItems : [];
          const categoryLabel = wasteItems
            .map((item) => item?.wasteCategoryName)
            .filter(Boolean)
            .join(', ');
          const totalWeight = wasteItems.reduce((sum, item) => {
            const weight = Number(item?.estimatedWeightKg ?? 0);
            return sum + (Number.isFinite(weight) ? weight : 0);
          }, 0);
          const formattedDate = report.createdAtUtc
            ? new Date(report.createdAtUtc).toLocaleDateString('vi-VN')
            : 'Không rõ';

          return {
            id: String(report.reportId),
            title: report.title || `Báo cáo #${report.reportId}`,
            category: categoryLabel || 'Chưa phân loại',
            description: report.description || 'Không có mô tả',
            location: report.locationText || 'Chưa có địa chỉ',
            createdAt: formattedDate,
            weight: `${Math.round(totalWeight * 10) / 10}kg`,
            status: report.status || 'Pending',
            cancellationReason: String(report.cancellationReason ?? report.note ?? '').trim(),
            estimatedTotalPoints: Number(report.estimatedTotalPoints ?? 0),
            finalRewardPoints: Number(report.finalRewardPoints ?? 0),
          };
        });

        setReports(normalized);
      } catch (error) {
        if (!isMounted) return;
        setReports([]);
        setReportsError(error?.message || 'Không thể tải danh sách báo cáo.');
      } finally {
        if (isMounted) {
          setLoadingReports(false);
        }
      }
    }

    loadReports();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredReports = useMemo(
    () =>
      activeStatus === FILTER_ALL
        ? reports
        : reports.filter((report) => report.status === activeStatus),
    [activeStatus, reports]
  );

  const totalPages = Math.ceil(filteredReports.length / REPORTS_PER_PAGE);

  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * REPORTS_PER_PAGE;
    return filteredReports.slice(startIndex, startIndex + REPORTS_PER_PAGE);
  }, [currentPage, filteredReports]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function openCancelModal(report) {
    setSelectedReportForCancel(report);
    setCancelModalOpen(true);
  }

  function closeCancelModal() {
    setCancelModalOpen(false);
    setSelectedReportForCancel(null);
  }

  function handleReportCanceled(reportId, nextStatus) {
    setReports((current) =>
      current.map((item) =>
        item.id === String(reportId)
          ? {
            ...item,
            status: nextStatus || 'Cancelled',
          }
          : item
      )
    );
  }

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
        <section className="bg-surface-container-lowest rounded-[2.5rem] sm:rounded-[3rem] p-7 sm:p-10 border border-surface-container-high/60 botanical-shadow">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-primary font-extrabold">
                <User className="w-5 h-5" />
                <span>Danh sách reports của tôi</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-sans italic text-on-surface">
                Quản lý trạng thái <span className="not-italic text-primary">Report Waste</span>
              </h1>
              <p className="text-on-surface-variant max-w-2xl">
                Xem nhanh báo cáo bạn đã gửi và biết đơn đang ở bước nào trong quy trình xử lý — lọc
                theo thẻ trạng thái bên dưới.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Link
                to="/report/create"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-white px-4 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.99] shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                Tạo báo cáo
              </Link>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-surface-container-high px-4 py-2.5 text-sm font-semibold text-on-surface-variant">
                <Filter className="w-4 h-4 text-primary" />
                {filteredReports.length} reports
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {REPORT_FILTER_OPTIONS.map((statusOption) => {
              const isActive = statusOption.value === activeStatus;
              return (
                <button
                  key={statusOption.value}
                  type="button"
                  onClick={() => setActiveStatus(statusOption.value)}
                  className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${isActive
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/25'
                    : 'bg-surface text-on-surface-variant border-surface-container-high hover:border-primary/40 hover:text-primary'
                    }`}
                >
                  {statusOption.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          {loadingReports && (
            <div className="bg-surface-container-lowest rounded-3xl p-8 border border-surface-container-high/60 text-on-surface-variant">
              Đang tải danh sách báo cáo...
            </div>
          )}
          {!loadingReports && reportsError && (
            <div className="bg-surface-container-lowest rounded-3xl p-8 border border-red-200 text-red-700">
              {reportsError}
            </div>
          )}
          {!loadingReports && !reportsError && filteredReports.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-3xl p-8 border border-surface-container-high/60 text-on-surface-variant">
              {activeStatus === FILTER_ALL ? (
                <>Chưa có báo cáo nào.</>
              ) : (
                <>
                  Chưa có báo cáo nào ở trạng thái{' '}
                  <span className="font-bold text-primary">{getStatusLabel(activeStatus)}</span>.
                </>
              )}
            </div>
          ) : !loadingReports && !reportsError ? (
            paginatedReports.map((report) => (
              <article
                key={report.id}
                className="bg-surface-container-lowest rounded-3xl p-6 sm:p-7 border border-surface-container-high/60 botanical-shadow"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    {ESTIMATED_POINT_VISIBLE_STATUSES.has(report.status) && (
                      <div className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-black text-primary">
                        Điểm thưởng dự kiến:{' '}
                        {new Intl.NumberFormat('en-US').format(
                          Number.isFinite(report.estimatedTotalPoints) ? report.estimatedTotalPoints : 0
                        )}
                      </div>
                    )}
                    {report.status === 'Collected' && (
                      <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
                        Điểm thưởng nhận được:{' '}
                        {new Intl.NumberFormat('en-US').format(
                          Number.isFinite(report.finalRewardPoints) ? report.finalRewardPoints : 0
                        )}
                      </div>
                    )}
                  </div>
                  {report.status === 'Pending' && (
                    <button
                      type="button"
                      onClick={() => openCancelModal(report)}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 transition-colors hover:bg-rose-100"
                      aria-label={`Hủy báo cáo ${report.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                      Hủy báo cáo
                    </button>
                  )}
                </div>

                <Link
                  to={`/report/${encodeURIComponent(report.id)}`}
                  className="block transition-all hover:border-primary/35 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-2xl"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface">{report.title}</h2>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black border ${statusClassName(report.status)}`}
                        >
                          {getStatusLabel(report.status)}
                        </span>
                        {CANCELED_STATUSES.has(report.status) && Boolean(report.cancellationReason) && (
                          <span className="inline-flex items-center rounded-full border border-surface-container-high bg-surface px-3 py-1 text-xs font-bold text-on-surface-variant">
                            <span className="font-black text-on-surface-variant">Lý do hủy:</span>
                            <span className="ml-1">{report.cancellationReason}</span>
                          </span>
                        )}
                      </div>
                      <div className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                        <Tag className="w-4 h-4 shrink-0" />
                        <span>{report.category}</span>
                      </div>
                      <p className="text-sm font-semibold text-on-surface-variant">Mã reports: {report.id}</p>
                      <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                        <span className="inline-flex items-start gap-2">
                          <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{report.description}</span>
                        </span>
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 bg-primary/5 text-primary rounded-xl px-3 py-2 text-sm font-bold">
                      <PackageCheck className="w-4 h-4" />
                      {report.weight}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-on-surface-variant">
                    <div className="inline-flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{report.location}</span>
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-primary" />
                      <span>Ngày tạo: {report.createdAt}</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))
          ) : null}
        </section>
        {!loadingReports && !reportsError && filteredReports.length > 0 && (
          <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <p className="text-sm text-on-surface-variant font-semibold">
              Trang {currentPage}/{totalPages}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-surface-container-high bg-surface text-sm font-bold text-on-surface-variant disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary/40 hover:text-primary transition-all"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-xl border text-sm font-bold transition-all ${currentPage === page
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/25'
                    : 'bg-surface text-on-surface-variant border-surface-container-high hover:border-primary/40 hover:text-primary'
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-surface-container-high bg-surface text-sm font-bold text-on-surface-variant disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary/40 hover:text-primary transition-all"
              >
                Sau
              </button>
            </div>
          </section>
        )}
      </div>
      <CancelModal
        open={cancelModalOpen}
        report={selectedReportForCancel}
        onClose={closeCancelModal}
        onCanceled={handleReportCanceled}
      />
    </div>
  );
}
