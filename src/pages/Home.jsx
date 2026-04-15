import {motion} from 'motion/react';
import {
  Leaf,
  Camera,
  Trophy,
  BarChart3,
  Check,
  Recycle,
  Upload,
  ArrowRight,
  Globe,
  Zap,
  Users,
  ShieldCheck,
  Smartphone,
  Trash2,
  Droplets,
  Wind,
  Truck,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-20 md:space-y-32 pb-24 md:pb-32 px-4 sm:px-6 md:px-16">
      {/* Hero Section - Editorial Style */}
      <section className="relative pt-12 lg:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <motion.div
            initial={{opacity: 0, y: 30}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8, ease: [0.16, 1, 0.3, 1]}}
            className="lg:col-span-6 space-y-8"
          >
            <div className="inline-flex items-center gap-3 bg-primary/5 px-5 py-2 rounded-full border border-primary/10">
              <Sparkles className="w-4 h-4 text-primary fill-current" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                Nền tảng tái chế thế hệ mới
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-serif italic text-on-surface leading-[0.95] sm:leading-[0.9] tracking-tighter">
              Vì một <br />
              <span className="text-primary not-italic">Tương lai</span> <br />
              <span className="pl-6 sm:pl-12 lg:pl-24">Bền vững.</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-on-surface-variant leading-relaxed max-w-xl font-light italic font-serif">
              "EcoSort không chỉ là một ứng dụng, đó là lời cam kết của chúng ta với mẹ thiên nhiên."
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 pt-2 sm:pt-4">
              <button className="group relative bg-primary text-white px-8 sm:px-12 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg transition-all hover:pr-14 sm:hover:pr-16 active:scale-95 shadow-2xl shadow-primary/30 overflow-hidden">
                <span className="relative z-10">Bắt đầu hành trình</span>
                <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 opacity-0 group-hover:opacity-100 transition-all" />
              </button>
              <button className="px-8 sm:px-12 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg border-2 border-surface-container-highest hover:bg-surface-container-low transition-all">
                Khám phá thêm
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{opacity: 0, scale: 0.95}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 1, delay: 0.2}}
            className="lg:col-span-6 relative"
          >
            <div className="relative aspect-[4/3] rounded-[2rem] sm:rounded-[3rem] overflow-hidden botanical-shadow">
              <img
                src="/images/background.png"
                alt="Green forest"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

              {/* Floating Info Card */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 eco-glass p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                      Tác động toàn cầu
                    </p>
                    <p className="text-lg font-serif italic text-on-surface">
                      Giảm 15% rác thải nhựa đô thị
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-12 -right-8 w-40 h-40 bg-primary-container/20 blur-[80px] rounded-full -z-10"></div>
            <div className="absolute -bottom-8 -left-8 w-52 h-52 bg-primary/10 blur-[100px] rounded-full -z-10"></div>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats - Minimalist & Bold */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 sm:gap-x-12 border-y border-surface-container-high py-16 sm:py-20 justify-items-center text-center">
        <ImpactStat label="Rác thu gom" value="125.4" unit="Tấn" />
        <ImpactStat label="Nước tiết kiệm" value="450" unit="K Lít" />
        <ImpactStat label="Khí thải giảm" value="15.2" unit="Tấn" />
        <ImpactStat label="Thành viên" value="12.4" unit="K+" />
      </section>

      {/* Harmful Effects Section */}
      <section className="space-y-24">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-serif italic leading-tight">
            Hệ lụy của <br /> <span className="not-italic text-error">Sự thờ ơ</span>
          </h2>
          <p className="text-xl text-on-surface-variant font-light leading-relaxed">
            Rác thải không tự nhiên biến mất. Mỗi mảnh nhựa vứt bỏ sai chỗ là một "vết sẹo" để lại
            trên cơ thể của Trái Đất.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <HarmfulEffectCard
            image="/images/waste-1.png"
            title="Đại dương đang 'ngạt thở'"
            description="Hơn 8 triệu tấn nhựa đổ vào đại dương mỗi năm, tàn phá hệ sinh thái biển và chuỗi thức ăn toàn cầu."
          />
          <HarmfulEffectCard
            image="/images/waste-2.png"
            title="Khí thải nhà kính"
            description="Rác thải phân hủy không kiểm soát giải phóng khí Methane - loại khí gây hiệu ứng nhà kính mạnh gấp 25 lần CO2."
          />
          <HarmfulEffectCard
            image="/images/waste-3.png"
            title="Đe dọa sức khỏe"
            description="Vi nhựa và hóa chất độc hại từ bãi rác ngấm vào nguồn nước, trực tiếp ảnh hưởng đến sức khỏe con người."
          />
        </div>
      </section>

      {/* How it Works - Asymmetrical Layout */}
      <section className="space-y-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-serif italic leading-tight">
            Quy trình <br /> <span className="not-italic text-primary">Vận hành</span>
          </h2>
          <p className="text-xl text-on-surface-variant font-light leading-relaxed">
            Chúng tôi kết hợp công nghệ AI tiên tiến với mạng lưới hậu cần thông minh để tối ưu hóa
            việc tái chế.
          </p>
          <button className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm hover:gap-4 transition-all">
            Xem chi tiết quy trình <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <StepCard
            number="01"
            title="Nhận diện AI"
            description="Chụp ảnh rác thải, hệ thống EcoVision sẽ phân tích và hướng dẫn bạn cách phân loại tối ưu."
          />
          <StepCard
            number="02"
            title="Thu gom thông minh"
            description="Đội ngũ EcoRiders sẽ đến thu gom theo lịch trình được tối ưu hóa bằng thuật toán."
          />
          <StepCard
            number="03"
            title="Tái sinh giá trị"
            description="Rác thải được đưa đến các trung tâm tái chế đối tác để bắt đầu vòng đời mới."
          />
        </div>
      </section>

      {/* Featured Categories - Grid with Hover Effects */}
      <section className="bg-on-surface text-surface rounded-[2.5rem] sm:rounded-[4rem] p-8 sm:p-12 md:p-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[150px] -z-0"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif italic leading-tight">
              Phân loại <br /> <span className="not-italic text-primary-container">Chính xác</span>
            </h2>
            <p className="text-xl text-surface/70 font-light leading-relaxed max-w-lg">
              Mỗi vật liệu đều có giá trị nếu được đặt đúng chỗ. Chúng tôi hỗ trợ xử lý hơn 20 loại
              rác thải khác nhau.
            </p>
            <div className="flex flex-wrap gap-4">
              {['Nhựa', 'Giấy', 'Kim loại', 'Điện tử', 'Thủy tinh', 'Hữu cơ'].map((cat) => (
                <span
                  key={cat}
                  className="px-6 py-3 rounded-full border border-surface/20 text-sm font-bold hover:bg-surface hover:text-on-surface transition-all cursor-default"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div whileHover={{y: -10}} className="aspect-square rounded-3xl overflow-hidden">
              <img
                src="/images/waste-4.png"
                alt="Phân loại rác thải nhựa"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <motion.div
              whileHover={{y: -10}}
              className="aspect-square rounded-3xl overflow-hidden sm:mt-12"
            >
              <img
                src="/images/waste-5.png"
                alt="Tái chế giấy và bìa carton"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Leaderboard & Activity - Refined Glassmorphism */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-10">
          <div className="flex items-end justify-between">
            <h2 className="text-4xl font-serif italic">
              Bảng xếp hạng <span className="not-italic text-primary">Tuần</span>
            </h2>
            <button className="text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
              Tất cả
            </button>
          </div>
          <div className="bg-surface-container-lowest rounded-[3rem] p-8 botanical-shadow border border-surface-container-high/50 divide-y divide-surface-container-high">
            <LeaderboardItem
              rank={1}
              name="Nguyễn Văn A"
              points="4,250"
              avatar="https://picsum.photos/seed/user1/100/100"
            />
            <LeaderboardItem
              rank={2}
              name="Trần Thị B"
              points="3,800"
              avatar="https://picsum.photos/seed/user2/100/100"
            />
            <LeaderboardItem
              rank={3}
              name="Lê Văn C"
              points="3,150"
              avatar="https://picsum.photos/seed/user3/100/100"
            />
            <LeaderboardItem
              rank={4}
              name="Phạm Minh D"
              points="2,900"
              avatar="https://picsum.photos/seed/user4/100/100"
            />
          </div>
        </div>

        <div className="space-y-10">
          <div className="flex items-end justify-between">
            <h2 className="text-4xl font-serif italic">
              Hoạt động <span className="not-italic text-primary">Trực tiếp</span>
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              Live
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-[3rem] p-8 botanical-shadow border border-surface-container-high/50 space-y-2">
            <ActivityItem
              user="Minh"
              action="vừa phân loại 2kg nhựa"
              time="2 phút trước"
              icon={<Recycle className="w-4 h-4" />}
            />
            <ActivityItem
              user="An"
              action="vừa đổi quà: Túi vải canvas"
              time="15 phút trước"
              icon={<Trophy className="w-4 h-4" />}
            />
            <ActivityItem
              user="Hoàng"
              action="đã hoàn thành thử thách tuần"
              time="1 giờ trước"
              icon={<Check className="w-4 h-4" />}
            />
            <ActivityItem
              user="Linh"
              action="vừa tham gia EcoSort"
              time="2 giờ trước"
              icon={<Leaf className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* Final CTA - Immersive Background */}
      <section className="relative rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden min-h-[420px] sm:min-h-[520px] lg:min-h-[600px] flex items-center justify-center text-center p-6 sm:p-10 md:p-12">
        <img
          src="/images/background-1.png"
          alt="Nature background"
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

        <div className="relative z-10 max-w-4xl space-y-12 text-white">
          <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif italic leading-tight">
            Hãy để thiên nhiên <br /> <span className="not-italic">Mỉm cười</span> trở lại.
          </h2>
          <p className="text-base sm:text-lg md:text-2xl font-light italic opacity-90 max-w-2xl mx-auto">
            "Hành trình vạn dặm bắt đầu từ một bước chân. Hành trình xanh bắt đầu từ một hành động
            nhỏ."
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-8 pt-4 sm:pt-8">
            <button className="bg-white text-primary px-10 sm:px-16 py-4 sm:py-6 rounded-full font-black text-base sm:text-xl hover:bg-primary-container hover:text-white transition-all shadow-2xl">
              Tham gia ngay
            </button>
            <button className="px-10 sm:px-16 py-4 sm:py-6 rounded-full font-black text-base sm:text-xl border-2 border-white/40 hover:bg-white/10 transition-all">
              Hợp tác doanh nghiệp
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ImpactStat({label, value, unit}) {
  return (
    <div className="w-full max-w-[16rem] space-y-4 text-center flex flex-col items-center">
      <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-on-surface-variant/50 min-h-[1rem]">
        {label}
      </p>
      <div className="flex items-baseline justify-center gap-2 tabular-nums">
        <span className="text-5xl sm:text-6xl font-serif italic text-on-surface leading-none">
          {value}
        </span>
        <span className="text-lg sm:text-xl font-bold text-primary leading-none">{unit}</span>
      </div>
    </div>
  );
}

function StepCard({number, title, description}) {
  return (
    <div className="space-y-8 group">
      <div className="text-8xl font-serif italic text-primary/10 group-hover:text-primary/20 transition-colors leading-none">
        {number}
      </div>
      <div className="space-y-4">
        <h3 className="text-3xl font-serif italic">{title}</h3>
        <p className="text-lg text-on-surface-variant font-light leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function LeaderboardItem({rank, name, points, avatar}) {
  return (
    <div className="flex items-center justify-between py-6 group cursor-pointer">
      <div className="flex items-center gap-6">
        <span
          className={`w-8 text-2xl font-serif italic ${rank <= 3 ? 'text-primary' : 'text-on-surface-variant/30'}`}
        >
          {rank}
        </span>
        <div className="relative">
          <img
            src={avatar}
            alt={name}
            className="w-14 h-14 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all"
            referrerPolicy="no-referrer"
          />
          {rank === 1 && (
            <div className="absolute -top-2 -right-2 bg-primary text-white p-1 rounded-lg">
              <Trophy className="w-3 h-3" />
            </div>
          )}
        </div>
        <span className="text-xl font-serif italic text-on-surface group-hover:text-primary transition-colors">
          {name}
        </span>
      </div>
      <div className="text-right">
        <p className="text-2xl font-serif italic text-primary">{points}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
          Points
        </p>
      </div>
    </div>
  );
}

function ActivityItem({user, action, time, icon}) {
  return (
    <div className="flex items-start gap-6 p-6 hover:bg-surface-container-low rounded-[2rem] transition-all cursor-pointer group">
      <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-lg text-on-surface font-light leading-snug">
          <span className="font-serif italic font-bold text-xl">{user}</span> {action}
        </p>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
          {time}
        </p>
      </div>
    </div>
  );
}

function HarmfulEffectCard({image, title, description}) {
  return (
    <motion.div whileHover={{y: -10}} className="space-y-6 group">
      <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden botanical-shadow">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="space-y-3 px-2">
        <h3 className="text-2xl font-serif italic text-on-surface">{title}</h3>
        <p className="text-on-surface-variant font-light leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

