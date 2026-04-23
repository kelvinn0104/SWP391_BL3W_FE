import React, { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Ban,
  Edit2,
  Loader2,
  Lock,
  ShieldCheck,
  Trash2,
  Unlock,
  UserRound,
} from "lucide-react";
import {
  deleteAccount,
  getCitizens,
  getCollectors,
  lockAccount,
} from "../../api/userApi";
import ConfirmModal from "../modal/ConfirmModal";
import UpdateCollectorProfileModal from "../modal/UpdateCollectorProfileModal";
import Pagination from "./Pagination";

const PAGE_SIZE = 5;

/** Chỉ định nghĩa cột — dùng chung header & body; 5 cột giữa chia đều 1fr */
const ACCOUNT_TABLE_COLS =
  "[grid-template-columns:2.75rem_minmax(0,1.15fr)_minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(9.5rem,max-content)]";

/** @param {number} colIndex 0..6 */
function accountTableColAlign(colIndex) {
  if (colIndex === 0 || colIndex >= 5) return "justify-center text-center";
  return "justify-start text-left";
}

/** @param {unknown} roleRaw */
function getRoleKey(roleRaw) {
  const r = String(roleRaw ?? "").trim();
  if (r === "Citizen" || r === "1") return "citizen";
  if (r === "Collector" || r === "2") return "collector";
  return "other";
}

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
    roleKey: getRoleKey(roleRaw),
    status: isLocked ? "blocked" : "active",
    raw: p,
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

/**
 * @param {object} props
 * @param {ReturnType<typeof mapProfileToRow>} props.it
 * @param {{ id: string | number; kind: 'lock' | 'delete' } | null} props.busy
 * @param {(row: ReturnType<typeof mapProfileToRow>) => void} [props.onEditAccount]
 * @param {(row: ReturnType<typeof mapProfileToRow>) => void} props.onToggleLock
 * @param {(row: ReturnType<typeof mapProfileToRow>) => void} props.onDelete
 */
function AccountActions({ it, busy, onEditAccount, onToggleLock, onDelete }) {
  const disabled = busy != null;
  const rowBusy = busy != null && String(busy.id) === String(it.id);
  const lockLoading = rowBusy && busy.kind === "lock";
  const deleteLoading = rowBusy && busy.kind === "delete";
  const allowEditDelete = it.roleKey === "collector";

  return (
    <div
      className="flex items-center justify-center gap-1.5 shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      {allowEditDelete ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onEditAccount?.(it)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-surface-container-high/80 bg-surface-container-low text-on-surface-variant shadow-sm hover:border-primary/35 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-40"
          aria-label="Chỉnh sửa"
          title="Chỉnh sửa"
        >
          <Edit2 className="w-4.5 h-4.5" strokeWidth={2.25} />
        </button>
      ) : null}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onToggleLock(it)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-surface-container-high/80 bg-surface-container-low text-on-surface-variant shadow-sm hover:border-amber-400/50 hover:bg-amber-500/10 hover:text-amber-800 dark:hover:text-amber-200 transition-all disabled:opacity-40"
        aria-label={it.status === "active" ? "Khóa tài khoản" : "Mở khóa"}
        title={it.status === "active" ? "Khóa" : "Mở khóa"}
      >
        {lockLoading ? (
          <Loader2 className="w-4.5 h-4.5 animate-spin text-primary" />
        ) : it.status === "active" ? (
          <Lock className="w-4.5 h-4.5" strokeWidth={2.25} />
        ) : (
          <Unlock className="w-4.5 h-4.5" strokeWidth={2.25} />
        )}
      </button>
      {allowEditDelete ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDelete(it)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-surface-container-high/80 bg-surface-container-low text-on-surface-variant shadow-sm hover:border-error/40 hover:bg-error/10 hover:text-error transition-all disabled:opacity-40"
          aria-label="Xóa tài khoản"
          title="Xóa"
        >
          {deleteLoading ? (
            <Loader2 className="w-4.5 h-4.5 animate-spin text-error" />
          ) : (
            <Trash2 className="w-4.5 h-4.5" strokeWidth={2.25} />
          )}
        </button>
      ) : null}
    </div>
  );
}

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
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] sm:text-xs font-black ring-1 whitespace-nowrap max-w-full ${cfg.className}`}
    >
      <I className="w-3.5 h-3.5 shrink-0" />
      {cfg.label}
    </span>
  );
}

/**
 * @param {object} props
 * @param {"citizens" | "collectors"} props.accountKind — gọi API tương ứng
 * @param {number | null} [props.wardId] — chỉ dùng khi accountKind === "collectors"
 * @param {(row: ReturnType<typeof mapProfileToRow>) => void} [props.onEditAccount] — chỉ áp dụng khi không phải citizen
 */
export default function AccountList({
  accountKind,
  wardId = null,
  tabs = DEFAULT_TABS,
  emptyText = "Chưa có tài khoản nào.",
  query: queryProp,
  onQueryChange,
  onEditAccount,
}) {
  const [internalQuery, setInternalQuery] = useState("");
  const [tab, setTab] = useState(tabs?.[0]?.id ?? "all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [busy, setBusy] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

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
  }, [accountKind, wardId, refreshNonce]);

  function openLockConfirm(it) {
    if (busy != null || it.id == null) return;
    setConfirmAction({ type: "lock", row: it });
  }

  function openDeleteConfirm(it) {
    if (busy != null || it.id == null) return;
    setConfirmAction({ type: "delete", row: it });
  }

  function handleEdit(it) {
    onEditAccount?.(it);
    if (busy != null || it?.id == null) return;
    setEditTarget(it);
    setEditOpen(true);
  }

  async function handleConfirmModal() {
    if (confirmAction?.row?.id == null) return;
    const it = confirmAction.row;
    if (confirmAction.type === "lock") {
      const nextLocked = it.status === "active";
      setBusy({ id: it.id, kind: "lock" });
      try {
        await lockAccount(it.id, nextLocked);
        setRefreshNonce((n) => n + 1);
      } catch (e) {
        setError(e?.message || "Không cập nhật được trạng thái khóa.");
      } finally {
        setBusy(null);
        setConfirmAction(null);
      }
    } else {
      setBusy({ id: it.id, kind: "delete" });
      try {
        await deleteAccount(it.id);
        setRefreshNonce((n) => n + 1);
      } catch (e) {
        setError(e?.message || "Không xóa được tài khoản.");
      } finally {
        setBusy(null);
        setConfirmAction(null);
      }
    }
  }

  const confirmModalCopy = useMemo(() => {
    if (!confirmAction?.row) return null;
    const it = confirmAction.row;
    if (confirmAction.type === "delete") {
      return {
        title: "Xác nhận xóa",
        message: `Xóa tài khoản ${it.email}? Hành động không thể hoàn tác.`,
        confirmText: "Xóa",
        variant: "danger",
      };
    }
    if (it.status === "active") {
      return {
        title: "Khóa tài khoản?",
        message: `Khóa tài khoản ${it.email}? Người dùng sẽ không thể đăng nhập.`,
        confirmText: "Khóa",
        variant: "danger",
      };
    }
    return {
      title: "Mở khóa tài khoản?",
      message: `Mở khóa tài khoản ${it.email}?`,
      confirmText: "Mở khóa",
      variant: "success",
    };
  }, [confirmAction]);

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

      <div className="rounded-3xl border border-surface-container-high/80 bg-surface-container-lowest shadow-sm overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block w-full overflow-x-auto">
          <div className="w-full min-w-0">
            <div
              className={`grid items-center ${ACCOUNT_TABLE_COLS} gap-x-3 lg:gap-x-4 px-5 lg:px-8 py-4 border-b border-surface-container-high/70 bg-surface-container-low/90`}
            >
              {[
                "STT",
                "Tên",
                "Email",
                "Số điện thoại",
                "Vai trò",
                "Trạng thái",
                "Hành động",
              ].map((label, i) => (
                <div
                  key={label}
                  className={`min-w-0 w-full flex items-center px-1.5 ${accountTableColAlign(i)}`}
                >
                  <span className="text-[11px] font-black tracking-wider uppercase text-on-surface-variant/55 leading-tight max-w-full">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="px-6 py-14 text-center text-on-surface-variant font-semibold">
                {emptyText}
              </div>
            ) : (
              <div>
                {pagedItems.map((it, index) => (
                  <div
                    key={it.id}
                    className={`grid items-start ${ACCOUNT_TABLE_COLS} gap-x-3 lg:gap-x-4 px-5 lg:px-8 py-4 lg:py-4.5 border-b border-surface-container-high/50 last:border-b-0 transition-colors duration-150 odd:bg-white even:bg-surface-container-low/40 dark:odd:bg-surface-container-lowest dark:even:bg-surface-container-low/25 hover:bg-primary/4`}
                  >
                    <div className="flex items-center justify-center min-h-11 self-center">
                      <span className="text-sm font-black text-on-surface-variant tabular-nums">
                        {(page - 1) * PAGE_SIZE + index + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex items-start gap-3 px-1.5 py-0.5">
                      <p className="font-extrabold text-on-surface text-[15px] leading-snug min-w-0 wrap-break-word whitespace-normal">
                        {it.name || "—"}
                      </p>
                    </div>
                    <div className="min-w-0 px-1.5 py-0.5">
                      <p className="text-sm font-medium text-on-surface/90 wrap-break-word whitespace-normal">
                        {it.email || "—"}
                      </p>
                    </div>
                    <div className="min-w-0 px-1.5 py-0.5">
                      <p className="text-sm font-semibold text-on-surface tabular-nums tracking-tight break-all">
                        {it.phone || "—"}
                      </p>
                    </div>
                    <div className="min-w-0 px-1.5 py-0.5">
                      <p className="text-sm font-bold text-on-surface/95 wrap-break-word">
                        {it.role || "—"}
                      </p>
                    </div>
                    <div className="flex items-center justify-center self-center px-1.5 py-0.5">
                      <StatusPill status={it.status} />
                    </div>
                    <div className="flex items-center justify-center min-w-0 self-center px-1.5 py-0.5">
                      <AccountActions
                        it={it}
                        busy={busy}
                        onEditAccount={handleEdit}
                        onToggleLock={openLockConfirm}
                        onDelete={openDeleteConfirm}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center text-on-surface-variant font-semibold">
              {emptyText}
            </div>
          ) : (
            <div className="divide-y divide-surface-container-high/80">
              {pagedItems.map((it, index) => (
                <div
                  key={it.id}
                  className="p-5 space-y-3.5 odd:bg-white even:bg-surface-container-low/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-extrabold text-on-surface-variant tabular-nums shrink-0">
                      #{(page - 1) * PAGE_SIZE + index + 1}
                    </span>
                    <div className="min-w-0 flex-1 text-right">
                      <p
                        className="font-extrabold text-on-surface wrap-break-word whitespace-normal text-right"
                        title={it.name || undefined}
                      >
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

                  <div className="flex justify-end pt-1 border-t border-surface-container-high/50">
                    <AccountActions
                      it={it}
                      busy={busy}
                      onEditAccount={handleEdit}
                      onToggleLock={openLockConfirm}
                      onDelete={openDeleteConfirm}
                    />
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

      <ConfirmModal
        isOpen={confirmAction != null && confirmModalCopy != null}
        onClose={() => (busy == null ? setConfirmAction(null) : undefined)}
        onConfirm={handleConfirmModal}
        title={confirmModalCopy?.title}
        message={confirmModalCopy?.message}
        confirmText={confirmModalCopy?.confirmText}
        variant={confirmModalCopy?.variant ?? "danger"}
        isLoading={busy != null}
      />

      <UpdateCollectorProfileModal
        open={editOpen}
        onClose={() => (busy == null ? setEditOpen(false) : undefined)}
        collector={editTarget?.raw ?? editTarget}
        onUpdated={() => setRefreshNonce((n) => n + 1)}
      />
    </div>
  );
}
