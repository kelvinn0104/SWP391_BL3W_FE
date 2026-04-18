import { useEffect, useMemo, useState } from 'react';
import { Award, Medal, TrendingUp, Trophy, UserRound } from 'lucide-react';
import { getWeeklyLeaderboard } from '../api/LeaderboardApi';

const USERS_PER_PAGE = 5;

export default function Leaderboard() {
  const myRank = 42;
  const myPoints = 1250;
  const [currentPage, setCurrentPage] = useState(1);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadLeaderboard() {
      setIsLoading(true);
      setLoadError('');
      try {
        const data = await getWeeklyLeaderboard({ skip: 0, take: 100 });
        if (!isMounted) return;
        setLeaderboard(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!isMounted) return;
        setLeaderboard([]);
        setLoadError(error instanceof Error ? error.message : 'Không thể tải bảng xếp hạng.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadLeaderboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(leaderboard.length / USERS_PER_PAGE));
  const paginatedLeaderboard = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return leaderboard.slice(start, start + USERS_PER_PAGE);
  }, [currentPage, leaderboard]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="relative min-h-full overflow-x-hidden">
      {/* Nền chủ đề xanh lá (đồng bộ Home) */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/[0.07] via-surface to-primary-container/[0.08]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,rgba(16,185,129,0.14),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_100%_40%,rgba(0,108,73,0.06),transparent_50%)]"
        aria-hidden
      />

      <div className="relative z-0 px-4 sm:px-6 md:px-16 py-10 sm:py-14 space-y-8">
        <section className="bg-surface-container-lowest rounded-[2.5rem] sm:rounded-[3rem] p-7 sm:p-10 border border-surface-container-high/60 botanical-shadow space-y-8">
          <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-2">
              <p className="text-sm font-extrabold text-primary">Community</p>
              <h1 className="text-3xl sm:text-4xl font-sans italic text-on-surface">
                Bảng <span className="not-italic text-primary">xếp hạng</span>
              </h1>
              <p className="text-on-surface-variant max-w-2xl">
                Vinh danh những cá nhân tích cực nhất trong cộng đồng EcoSort tuần này.
              </p>
            </div>

            <div className="rounded-[2rem] border border-surface-container-high bg-surface p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-on-surface-variant uppercase tracking-widest">
                  Thứ hạng của bạn
                </p>
                <p className="text-lg sm:text-xl font-extrabold text-primary">
                  #{myRank} <span className="text-on-surface-variant font-bold">/</span>{' '}
                  {new Intl.NumberFormat('en-US').format(myPoints)} pts
                </p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leaderboard.slice(0, 3).map((item) => (
              <PodiumCard key={item.rank} {...item} />
            ))}
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-[2.5rem] sm:rounded-[3rem] border border-surface-container-high/60 botanical-shadow overflow-hidden">
          <div className="px-7 sm:px-10 py-6 border-b border-surface-container-high/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm font-extrabold text-on-surface">Tất cả người dùng</p>
            <p className="text-sm font-semibold text-on-surface-variant">
              {leaderboard.length} người tham gia
            </p>
          </div>

          {isLoading ? (
            <p className="px-7 sm:px-10 py-8 text-sm font-semibold text-on-surface-variant">
              Đang tải bảng xếp hạng...
            </p>
          ) : loadError ? (
            <p className="px-7 sm:px-10 py-8 text-sm font-semibold text-error">{loadError}</p>
          ) : leaderboard.length === 0 ? (
            <p className="px-7 sm:px-10 py-8 text-sm font-semibold text-on-surface-variant">
              Chưa có dữ liệu bảng xếp hạng.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[720px]">
                <thead className="bg-surface-container-low/30">
                  <tr className="border-b border-surface-container-high/70">
                    <th className="px-6 sm:px-10 py-4 text-xs font-black text-on-surface-variant uppercase tracking-widest">
                      Hạng
                    </th>
                    <th className="px-6 sm:px-10 py-4 text-xs font-black text-on-surface-variant uppercase tracking-widest">
                      Người dùng
                    </th>
                    <th className="px-6 sm:px-10 py-4 text-xs font-black text-on-surface-variant uppercase tracking-widest">
                      Điểm tích lũy
                    </th>
                    <th className="px-6 sm:px-10 py-4 text-xs font-black text-on-surface-variant uppercase tracking-widest">
                      Hành động xanh
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/60">
                  {paginatedLeaderboard.map((row) => (
                    <LeaderboardRow key={`${row.rank}-${row.name}`} {...row} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {leaderboard.length > 0 && !isLoading && !loadError && (
            <div className="px-7 sm:px-10 py-5 border-t border-surface-container-high/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm font-semibold text-on-surface-variant">
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
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function PodiumCard({ rank, name, points, actions, avatar }) {
  const badge = rank === 1 ? 'Top 1' : rank === 2 ? 'Top 2' : 'Top 3';
  const icon =
    rank === 1 ? (
      <Trophy className="w-5 h-5 text-yellow-600" fill="currentColor" />
    ) : rank === 2 ? (
      <Medal className="w-5 h-5 text-slate-500" fill="currentColor" />
    ) : (
      <Award className="w-5 h-5 text-amber-700" fill="currentColor" />
    );

  return (
    <div className="rounded-[2rem] border border-surface-container-high bg-surface p-5 flex items-center gap-4">
      <div className="relative">
        <img
          src={avatar}
          alt={name}
          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-primary/10"
          referrerPolicy="no-referrer"
        />
        <div className="absolute -right-2 -bottom-2 w-8 h-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-center">
          {icon}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">{badge}</p>
        <p className="text-base font-extrabold text-on-surface truncate">{name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-on-surface-variant">
          <span className="text-primary">{new Intl.NumberFormat('en-US').format(points)} pts</span>
          <span className="opacity-60">•</span>
          <span>{actions} lần</span>
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({ rank, name, points, actions, avatar }) {
  const getRankIcon = (r) => {
    if (r === 1) return <Trophy className="w-5 h-5 text-yellow-500" fill="currentColor" />;
    if (r === 2) return <Medal className="w-5 h-5 text-slate-400" fill="currentColor" />;
    if (r === 3) return <Award className="w-5 h-5 text-amber-600" fill="currentColor" />;
    return null;
  };

  return (
    <tr className="hover:bg-surface-container-low/60 transition-colors">
      <td className="px-6 sm:px-10 py-5">
        <div className="flex items-center gap-2">
          <span
            className={`text-lg font-black ${rank <= 3 ? 'text-primary' : 'text-on-surface-variant/40'}`}
          >
            {String(rank).padStart(2, '0')}
          </span>
          {getRankIcon(rank)}
        </div>
      </td>
      <td className="px-6 sm:px-10 py-5">
        <div className="flex items-center gap-4">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-10 h-10 rounded-2xl object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-surface-container-low flex items-center justify-center text-on-surface-variant">
              <UserRound className="w-5 h-5" />
            </div>
          )}
          <span className="font-extrabold text-on-surface">{name}</span>
        </div>
      </td>
      <td className="px-6 sm:px-10 py-5">
        <span className="font-extrabold text-primary">
          {new Intl.NumberFormat('en-US').format(points)} pts
        </span>
      </td>
      <td className="px-6 sm:px-10 py-5">
        <span className="font-bold text-on-surface-variant">{actions} lần</span>
      </td>
    </tr>
  );
}

