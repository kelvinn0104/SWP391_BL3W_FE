import React, { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Ban, Loader2, ShieldCheck, UserRound } from "lucide-react";
import { getCitizens, getCollectors } from "../../api/userApi";
import Pagination from "./Pagination";

const PAGE_SIZE = 5;

/** @param {Record<string, unknown>} p */
function mapProfileToRow(p) {
  const userId = p.userId ?? p.UserId;
  const email = p.email ?? p.Email ?? "";
  const displayName = p.displayName ?? p.DisplayName;
  const fullName = p.fullName ?? p.FullName;
  const phoneNumber = p.phoneNumber ?? p.PhoneNumber;
  const roleRaw = p.role ?? p.Role ?? "";
  const isLocked = p.isLocked ?? p.IsLocked ?? false;
  return {
    id: userId,
    name: displayName || fullName || email || "—",
    email,
    phone: phoneNumber || "—",
    role: formatRoleLabel(roleRaw),
    status: isLocked ? "blocked" : "active",
  };
}

/** @param {unknown} role */
function formatRoleLabel(role) {
  const r = String(role ?? "").trim();
  const map = {
    Citizen: "Dân cư",
    Collector: "Người thu gom",
    1: "Dân cư",
    2: "Người thu gom",
  };
  return map[r] || r || "—";
}

const DEFAULT_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "active", label: "Đang hoạt động" },
  { id: "blocked", label: "Bị khóa" },
];

function StatusPill({ status }) {
  const cfg =
    status === "active"
      ? {
          label: "Đang hoạt động",
          className:
            "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20",
          Icon: BadgeCheck,
        }
      : status === "blocked"
        ? {
            label: "Bị khóa",
            className:
              "bg-rose-500/12 text-rose-700 dark:text-rose-300 ring-rose-500/20",
            Icon: Ban,
          }
        : {
            label: "Không rõ",
            className:
              "bg-surface-container-high text-on-surface-variant ring-surface-container-highest",
            Icon: ShieldCheck,
          };

  const I = cfg.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black ring-1 ${cfg.className}`}
    >
      <I className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

/**
 * @param {object} props
 * @param {"citizens" | "collectors"} props.accountKind — gọi API tương ứng
 * @param {number | null} [props.wardId] — chỉ dùng khi accountKind === "collectors"
 */
export default function AccountList({
  accountKind,
  wardId = null,
  tabs = DEFAULT_TABS,
  emptyText = "Chưa có tài khoản nào.",
  query: queryProp,
  onQueryChange,
}) {
  const [internalQuery, setInternalQuery] = useState("");
  const [tab, setTab] = useState(tabs?.[0]?.id ?? "all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const query = queryProp ?? internalQuery;
  const setQuery = onQueryChange ?? setInternalQuery;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const raw =
          accountKind === "collectors"
            ? await getCollectors(wardId)
            : await getCitizens();
        const list = Array.isArray(raw) ? raw.map(mapProfileToRow) : [];
        if (!cancelled) setItems(list);
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "Không tải được danh sách tài khoản.");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accountKind, wardId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      const matchesTab = tab === "all" ? true : it.status === tab;
      if (!matchesTab) return false;
      if (!q) return true;
      const hay =
        `${it.name ?? ""} ${it.email ?? ""} ${it.phone ?? ""} ${it.role ?? ""} ${it.id ?? ""}`
          .toLowerCase()
          .trim();
      return hay.includes(q);
    });
  }, [items, query, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [query, tab, accountKind, wardId]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-transparent py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-semibold">Đang tải danh sách tài khoản…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/80 dark:bg-rose-950/30 px-6 py-8 text-center">
        <p className="text-sm font-bold text-rose-800 dark:text-rose-200">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-2xl font-extrabold text-sm transition-all ${
              tab === t.id
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-[0.98]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-surface-container-high bg-surface-container-lowest overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block">
          <div className="grid grid-cols-12 gap-3 px-6 py-4 border-b border-surface-container-high bg-surface">
            <div className="col-span-1 text-xs font-black tracking-widest uppercase text-on-surface-variant/60 text-center">
              STT
            </div>
            <div className="col-span-2 text-xs font-black tracking-widest uppercase text-on-surface-variant/60">
              Tên
            </div>
            <div className="col-span-3 text-xs font-black tracking-widest uppercase text-on-surface-variant/60">
              Email
            </div>
            <div className="col-span-2 text-xs font-black tracking-widest uppercase text-on-surface-variant/60">
              Số điện thoại
            </div>
            <div className="col-span-2 text-xs font-black tracking-widest uppercase text-on-surface-variant/60">
              Vai trò
            </div>
            <div className="col-span-2 text-xs font-black tracking-widest uppercase text-on-surface-variant/60 text-right">
              Trạng thái
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-on-surface-variant font-semibold">
              {emptyText}
            </div>
          ) : (
            <div className="divide-y divide-surface-container-high">
              {pagedItems.map((it, index) => (
                <div
                  key={it.id}
                  className="grid grid-cols-12 gap-3 px-6 py-4 hover:bg-surface-container-low transition-colors"
                >
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-sm font-extrabold text-on-surface tabular-nums">
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </span>
                  </div>
                  <div className="col-span-2 min-w-0 flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <UserRound className="w-4 h-4" />
                    </div>
                    <p className="font-extrabold text-on-surface truncate min-w-0">
                      {it.name || "—"}
                    </p>
                  </div>
                  <div className="col-span-3 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">
                      {it.email || "—"}
                    </p>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">
                      {it.phone || "—"}
                    </p>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">
                      {it.role || "—"}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <StatusPill status={it.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center text-on-surface-variant font-semibold">
              {emptyText}
            </div>
          ) : (
            <div className="divide-y divide-surface-container-high">
              {filtered.map((it, index) => (
                <div key={it.id} className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-extrabold text-on-surface-variant tabular-nums shrink-0">
                      #{index + 1}
                    </span>
                    <div className="min-w-0 flex-1 text-right">
                      <p className="font-extrabold text-on-surface truncate">
                        {it.name || "—"}
                      </p>
                      <p className="text-xs text-on-surface-variant font-semibold truncate">
                        {it.email || "—"}
                      </p>
                    </div>
                    <StatusPill status={it.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-surface px-4 py-3 border border-surface-container-high">
                      <p className="text-[10px] font-black tracking-widest uppercase text-on-surface-variant/60">
                        Số điện thoại
                      </p>
                      <p className="text-sm font-bold text-on-surface">
                        {it.phone || "—"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-surface px-4 py-3 border border-surface-container-high">
                      <p className="text-[10px] font-black tracking-widest uppercase text-on-surface-variant/60">
                        Vai trò
                      </p>
                      <p className="text-sm font-bold text-on-surface">
                        {it.role || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        className="pt-2"
      />
    </div>
  );
}
