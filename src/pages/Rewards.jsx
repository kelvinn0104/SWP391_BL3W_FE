import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Star,
  ArrowRight,
  Search,
  History,
  X,
  Zap,
  Copy,
  Check,
  Loader2
} from 'lucide-react';
import AlertModal from '../components/ui/AlertModal';
import { getVouchers, getVoucherCategories, redeemVoucher } from '../api/voucherApi';
import { getApiBaseUrl, resolveImageUrl, fetchMe } from '../lib/auth';
import { getUserPointNow } from '../api/UserpointApi';

// Small inner component for Copyable Code
const RewardCodeCopy = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={handleCopy}
      className="mt-4 flex items-center justify-between bg-surface-container-highest/50 px-5 py-3 rounded-2xl border border-dashed border-primary/30 cursor-pointer hover:bg-primary/5 transition-all group"
    >
      <div className="flex flex-col items-start">
        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Mã quà tặng của bạn</span>
        <span className="text-xl font-mono font-black text-on-surface tracking-widest uppercase">{code}</span>
      </div>
      <div className={`p-2 rounded-xl transition-all ${copied ? 'bg-success text-white' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'}`}>
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </div>
    </div>
  );
};

export default function Rewards() {
  const REWARDS_PER_PAGE = 8;
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReward, setSelectedReward] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [vouchers, setVouchers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Alert Modal State
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: null,
    type: 'success'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vData, cData, pointData] = await Promise.all([
        getVouchers(),
        getVoucherCategories(),
        getUserPointNow(),
      ]);
      setVouchers(vData || []);
      setCategories([{ id: 'all', label: 'Tất cả' }, ...(cData || []).map(c => ({ id: c.name, label: c.name }))]);
      setUserPoints(Number(pointData?.currentBalance ?? pointData?.points ?? 0));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRewards = useMemo(() => {
    return vouchers.filter(r => {
      const matchCategory = activeTab === 'all' || r.category === activeTab;
      const matchSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeTab, searchQuery, vouchers]);

  const totalPages = Math.ceil(filteredRewards.length / REWARDS_PER_PAGE);

  const paginatedRewards = useMemo(() => {
    const startIndex = (currentPage - 1) * REWARDS_PER_PAGE;
    return filteredRewards.slice(startIndex, startIndex + REWARDS_PER_PAGE);
  }, [currentPage, filteredRewards]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleRedeemConfirm = async () => {
    if (!selectedReward) return;

    setIsRedeeming(true);
    try {
      const result = await redeemVoucher(selectedReward.id);

      setAlertConfig({
        isOpen: true,
        title: 'Thành Công!',
        message: (
          <div className="space-y-2">
            <p>
              Bạn đã đổi thành công phần quà: <span className="text-primary font-black">{selectedReward.title}</span>.
            </p>
            <RewardCodeCopy code={result.code} />
            <p className="text-[10px] mt-4 font-medium italic opacity-60">Hãy kiểm tra ví của bạn để xem chi tiết nhé!</p>
          </div>
        ),
        type: 'success'
      });

      // Update local points
      setUserPoints(prev => prev - selectedReward.points);
      
      // Sync global points in Navbar/Profile
      try {
        await fetchMe();
      } catch (syncErr) {
        console.error("Failed to sync user data:", syncErr);
      }
      
      setSelectedReward(null);
    } catch (err) {
      setAlertConfig({
        isOpen: true,
        title: 'Lỗi',
        message: err.message || "Không thể đổi quà lúc này.",
        type: 'error'
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10 animate-in fade-in duration-500">

        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-surface px-3 py-1 text-[11px] font-black tracking-wider text-primary shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              ECO REWARDS
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight">Đổi quà Eco</h1>
            <p className="text-on-surface-variant text-sm md:text-[15px] max-w-2xl">
              Dùng điểm Eco để đổi voucher ưu đãi. Chọn quà bạn thích và xác nhận đổi ngay.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative overflow-hidden bg-surface rounded-2xl border border-surface-container-highest shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
              <div className="relative px-6 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-primary rounded-2xl flex items-center justify-center text-white shadow-md shadow-primary/25">
                  <Zap className="w-4 h-4" fill="currentColor" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Điểm của bạn</span>
                  <span className="text-2xl font-black text-on-surface">{userPoints.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <Link
              to="/rewards/history"
              className="p-3 bg-surface rounded-2xl border border-surface-container-highest hover:border-primary/30 hover:bg-surface-container-high transition-all text-on-surface-variant shadow-sm"
              title="Lịch sử đổi quà"
            >
              <History className="w-6 h-6" />
            </Link>
          </div>
        </header>

        {/* Filters & Search */}
        <div className="bg-surface rounded-3xl border border-surface-container-highest p-4 md:p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
            <div className="flex flex-wrap items-center gap-2 max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-black transition-all border ${
                    activeTab === cat.id
                      ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                      : 'bg-surface text-on-surface-variant border-surface-container-highest hover:border-primary/30 hover:text-on-surface'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Tìm theo tên phần quà..."
                className="w-full bg-surface-container py-3 pl-10 pr-10 rounded-2xl text-sm font-bold text-on-surface focus:outline-none border border-transparent focus:border-primary/30 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
                  aria-label="Xóa tìm kiếm"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-on-surface-variant/60">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="font-black text-sm">Đang tải quà tặng...</p>
          </div>
        ) : filteredRewards.length === 0 ? (
          <div className="py-16">
            <div className="bg-surface rounded-3xl border border-surface-container-highest p-10 text-center shadow-sm">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="mt-5 text-xl font-black text-on-surface">Không tìm thấy phần quà phù hợp</h3>
              <p className="mt-2 text-sm text-on-surface-variant">
                Thử đổi từ khóa tìm kiếm hoặc bỏ bộ lọc hiện tại để xem thêm kết quả.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('all');
                    setSearchQuery('');
                  }}
                  className="px-5 py-3 rounded-2xl bg-primary text-white font-black shadow-md shadow-primary/25 hover:scale-[1.01] active:scale-95 transition-all"
                >
                  Xóa bộ lọc
                </button>
                <Link
                  to="/rewards/history"
                  className="px-5 py-3 rounded-2xl bg-surface-container text-on-surface font-black border border-surface-container-highest hover:bg-surface-container-high transition-all"
                >
                  Xem lịch sử đổi quà
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedRewards.map((reward) => (
              <div
                key={reward.id}
                className="group block bg-surface rounded-3xl overflow-hidden border border-surface-container-highest hover:border-primary/35 transition-all hover:shadow-xl hover:shadow-primary/10 cursor-pointer hover:-translate-y-0.5"
                onClick={() => setSelectedReward(reward)}
              >
                <div className="relative h-48 overflow-hidden bg-surface-container">
                  <img
                    src={resolveImageUrl(reward.image)}
                    alt={reward.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                    onError={(e) =>
                      (e.target.src =
                        'https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=600&auto=format&fit=crop')
                    }
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-70" />
                  {reward.isHot && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
                      Hot
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                        {reward.category}
                      </p>
                      {reward.stock !== undefined && reward.stock !== null && (
                        <span
                          className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border ${
                            Number(reward.stock) <= 0
                              ? 'bg-error/10 text-error border-error/20'
                              : 'bg-surface-container text-on-surface-variant border-surface-container-highest'
                          }`}
                          title="Số lượng còn lại"
                        >
                          {Number(reward.stock) <= 0 ? 'Hết' : `Còn: ${Number(reward.stock)}`}
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                      {reward.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-2xl bg-yellow-500/10 text-yellow-600 flex items-center justify-center">
                        <Star className="w-4 h-4" fill="currentColor" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
                          Eco Points
                        </span>
                        <span className="text-lg font-black text-on-surface">
                          {reward.points.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="w-11 h-11 bg-surface-container group-hover:bg-primary group-hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-sm group-hover:shadow-md group-hover:shadow-primary/25">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredRewards.length > 0 && (
          <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <div className="inline-flex items-center gap-2 text-sm font-black text-on-surface-variant">
              <span className="px-3 py-1.5 rounded-full bg-surface border border-surface-container-highest shadow-sm">
                Trang <span className="text-on-surface">{currentPage}</span>/{totalPages}
              </span>
              <span className="text-xs font-bold">
                Hiển thị {paginatedRewards.length}/{filteredRewards.length}
              </span>
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
              {(() => {
                const windowSize = 5;
                let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
                let end = Math.min(totalPages, start + windowSize - 1);
                if (end - start + 1 < windowSize) {
                  start = Math.max(1, end - windowSize + 1);
                }
                const pages = [];
                for (let i = start; i <= end; i++) pages.push(i);

                return pages.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`px-3.5 py-2.5 rounded-2xl border text-sm font-black transition-all shadow-sm ${currentPage === page
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/25'
                        : 'bg-surface text-on-surface-variant border-surface-container-highest hover:border-primary/30 hover:text-on-surface'
                      }`}
                  >
                    {page}
                  </button>
                ));
              })()}
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

      {/* Minimalist Claim Modal */}
      <AnimatePresence>
        {selectedReward && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReward(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-surface rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-surface-container-highest"
            >
              <div className="px-6 py-5 border-b border-surface-container-highest flex justify-between items-center">
                <div className="space-y-0.5">
                  <h4 className="font-black text-on-surface">Xác nhận đổi quà</h4>
                  <p className="text-xs font-bold text-on-surface-variant">Kiểm tra điểm và xác nhận giao dịch.</p>
                </div>
                <button
                  onClick={() => setSelectedReward(null)}
                  className="p-2 hover:bg-surface-container rounded-xl transition-colors"
                  aria-label="Đóng"
                  title="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 md:p-8 text-center space-y-7">
                <div className="w-24 h-24 mx-auto rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-surface-container">
                  <img
                    src={resolveImageUrl(selectedReward.image)}
                    alt={selectedReward.title}
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      (e.target.src =
                        'https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=600&auto=format&fit=crop')
                    }
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-on-surface">{selectedReward.title}</h3>
                  <p className="text-primary font-black">{selectedReward.points.toLocaleString()} Eco Points</p>
                </div>
                <div className="bg-surface-container p-5 rounded-2xl space-y-3 text-sm border border-surface-container-highest">
                  <div className="flex justify-between font-medium">
                    <span className="text-on-surface-variant">Số điểm hiện có:</span>
                    <span className="text-on-surface font-bold">{userPoints.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-surface-container-highest"></div>
                  <div className="flex justify-between font-medium">
                    <span className="text-on-surface-variant">Sử dụng điểm:</span>
                    <span className="text-error">-{selectedReward.points.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-surface-container-highest"></div>
                  <div className="flex justify-between font-bold">
                    <span className="text-on-surface-variant">Số dư còn lại:</span>
                    <span className="text-on-surface">{(userPoints - selectedReward.points).toLocaleString()}</span>
                  </div>
                </div>
                {userPoints < selectedReward.points && (
                  <p className="text-xs font-bold text-error/90">
                    Bạn chưa đủ điểm để đổi phần quà này.
                  </p>
                )}
                <button
                  onClick={handleRedeemConfirm}
                  disabled={isRedeeming || userPoints < selectedReward.points}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 flex items-center justify-center gap-3"
                >
                  {isRedeeming && <Loader2 className="w-5 h-5 animate-spin" />}
                  {userPoints < selectedReward.points ? 'Không đủ điểm' : 'Xác nhận đổi ngay'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Alert Modal */}
      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
      </div>
    </div>
  );
}

