import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Star } from 'lucide-react';

const DEFAULT_POINTS = 0;

function readPoints() {
  const raw = localStorage.getItem('ecosort_points');
  if (raw === null) return DEFAULT_POINTS;
  const value = Number(raw);
  return Number.isFinite(value) ? value : DEFAULT_POINTS;
}

export default function Rewards() {
  const [pointsBalance, setPointsBalance] = useState(() => readPoints());

  useEffect(() => {
    const onChanged = () => setPointsBalance(readPoints());
    window.addEventListener('storage', onChanged);
    window.addEventListener('ecosort_points_changed', onChanged);
    return () => {
      window.removeEventListener('storage', onChanged);
      window.removeEventListener('ecosort_points_changed', onChanged);
    };
  }, []);

  const pointsText = useMemo(
    () => new Intl.NumberFormat('en-US').format(pointsBalance),
    [pointsBalance]
  );

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface">Đổi quà hấp dẫn</h1>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-surface-container-high bg-surface-container-lowest px-4 py-2 text-sm font-extrabold text-primary botanical-shadow">
            <Star className="w-4 h-4" fill="currentColor" />
            <span>{pointsText} Points</span>
          </div>
        </div>
        <p className="text-on-surface-variant text-lg max-w-2xl">
          Sử dụng điểm EcoSort bạn đã tích lũy được để đổi lấy những phần quà thân thiện với môi
          trường.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <RewardCard
          image="https://picsum.photos/seed/bag/400/300"
          title="Túi vải Canvas Eco"
          points={500}
          category="Phụ kiện"
        />
        <RewardCard
          image="https://picsum.photos/seed/bottle/400/300"
          title="Bình nước giữ nhiệt"
          points={1200}
          category="Đồ dùng"
        />
        <RewardCard
          image="https://picsum.photos/seed/voucher/400/300"
          title="Voucher Highland 50k"
          points={800}
          category="Ẩm thực"
        />
      </div>
    </div>
  );
}

function RewardCard({ image, title, points, category }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-surface-container-lowest rounded-[2rem] overflow-hidden botanical-shadow border border-surface-container-high/50"
    >
      <img src={image} alt={title} className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{category}</p>
            <h3 className="text-xl font-extrabold text-on-surface">{title}</h3>
          </div>
          <div className="bg-primary-container/10 px-3 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 text-primary" fill="currentColor" />
            <span className="text-xs font-bold text-primary">{points}</span>
          </div>
        </div>
        <button className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
          Đổi ngay
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

