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
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <Link
            to="/rewards"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang phần thưởng
          </Link>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Lịch sử đổi quà</h1>
          <p className="text-sm text-on-surface-variant">
            Theo dõi các voucher đã đổi, số lần đổi và tổng điểm bạn đã sử dụng.
          </p>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl border border-surface-container-highest p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <ReceiptText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">Số lần đổi</p>
            <p className="text-2xl font-black text-on-surface">{totalRedemptions}</p>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-surface-container-highest p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Star className="w-6 h-6" fill="currentColor" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">
              Điểm hiện tại của bạn
            </p>
            <p className="text-2xl font-black text-on-surface">
              {userPoints === null ? '...' : userPoints.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-surface-container-highest p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Star className="w-6 h-6" fill="currentColor" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">Điểm đã tiêu hao</p>
            <p className="text-2xl font-black text-on-surface">{totalPointsSpent.toLocaleString()}</p>
          </div>
        </div>
      </section>

      <section className="bg-surface rounded-2xl border border-surface-container-highest overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-container-highest">
          <h2 className="font-extrabold text-on-surface">Chi tiết giao dịch</h2>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-semibold">Đang tải lịch sử...</p>
          </div>
        ) : error ? (
          <div className="py-12 px-5 text-center text-error font-semibold">{error}</div>
        ) : rows.length === 0 ? (
          <div className="py-12 px-5 text-center text-on-surface-variant font-semibold">
            Bạn chưa có giao dịch đổi quà nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3 font-bold">Mã giao dịch</th>
                  <th className="text-left px-5 py-3 font-bold">Quà đã đổi</th>
                  <th className="text-left px-5 py-3 font-bold">Mã voucher</th>
                  <th className="text-left px-5 py-3 font-bold">Điểm tiêu hao</th>
                  <th className="text-left px-5 py-3 font-bold">Trạng thái</th>
                  <th className="text-left px-5 py-3 font-bold">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} className="border-t border-surface-container-highest">
                    <td className="px-5 py-4 text-sm font-bold text-on-surface">{item.transactionId}</td>
                    <td className="px-5 py-4 text-sm text-on-surface">{item.gift}</td>
                    <td className="px-5 py-4 text-sm font-mono text-primary">{item.codeUsed}</td>
                    <td className="px-5 py-4 text-sm font-bold text-error">-{Number(item.points || 0).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        {item.status || 'approved'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
