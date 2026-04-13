import {Trophy, Medal, Award, TrendingUp} from 'lucide-react';

export default function Leaderboard() {
  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface">Bảng xếp hạng</h1>
          <p className="text-on-surface-variant text-lg max-w-2xl">
            Vinh danh những cá nhân tích cực nhất trong cộng đồng EcoSort tuần này.
          </p>
        </div>
        <div className="bg-primary-container/10 p-4 rounded-2xl flex items-center gap-4">
          <TrendingUp className="text-primary w-8 h-8" />
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              Thứ hạng của bạn
            </p>
            <p className="text-xl font-black text-primary">#42 / 1,250 pts</p>
          </div>
        </div>
      </header>

      <div className="bg-surface-container-lowest rounded-[2.5rem] botanical-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-container-high">
                <th className="px-8 py-6 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  Hạng
                </th>
                <th className="px-8 py-6 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  Người dùng
                </th>
                <th className="px-8 py-6 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  Điểm tích lũy
                </th>
                <th className="px-8 py-6 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  Hành động xanh
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/50">
              <LeaderboardRow
                rank={1}
                name="Nguyễn Văn A"
                points="4,250"
                actions={124}
                avatar="https://picsum.photos/seed/user1/100/100"
              />
              <LeaderboardRow
                rank={2}
                name="Trần Thị B"
                points="3,800"
                actions={98}
                avatar="https://picsum.photos/seed/user2/100/100"
              />
              <LeaderboardRow
                rank={3}
                name="Lê Văn C"
                points="3,150"
                actions={85}
                avatar="https://picsum.photos/seed/user3/100/100"
              />
              <LeaderboardRow
                rank={4}
                name="Phạm Minh D"
                points="2,900"
                actions={72}
                avatar="https://picsum.photos/seed/user4/100/100"
              />
              <LeaderboardRow
                rank={5}
                name="Hoàng Văn E"
                points="2,750"
                actions={68}
                avatar="https://picsum.photos/seed/user5/100/100"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({rank, name, points, actions, avatar}) {
  const getRankIcon = (r) => {
    if (r === 1) return <Trophy className="w-5 h-5 text-yellow-500" fill="currentColor" />;
    if (r === 2) return <Medal className="w-5 h-5 text-slate-400" fill="currentColor" />;
    if (r === 3) return <Award className="w-5 h-5 text-amber-600" fill="currentColor" />;
    return null;
  };

  return (
    <tr className="hover:bg-surface-container-low transition-colors group">
      <td className="px-8 py-6">
        <div className="flex items-center gap-2">
          <span
            className={`text-lg font-black ${rank <= 3 ? 'text-primary' : 'text-on-surface-variant/40'}`}
          >
            {String(rank).padStart(2, '0')}
          </span>
          {getRankIcon(rank)}
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <img
            src={avatar}
            alt={name}
            className="w-10 h-10 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
          <span className="font-bold text-on-surface">{name}</span>
        </div>
      </td>
      <td className="px-8 py-6">
        <span className="font-extrabold text-primary">{points} pts</span>
      </td>
      <td className="px-8 py-6">
        <span className="font-bold text-on-surface-variant">{actions} lần</span>
      </td>
    </tr>
  );
}

