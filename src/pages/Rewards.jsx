import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  ArrowRight, 
  Search, 
  ChevronRight,
  History,
  X,
  ShieldCheck,
  CreditCard,
  LayoutGrid,
  Zap,
  Copy,
  Check
} from 'lucide-react';
import AlertModal from '../components/ui/AlertModal';

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
  
  // Alert Modal State
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: null,
    type: 'success'
  });
  
  const userPoints = 12850;

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'voucher', label: 'Voucher' },
    { id: 'tech', label: 'Công nghệ' },
    { id: 'food', label: 'Ẩm thực' },
    { id: 'travel', label: 'Du lịch' },
  ];

  const rewards = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=600&auto=format&fit=crop",
      title: "Sony WH-1000XM5",
      points: 45000,
      category: "tech",
      isHot: true
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop",
      title: "Highlands 100k",
      points: 1500,
      category: "food"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop",
      title: "Eco Smartwatch",
      points: 12500,
      category: "tech",
      isHot: true
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1622484210924-423f03021966?q=80&w=600&auto=format&fit=crop",
      title: "Agoda 500k",
      points: 8000,
      category: "travel"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=600&auto=format&fit=crop",
      title: "Shopee 200k",
      points: 3200,
      category: "voucher"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1591337676887-a217a6970c8a?q=80&w=600&auto=format&fit=crop",
      title: "iPhone 15 Pro Max",
      points: 250000,
      category: "tech"
    }
  ];

  const filteredRewards = useMemo(() => {
    return rewards.filter(r => {
      const matchCategory = activeTab === 'all' || r.category === activeTab;
      const matchSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeTab, searchQuery]);

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

  const showSuccess = (rewardTitle) => {
    const generatedCode = `ECO-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    setAlertConfig({
      isOpen: true,
      title: 'Thành Công!',
      message: (
        <div className="space-y-2">
          <p>
            Bạn đã đổi thành công phần quà: <span className="text-primary font-black">{rewardTitle}</span>.
          </p>
          <RewardCodeCopy code={generatedCode} />
          <p className="text-[10px] mt-4 font-medium italic opacity-60">Hãy kiểm tra ví của bạn để xem chi tiết nhé!</p>
        </div>
      ),
      type: 'success'
    });
    setSelectedReward(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-12 animate-in fade-in duration-500">
      
      {/* Simple Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Đổi quà Eco</h1>
          <p className="text-on-surface-variant text-sm">Sử dụng điểm của bạn để nhận ưu đãi hấp dẫn.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-surface-container-highest px-6 py-3 rounded-2xl flex items-center gap-3 border border-surface-container-high shadow-sm">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                <Zap className="w-4 h-4" fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Điểm của bạn</span>
                <span className="text-xl font-black text-on-surface">{userPoints.toLocaleString()}</span>
              </div>
           </div>
           <button className="p-3 bg-surface-container hover:bg-surface-container-high rounded-2xl transition-colors text-on-surface-variant" title="Lịch sử">
              <History className="w-6 h-6" />
           </button>
        </div>
      </header>

      {/* Simplified Filters & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 border-b border-surface-container-highest pb-8">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`
                px-5 py-2.5 rounded-full text-sm font-bold transition-all
                ${activeTab === cat.id 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm kiếm nhanh..."
            className="w-full bg-surface-container py-3 pl-10 pr-4 rounded-xl text-sm font-bold text-on-surface focus:outline-none border border-transparent focus:border-primary/30 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Clean Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedRewards.map((reward) => (
          <div 
            key={reward.id}
            className="group block bg-surface rounded-2xl overflow-hidden border border-surface-container-highest hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
            onClick={() => setSelectedReward(reward)}
          >
            <div className="relative h-48 overflow-hidden bg-surface-container">
              <img 
                src={reward.image} 
                alt={reward.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                referrerPolicy="no-referrer"
              />
              {reward.isHot && (
                <div className="absolute top-3 left-3 bg-orange-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-lg">
                  Hot
                </div>
              )}
            </div>
            <div className="p-5 space-y-4">
               <div>
                 <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{reward.category}</p>
                 <h3 className="font-extrabold text-on-surface truncate group-hover:text-primary transition-colors">{reward.title}</h3>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                    <span className="text-lg font-black text-on-surface">{reward.points.toLocaleString()}</span>
                  </div>
                  <div className="w-10 h-10 bg-surface-container group-hover:bg-primary group-hover:text-white rounded-xl flex items-center justify-center transition-all">
                     <ArrowRight className="w-4 h-4" />
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRewards.length > 0 && (
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

      {filteredRewards.length === 0 && (
        <div className="py-20 text-center text-on-surface-variant/40 italic">
          Không tìm thấy kết quả nào.
        </div>
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
              <div className="p-6 border-b border-surface-container-highest flex justify-between items-center">
                 <h4 className="font-black text-on-surface">Xác nhận đổi quà</h4>
                 <button onClick={() => setSelectedReward(null)} className="p-1 hover:bg-surface-container rounded-lg"><X /></button>
              </div>
              <div className="p-8 text-center space-y-8">
                 <div className="w-24 h-24 mx-auto rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                    <img src={selectedReward.image} alt="" className="w-full h-full object-cover" />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-xl font-black text-on-surface">{selectedReward.title}</h3>
                    <p className="text-primary font-bold">{selectedReward.points.toLocaleString()} Eco Points</p>
                 </div>
                 <div className="bg-surface-container p-5 rounded-2xl space-y-3 text-sm border border-surface-container-highest">
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
                 <button 
                  onClick={() => showSuccess(selectedReward.title)}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                 >
                   Xác nhận đổi ngay
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
  );
}

