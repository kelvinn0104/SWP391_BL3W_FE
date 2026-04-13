import {motion} from 'motion/react';
import {Star, ArrowRight} from 'lucide-react';

export default function Rewards() {
  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface">Đổi quà hấp dẫn</h1>
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

function RewardCard({image, title, points, category}) {
  return (
    <motion.div
      whileHover={{y: -5}}
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

