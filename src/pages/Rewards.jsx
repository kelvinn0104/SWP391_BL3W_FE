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
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
      <header className="rounded-3xl border border-surface-container-high/60 bg-surface-container-lowest botanical-shadow p-6 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-on-surface">
              Đổi quà hấp dẫn
            </h1>
            <p className="text-on-surface-variant text-base sm:text-lg max-w-2xl">
              Sử dụng điểm EcoSort bạn đã tích lũy được để đổi lấy những phần quà thân thiện với
              môi trường.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-surface-container-high bg-surface-container-lowest px-4 py-3 text-sm font-extrabold text-primary">
              <Star className="w-4 h-4" fill="currentColor" />
              <span aria-label="Số điểm hiện có">{pointsText} điểm</span>
            </div>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-on-surface">Danh sách quà tặng</h2>
          <p className="text-sm text-on-surface-variant">Chọn quà và bấm “Đổi ngay”.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
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
      </section>
    </div>
  );
}

function RewardCard({ image, title, points, category }) {
  const pointsText = useMemo(() => new Intl.NumberFormat('en-US').format(points), [points]);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group bg-surface-container-lowest rounded-[2rem] overflow-hidden botanical-shadow border border-surface-container-high/50 transition-transform"
    >
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="w-full aspect-[16/9] object-cover"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-black/0 opacity-90" />
        <div className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-xs font-bold text-white backdrop-blur">
          <Star className="w-3.5 h-3.5 text-white" fill="currentColor" />
          <span>{pointsText}</span>
          <span className="opacity-90">điểm</span>
        </div>
      </div>

      <div className="p-6 sm:p-7 space-y-4">
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-primary uppercase tracking-widest">{category}</p>
          <h3 className="text-lg sm:text-xl font-extrabold text-on-surface leading-snug">
            {title}
          </h3>
        </div>

        <div className="pt-1">
          <button
            type="button"
            className="w-full bg-primary hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
          >
            Đổi ngay
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

