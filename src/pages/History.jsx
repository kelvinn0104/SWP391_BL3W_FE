import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, PackageCheck, Star, ClipboardList, Loader2 } from 'lucide-react';
import { getStatusLabel, statusClassName } from './Report';
import { getCollectedWasteReports } from '../api/WasteReportapi';
import { getUserPointHistory } from '../api/HistoryApi';

const REPORTS_PER_PAGE = 5;

function parseWeightKg(weight) {
  if (!weight) return 0;
  const raw = String(weight).trim().toLowerCase();
  const match = raw.match(/-?\d+(\.\d+)?/);
  const value = match ? Number.parseFloat(match[0]) : Number.NaN;
  return Number.isFinite(value) ? value : 0;
}

function formatWeight(kg) {
  const value = Number(kg);
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(safeValue)} kg`;
}

function mapCollectedReport(apiItem) {
  const wasteItems = Array.isArray(apiItem?.wasteItems) ? apiItem.wasteItems : [];
  const totalWeightKg = wasteItems.reduce((sum, item) => {
    const weight = Number(item?.estimatedWeightKg);
    return sum + (Number.isFinite(weight) ? weight : 0);
  }, 0);

  return {
    id: String(apiItem?.reportId ?? ''),
    title: apiItem?.title ?? 'Báo cáo không có tiêu đề',
    status: apiItem?.status ?? 'Collected',
    weight: formatWeight(totalWeightKg),
  };
}

export default function History() {
  const [activeView, setActiveView] = useState('reports');
  const [pointsBalance, setPointsBalance] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [completedReports, setCompletedReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [pointTransactions, setPointTransactions] = useState([]);
  const [pointHistoryLoading, setPointHistoryLoading] = useState(true);
  const [pointHistoryError, setPointHistoryError] = useState('');
  const [totalTransactions, setTotalTransactions] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const syncPointHistory = async () => {
      try {
        setPointHistoryLoading(true);
        setPointHistoryError('');
        const pointData = await getUserPointHistory();
        if (!isMounted) return;
        const currentBalance = Number(pointData?.currentBalance ?? 0);
        setPointsBalance(Number.isFinite(currentBalance) ? currentBalance : 0);
        setTotalTransactions(Number(pointData?.totalTransactions ?? 0));
        setPointTransactions(Array.isArray(pointData?.transactions) ? pointData.transactions : []);
      } catch (error) {
        if (!isMounted) return;
        setPointsBalance(0);
        setTotalTransactions(0);
        setPointTransactions([]);
        setPointHistoryError(error?.message || 'Không thể tải lịch sử điểm.');
      } finally {
        if (isMounted) {
          setPointHistoryLoading(false);
        }
      }
    };

    const onChanged = () => {
      syncPointHistory();
    };

    syncPointHistory();
    window.addEventListener('storage', onChanged);
    window.addEventListener('ecosort_auth_changed', onChanged);
    window.addEventListener('ecosort_points_changed', onChanged);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', onChanged);
      window.removeEventListener('ecosort_auth_changed', onChanged);
      window.removeEventListener('ecosort_points_changed', onChanged);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadCollectedReports() {
      setLoadingReports(true);
      setLoadError('');
      try {
        const data = await getCollectedWasteReports();
        if (!isMounted) return;
        const mapped = data
          .map(mapCollectedReport)
          .filter((item) => item.id && item.status === 'Collected');
        setCompletedReports(mapped);
      } catch (error) {
        if (!isMounted) return;
        setCompletedReports([]);
        setLoadError(error?.message || 'Không thể tải danh sách báo cáo đã hoàn thành.');
      } finally {
        if (isMounted) {
          setLoadingReports(false);
        }
      }
    }

    loadCollectedReports();
    return () => {
      isMounted = false;
    };
  }, []);

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
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8 animate-in fade-in duration-500">
        <Link
          to="/report"
          className="inline-flex items-center gap-2 text-sm font-black text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Report
        </Link>

        <section className="bg-surface rounded-[2.5rem] sm:rounded-[3rem] p-7 sm:p-10 border border-surface-container-highest shadow-sm space-y-8 overflow-hidden relative">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          <div className="relative space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-surface px-3 py-1 text-[11px] font-black tracking-wider text-primary shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              HISTORY
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
              Báo cáo <span className="text-primary">đã hoàn thành</span>
            </h1>
            <p className="text-on-surface-variant max-w-2xl text-sm sm:text-[15px] font-bold">
              Xem danh sách các báo cáo đã thu gom xong và theo dõi tổng khối lượng, điểm thưởng hiện có.
            </p>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative overflow-hidden rounded-3xl border border-surface-container-highest bg-surface p-5 shadow-sm">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
              <div className="relative space-y-1">
                <p className="text-xs font-black uppercase tracking-wide text-on-surface-variant">Số báo cáo hoàn thành</p>
                <p className="text-3xl font-black text-on-surface">{stats.count}</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-surface-container-highest bg-surface p-5 shadow-sm">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
              <div className="relative space-y-1">
                <p className="text-xs font-black uppercase tracking-wide text-on-surface-variant">Tổng khối lượng</p>
                <p className="text-3xl font-black text-on-surface">
                  {String(Math.round(stats.totalKg * 10) / 10)}{' '}
                  <span className="text-base font-bold text-on-surface-variant">kg</span>
                </p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-surface-container-highest bg-surface p-5 shadow-sm">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
              <div className="relative space-y-1">
                <p className="text-xs font-black uppercase tracking-wide text-on-surface-variant">Điểm thưởng hiện có</p>
                <p className="text-3xl font-black text-primary inline-flex items-center gap-2">
                  <Star className="w-6 h-6" fill="currentColor" />
                  {pointsText}
                </p>
              </div>
            </div>
          </div>

          <div className="relative inline-flex w-full sm:w-auto items-center gap-2 rounded-2xl border border-surface-container-highest bg-surface p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveView('reports')}
              className={`px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
                activeView === 'reports'
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Báo cáo
            </button>
            <button
              type="button"
              onClick={() => setActiveView('points')}
              className={`px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
                activeView === 'points'
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Lịch sử điểm
            </button>
          </div>
        </section>

      {activeView === 'points' && (
        <section className="bg-surface rounded-[2.5rem] sm:rounded-[3rem] p-7 sm:p-10 border border-surface-container-highest shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
              Lịch sử <span className="text-primary">điểm thưởng</span>
            </h2>
            <p className="text-sm font-black text-on-surface-variant">
              Tổng giao dịch: {new Intl.NumberFormat('en-US').format(totalTransactions)}
            </p>
          </div>

        {pointHistoryLoading ? (
          <div className="rounded-2xl border border-surface-container-highest bg-surface p-5 text-sm text-on-surface-variant inline-flex items-center gap-2 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="font-black">Đang tải lịch sử điểm...</span>
            </div>
        ) : pointHistoryError ? (
          <div className="rounded-2xl border border-red-200/60 bg-red-50 p-5 text-sm text-red-700 font-black">
              {pointHistoryError}
            </div>
        ) : pointTransactions.length === 0 ? (
          <div className="rounded-2xl border border-surface-container-highest bg-surface p-5 text-sm text-on-surface-variant font-black shadow-sm">
              Chưa có giao dịch điểm thưởng.
            </div>
        ) : (
          <div className="space-y-3">
            {pointTransactions.map((tx, idx) => {
              const amount = Number(tx?.amount ?? 0);
              const isEarned = String(tx?.transactionType ?? '').toLowerCase() === 'earned' || amount >= 0;
              return (
                <div
                  key={String(tx?.id ?? `tx-${idx}`)}
                  className="rounded-3xl border border-surface-container-highest bg-surface p-4 sm:p-5 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-on-surface">
                        {tx?.description || 'Giao dịch điểm thưởng'}
                      </p>
                      <p className="text-xs font-bold text-on-surface-variant">
                        {tx?.createdAtUtc ? new Date(tx.createdAtUtc).toLocaleString('vi-VN') : 'Không rõ thời gian'}
                      </p>
                      <p className="text-xs font-bold text-on-surface-variant">
                        Nguồn: {tx?.sourceType || '---'} {tx?.sourceRefId ? `#${tx.sourceRefId}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-base font-black ${isEarned ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isEarned ? '+' : '-'}
                        {new Intl.NumberFormat('en-US').format(Math.abs(amount))}
                      </p>
                      <p className="text-xs font-black text-on-surface-variant">
                        Số dư: {new Intl.NumberFormat('en-US').format(Number(tx?.balanceAfter ?? 0))}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </section>
      )}

      {activeView === 'reports' && (
        <section className="space-y-4">
        {loadingReports ? (
          <div className="bg-surface rounded-3xl p-8 border border-surface-container-highest text-on-surface-variant inline-flex items-center gap-2 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="font-black">Đang tải danh sách báo cáo hoàn thành...</span>
            </div>
        ) : loadError ? (
          <div className="bg-surface rounded-3xl p-8 border border-red-200/60 bg-red-50 text-red-700 font-black shadow-sm">
              {loadError}
            </div>
        ) : completedReports.length === 0 ? (
          <div className="bg-surface rounded-3xl p-8 border border-surface-container-highest text-on-surface-variant font-black shadow-sm">
              Chưa có báo cáo nào ở trạng thái{' '}
              <span className="text-primary">{getStatusLabel('Collected')}</span>.
            </div>
        ) : (
          paginatedReports.map((report) => (
            <Link
              key={report.id}
              to={`/report/${encodeURIComponent(report.id)}`}
              className="block bg-surface rounded-3xl p-6 sm:p-7 border border-surface-container-highest shadow-sm transition-all hover:border-primary/35 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 hover:-translate-y-0.5"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-black text-on-surface">{report.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${statusClassName(report.status)}`}>
                      {getStatusLabel(report.status)}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-on-surface-variant">Mã report: {report.id}</p>
                </div>

                <div className="inline-flex items-center gap-2 bg-primary/5 text-primary rounded-2xl px-3 py-2 text-sm font-black self-start">
                  <PackageCheck className="w-4 h-4" />
                  {report.weight}
                </div>
              </div>
            </Link>
          ))
        )}
        </section>
      )}
      {activeView === 'reports' && completedReports.length > 0 && (
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div className="inline-flex items-center gap-2 text-sm font-black text-on-surface-variant">
            <span className="px-3 py-1.5 rounded-full bg-surface border border-surface-container-highest shadow-sm">
              Trang <span className="text-on-surface">{currentPage}</span>/{totalPages}
            </span>
            <span className="text-xs font-bold">Hiển thị {paginatedReports.length}/{completedReports.length}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2.5 rounded-2xl border border-surface-container-highest bg-surface text-sm font-black text-on-surface-variant disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary/30 hover:text-on-surface transition-all shadow-sm"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`px-3.5 py-2.5 rounded-2xl border text-sm font-black transition-all shadow-sm ${
                  currentPage === page
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/25'
                    : 'bg-surface text-on-surface-variant border-surface-container-highest hover:border-primary/30 hover:text-on-surface'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2.5 rounded-2xl border border-surface-container-highest bg-surface text-sm font-black text-on-surface-variant disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary/30 hover:text-on-surface transition-all shadow-sm"
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
