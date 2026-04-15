import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, PackageCheck, Star, ClipboardList } from 'lucide-react';
import { getUser } from '../lib/auth';
import { getStatusLabel, MY_REPORTS, statusClassName } from './Report';

const REPORTS_PER_PAGE = 5;

function parseWeightKg(weight) {
  if (!weight) return 0;
  const raw = String(weight).trim().toLowerCase();
  const match = raw.match(/-?\d+(\.\d+)?/);
  const value = match ? Number.parseFloat(match[0]) : Number.NaN;
  return Number.isFinite(value) ? value : 0;
}

function readPointsBalance() {
  const user = getUser();
  if (typeof user?.points === 'number') return user.points;
  const raw = localStorage.getItem('ecosort_points');
  const value = raw === null ? 0 : Number(raw);
  return Number.isFinite(value) ? value : 0;
}

export default function History() {
  const [pointsBalance, setPointsBalance] = useState(() => readPointsBalance());
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const onChanged = () => setPointsBalance(readPointsBalance());
    window.addEventListener('storage', onChanged);
    window.addEventListener('ecosort_auth_changed', onChanged);
    window.addEventListener('ecosort_points_changed', onChanged);
    return () => {
      window.removeEventListener('storage', onChanged);
      window.removeEventListener('ecosort_auth_changed', onChanged);
      window.removeEventListener('ecosort_points_changed', onChanged);
    };
  }, []);

  const completedReports = useMemo(
    () => MY_REPORTS.filter((r) => r.status === 'Collected'),
    []
  );

  const stats = useMemo(() => {
    const totalKg = completedReports.reduce((sum, r) => sum + parseWeightKg(r.weight), 0);
    return {
      count: completedReports.length,
      totalKg,
    };
  }, [completedReports]);

  const pointsText = useMemo(
    () => new Intl.NumberFormat('en-US').format(pointsBalance),
    [pointsBalance]
  );

  const totalPages = Math.ceil(completedReports.length / REPORTS_PER_PAGE);
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * REPORTS_PER_PAGE;
    return completedReports.slice(startIndex, startIndex + REPORTS_PER_PAGE);
  }, [completedReports, currentPage]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="px-4 sm:px-6 md:px-16 py-10 sm:py-14 space-y-8">
      <Link
        to="/report"
        className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Report
      </Link>

      <section className="bg-surface-container-lowest rounded-[2.5rem] sm:rounded-[3rem] p-7 sm:p-10 border border-surface-container-high/60 botanical-shadow space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-primary font-extrabold">
            <ClipboardList className="w-5 h-5" />
            <span>Lịch sử</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif italic text-on-surface">
            Báo cáo <span className="not-italic text-primary">đã hoàn thành</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            Xem danh sách các báo cáo đã thu gom xong và theo dõi tổng khối lượng, điểm thưởng hiện có.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-3xl border border-surface-container-high bg-surface p-5 space-y-1">
            <p className="text-xs font-black uppercase tracking-wide text-on-surface-variant">Số báo cáo hoàn thành</p>
            <p className="text-3xl font-extrabold text-on-surface">{stats.count}</p>
          </div>
          <div className="rounded-3xl border border-surface-container-high bg-surface p-5 space-y-1">
            <p className="text-xs font-black uppercase tracking-wide text-on-surface-variant">Tổng khối lượng</p>
            <p className="text-3xl font-extrabold text-on-surface">
              {String(Math.round(stats.totalKg * 10) / 10)} <span className="text-base font-bold text-on-surface-variant">kg</span>
            </p>
          </div>
          <div className="rounded-3xl border border-surface-container-high bg-surface p-5 space-y-1">
            <p className="text-xs font-black uppercase tracking-wide text-on-surface-variant">Điểm thưởng hiện có</p>
            <p className="text-3xl font-extrabold text-primary inline-flex items-center gap-2">
              <Star className="w-6 h-6" fill="currentColor" />
              {pointsText}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {completedReports.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-surface-container-high/60 text-on-surface-variant">
            Chưa có báo cáo nào ở trạng thái <span className="font-bold text-primary">{getStatusLabel('Collected')}</span>.
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
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${statusClassName(report.status)}`}>
                      {getStatusLabel(report.status)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-on-surface-variant">Mã report: {report.id}</p>
                </div>

                <div className="inline-flex items-center gap-2 bg-primary/5 text-primary rounded-xl px-3 py-2 text-sm font-bold self-start">
                  <PackageCheck className="w-4 h-4" />
                  {report.weight}
                </div>
              </div>
            </Link>
          ))
        )}
      </section>
      {completedReports.length > 0 && (
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
                className={`px-3 py-2 rounded-xl border text-sm font-bold transition-all ${
                  currentPage === page
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
  );
}
