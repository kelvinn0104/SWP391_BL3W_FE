import { getApiBaseUrl, getToken } from '../lib/auth';

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeLeaderboardItem(item, idx) {
  const rank = toNumber(item?.rank ?? item?.Rank, idx + 1);
  return {
    rank,
    name: item?.name ?? item?.Name ?? item?.displayName ?? item?.DisplayName ?? 'Người dùng EcoSort',
    points: toNumber(item?.points ?? item?.Points, 0),
    actions: toNumber(item?.actions ?? item?.Actions ?? item?.completedReports ?? item?.CompletedReports, 0),
    avatar:
      item?.avatar ??
      item?.Avatar ??
      item?.avatarUrl ??
      item?.AvatarUrl ??
      `https://picsum.photos/seed/leaderboard-${rank}/100/100`,
  };
}

export async function getWeeklyLeaderboard({ skip = 0, take = 20 } = {}) {
  const token = getToken();
  const query = new URLSearchParams({
    skip: String(skip),
    take: String(take),
  });

  const response = await fetch(`${getApiBaseUrl()}/api/leaderboard?${query.toString()}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const message = `Lỗi ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.map((item, idx) => normalizeLeaderboardItem(item, idx));
}

export async function getWeeklyLeaderboardUsers({ skip = 0, take = 20 } = {}) {
  const token = getToken();
  const query = new URLSearchParams({
    skip: String(skip),
    take: String(take),
  });

  const response = await fetch(`${getApiBaseUrl()}/api/leaderboard/users?${query.toString()}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const message = `Lỗi ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  const data = await response.json();
  const users = Array.isArray(data?.users)
    ? data.users.map((item, idx) => normalizeLeaderboardItem(item, idx))
    : [];

  return {
    totalParticipants: toNumber(data?.totalParticipants ?? data?.TotalParticipants, users.length),
    myRank: toNumber(data?.myRank ?? data?.MyRank, 0),
    myPoints: toNumber(data?.myPoints ?? data?.MyPoints, 0),
    users,
  };
}
