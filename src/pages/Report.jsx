import {useMemo, useState} from 'react';
import {CalendarDays, Filter, MapPin, PackageCheck, Plus, User} from 'lucide-react';

const REPORT_STATUS_OPTIONS = [
  {value: 'Pending', label: 'Chờ duyệt'},
  {value: 'Accepted', label: 'Đã chấp nhận'},
  {value: 'Assigned', label: 'Đã phân công'},
  {value: 'Collected', label: 'Đã thu gom'},
  {value: 'Canceled', label: 'Đã hủy'},
];

function getStatusLabel(status) {
  return REPORT_STATUS_OPTIONS.find((item) => item.value === status)?.label ?? status;
}

const MY_REPORTS = [
  {
    id: 'RP-2401',
    title: 'Nhựa và lon tại hẻm 12',
    location: 'Quận 3, TP.HCM',
    createdAt: '2026-04-10',
    weight: '3.2kg',
    status: 'Pending',
  },
  {
    id: 'RP-2394',
    title: 'Giấy carton trước cổng chung cư',
    location: 'Quận 7, TP.HCM',
    createdAt: '2026-04-08',
    weight: '5.1kg',
    status: 'Accepted',
  },
  {
    id: 'RP-2388',
    title: 'Điểm tập kết chai nhựa',
    location: 'Thủ Đức, TP.HCM',
    createdAt: '2026-04-06',
    weight: '2.7kg',
    status: 'Assigned',
  },
  {
    id: 'RP-2379',
    title: 'Rác tái chế tại công viên',
    location: 'Bình Thạnh, TP.HCM',
    createdAt: '2026-04-03',
    weight: '4.4kg',
    status: 'Collected',
  },
  {
    id: 'RP-2371',
    title: 'Kim loại vụn từ hộ gia đình',
    location: 'Gò Vấp, TP.HCM',
    createdAt: '2026-04-01',
    weight: '1.8kg',
    status: 'Canceled',
  },
];

function statusClassName(status) {
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
  const [activeStatus, setActiveStatus] = useState('Pending');

  const filteredReports = useMemo(
    () => MY_REPORTS.filter((report) => report.status === activeStatus),
    [activeStatus]
  );

  return (
    <div className="px-4 sm:px-6 md:px-16 py-10 sm:py-14 space-y-8">
      <section className="bg-surface-container-lowest rounded-[2.5rem] sm:rounded-[3rem] p-7 sm:p-10 border border-surface-container-high/60 botanical-shadow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-primary font-extrabold">
              <User className="w-5 h-5" />
              <span>Danh sách report của tôi</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif italic text-on-surface">
              Quản lý trạng thái <span className="not-italic text-primary">Report Waste</span>
            </h1>
            <p className="text-on-surface-variant">
              Theo dõi các report theo trạng thái: Chờ duyệt / Đã chấp nhận / Đã phân công / Đã thu
              gom / Đã hủy.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-white px-4 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.99] shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              Tạo báo cáo
            </button>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-surface-container-high px-4 py-2.5 text-sm font-semibold text-on-surface-variant">
              <Filter className="w-4 h-4 text-primary" />
              {filteredReports.length} report
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {REPORT_STATUS_OPTIONS.map((statusOption) => {
            const isActive = statusOption.value === activeStatus;
            return (
              <button
                key={statusOption.value}
                type="button"
                onClick={() => setActiveStatus(statusOption.value)}
                className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                  isActive
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
            Chưa có report nào ở trạng thái{' '}
            <span className="font-bold text-primary">{getStatusLabel(activeStatus)}</span>.
          </div>
        ) : (
          filteredReports.map((report) => (
            <article
              key={report.id}
              className="bg-surface-container-lowest rounded-3xl p-6 sm:p-7 border border-surface-container-high/60 botanical-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface">{report.title}</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black border ${statusClassName(report.status)}`}
                    >
                      {getStatusLabel(report.status)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-on-surface-variant">Mã report: {report.id}</p>
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
            </article>
          ))
        )}
      </section>
    </div>
  );
}
