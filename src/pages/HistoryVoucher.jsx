import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Loader2, ReceiptText, Star } from 'lucide-react';
import { getRedemptionHistory } from '../api/voucherApi';
import { getUserPointNow } from '../api/UserpointApi';

export default function HistoryVoucher() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userPoints, setUserPoints] = useState(null);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      setError('');
      try {
        const [data, pointData] = await Promise.all([getRedemptionHistory(), getUserPointNow()]);
        setRows(Array.isArray(data) ? data : []);
        setUserPoints(Number(pointData?.currentBalance ?? pointData?.points ?? 0));
      } catch (err) {
        setError(err?.message || 'Không tải được lịch sử đổi quà.');
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  const totalRedemptions = rows.length;
  const totalPointsSpent = useMemo(
    () => rows.reduce((sum, item) => sum + Number(item?.points || 0), 0),
    [rows]
  );

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8 animate-in fade-in duration-500">
        <header className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-surface px-3 py-1 text-[11px] font-black tracking-wider text-primary shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              REDEEM HISTORY
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight">Lịch sử đổi quà</h1>
            <p className="text-sm md:text-[15px] text-on-surface-variant max-w-2xl">
              Theo dõi các voucher đã đổi, số lần đổi và tổng điểm bạn đã sử dụng.
            </p>
            <Link
              to="/rewards"
              className="inline-flex items-center gap-2 text-sm font-black text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại trang phần thưởng
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative overflow-hidden bg-surface rounded-3xl border border-surface-container-highest p-5 flex items-center gap-4 shadow-sm">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
            <div className="relative w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <ReceiptText className="w-6 h-6" />
            </div>
            <div className="relative">
              <p className="text-xs uppercase tracking-wider font-black text-on-surface-variant">Số lần đổi</p>
              <p className="text-2xl font-black text-on-surface">{totalRedemptions}</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-surface rounded-3xl border border-surface-container-highest p-5 flex items-center gap-4 shadow-sm">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
            <div className="relative w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Star className="w-6 h-6" fill="currentColor" />
            </div>
            <div className="relative">
              <p className="text-xs uppercase tracking-wider font-black text-on-surface-variant">
                Điểm hiện tại của bạn
              </p>
              <p className="text-2xl font-black text-on-surface">
                {userPoints === null ? '...' : userPoints.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-surface rounded-3xl border border-surface-container-highest p-5 flex items-center gap-4 shadow-sm">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
            <div className="relative w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Star className="w-6 h-6" fill="currentColor" />
            </div>
            <div className="relative">
              <p className="text-xs uppercase tracking-wider font-black text-on-surface-variant">Điểm đã tiêu hao</p>
              <p className="text-2xl font-black text-on-surface">{totalPointsSpent.toLocaleString()}</p>
            </div>
          </div>
        </section>

        <section className="bg-surface rounded-3xl border border-surface-container-highest overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-surface-container-highest flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-0.5">
              <h2 className="font-black text-on-surface">Chi tiết giao dịch</h2>
              <p className="text-xs font-bold text-on-surface-variant">
                Danh sách giao dịch đổi quà gần đây của bạn.
              </p>
            </div>
            {!loading && !error && (
              <span className="text-xs font-black text-on-surface-variant">
                Tổng: <span className="text-on-surface">{rows.length}</span>
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
              <Loader2 className="w-9 h-9 animate-spin text-primary" />
              <p className="text-sm font-black">Đang tải lịch sử...</p>
            </div>
          ) : error ? (
            <div className="py-12 px-6 text-center">
              <p className="text-error font-black">{error}</p>
              <p className="mt-2 text-sm text-on-surface-variant font-bold">
                Vui lòng thử tải lại trang hoặc kiểm tra kết nối.
              </p>
            </div>
          ) : rows.length === 0 ? (
            <div className="py-14 px-6 text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <ReceiptText className="w-6 h-6" />
              </div>
              <h3 className="mt-5 text-xl font-black text-on-surface">Chưa có giao dịch đổi quà</h3>
              <p className="mt-2 text-sm text-on-surface-variant font-bold">
                Hãy quay lại trang phần thưởng để đổi voucher đầu tiên của bạn.
              </p>
              <div className="mt-6">
                <Link
                  to="/rewards"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-primary text-white font-black shadow-md shadow-primary/25 hover:scale-[1.01] active:scale-95 transition-all"
                >
                  Đi tới trang đổi quà
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-6 py-3 font-black">Mã giao dịch</th>
                    <th className="text-left px-6 py-3 font-black">Quà đã đổi</th>
                    <th className="text-left px-6 py-3 font-black">Mã voucher</th>
                    <th className="text-left px-6 py-3 font-black">Điểm tiêu hao</th>
                    <th className="text-left px-6 py-3 font-black">Trạng thái</th>
                    <th className="text-left px-6 py-3 font-black">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-surface-container-highest hover:bg-surface-container-lowest/60 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-black text-on-surface">{item.transactionId}</td>
                      <td className="px-6 py-4 text-sm font-bold text-on-surface">{item.gift}</td>
                      <td className="px-6 py-4 text-sm font-mono font-black text-primary">{item.codeUsed}</td>
                      <td className="px-6 py-4 text-sm font-black text-error">
                        -{Number(item.points || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                          <BadgeCheck className="w-3.5 h-3.5" />
                          {(item.status || 'approved').toString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-on-surface-variant">{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
