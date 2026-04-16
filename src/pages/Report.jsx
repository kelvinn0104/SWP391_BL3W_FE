import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, FileText, Filter, MapPin, PackageCheck, Plus, Tag, User } from 'lucide-react';

const FILTER_ALL = 'All';
const REPORTS_PER_PAGE = 5;

const REPORT_STATUS_OPTIONS = [
  { value: 'Pending', label: 'Chờ duyệt' },
  { value: 'Accepted', label: 'Đã chấp nhận' },
  { value: 'Assigned', label: 'Đã phân công' },
  { value: 'Collected', label: 'Đã thu gom' },
  { value: 'Canceled', label: 'Đã hủy' },
];

const REPORT_FILTER_OPTIONS = [{ value: FILTER_ALL, label: 'Tất cả' }, ...REPORT_STATUS_OPTIONS];

export function getStatusLabel(status) {
  return REPORT_STATUS_OPTIONS.find((item) => item.value === status)?.label ?? status;
}

export const MY_REPORTS = [
  {
    id: 'RP-2401',
    title: 'Nhựa và lon tại hẻm 12',
    category: 'Kim loại',
    description:
      'Tập kết chai nhựa PET, lon nước ngọt đặt cạnh thùng rác tạm tại hẻm 12. Cần thu gom trong ngày để tránh vỡ vụn và ô nhiễm.',
    location: 'Quận 3, TP.HCM',
    coordinates: { lat: 10.7829, lng: 106.6881 },
    images: [
      'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=1200&q=80',
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&q=80',
    ],
    createdAt: '2026-04-10',
    weight: '3.2kg',
    status: 'Pending',
  },
  {
    id: 'RP-2394',
    title: 'Giấy carton trước cổng chung cư',
    category: 'Giấy',
    description:
      'Thùng carton đóng gói đồ đạc, đã dẹp gọn và buộc dây. Đặt sát lề đường trước cổng B, không cản lối đi.',
    location: 'Quận 7, TP.HCM',
    coordinates: { lat: 10.7314, lng: 106.7181 },
    images: [
      'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=1200&q=80',
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&q=80',
    ],
    createdAt: '2026-04-08',
    weight: '5.1kg',
    status: 'Accepted',
  },
  {
    id: 'RP-2388',
    title: 'Điểm tập kết chai nhựa',
    category: 'Nhựa',
    description:
      'Nhiều chai nhựa đã rửa sơ, gom trong bao rác trong suốt. Khu vực có mái che nhẹ, tránh mưa làm vỡ bao.',
    location: 'Thủ Đức, TP.HCM',
    coordinates: { lat: 10.8494, lng: 106.7717 },
    images: [
      'https://images.unsplash.com/photo-1621451537084-482c73073a2f?w=1200&q=80',
      'https://images.unsplash.com/photo-1528323273322-d81489248c40?w=1200&q=80',
    ],
    createdAt: '2026-04-06',
    weight: '2.7kg',
    status: 'Assigned',
  },
  {
    id: 'RP-2379',
    title: 'Rác tái chế tại công viên',
    category: 'Nhựa',
    description:
      'Nhựa, giấy và vài mảnh kim loại nhỏ gom chung tại khu vực ghế ngồi gần lối ra. Đã phân loại sơ bộ theo túi.',
    location: 'Bình Thạnh, TP.HCM',
    coordinates: { lat: 10.8112, lng: 106.7093 },
    images: [
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80',
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200&q=80',
    ],
    createdAt: '2026-04-03',
    weight: '4.4kg',
    status: 'Collected',
  },
  {
    id: 'RP-2371',
    title: 'Kim loại vụn từ hộ gia đình',
    category: 'Kim loại',
    description:
      'Mảnh kim loại mỏng từ đồ gia dụng cũ, có cạnh tù. Người báo cáo đã bọc giấy báo để tránh trầy.',
    location: 'Gò Vấp, TP.HCM',
    coordinates: { lat: 10.8398, lng: 106.6668 },
    images: [
      'https://images.unsplash.com/photo-1581092160562-40aa08c7880a?w=1200&q=80',
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200&q=80',
    ],
    createdAt: '2026-04-01',
    weight: '1.8kg',
    status: 'Canceled',
  },
];

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
    case 'Canceled':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-surface-container-low text-on-surface-variant border-surface-container-high';
  }
}

export default function Report() {
  const [activeStatus, setActiveStatus] = useState(FILTER_ALL);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredReports = useMemo(
    () =>
      activeStatus === FILTER_ALL
        ? MY_REPORTS
        : MY_REPORTS.filter((report) => report.status === activeStatus),
    [activeStatus]
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
              <h1 className="text-3xl sm:text-4xl font-serif italic text-on-surface">
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
          {filteredReports.length === 0 ? (
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
          ) : (
            paginatedReports.map((report) => (
              <Link
                key={report.id}
                to={`/report/${encodeURIComponent(report.id)}`}
                className="block bg-surface-container-lowest rounded-3xl p-6 sm:p-7 border border-surface-container-high/60 botanical-shadow transition-all hover:border-primary/35 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
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
            ))
          )}
        </section>
        {filteredReports.length > 0 && (
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
    </div>
  );
}
