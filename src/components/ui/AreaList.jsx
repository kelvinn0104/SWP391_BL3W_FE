import React, { useMemo, useState } from "react";
import { BadgeCheck, Ban, MapPin, ShieldCheck } from "lucide-react";

const DEFAULT_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "active", label: "Đang hoạt động" },
  { id: "inactive", label: "Tạm dừng" },
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
      : status === "inactive"
        ? {
            label: "Tạm dừng",
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

export default function AreaList({
  tabs = DEFAULT_TABS,
  items = [],
  emptyText = "Chưa có khu vực nào.",
  query: queryProp,
  onQueryChange,
}) {
  const [internalQuery, setInternalQuery] = useState("");
  const [tab, setTab] = useState(tabs?.[0]?.id ?? "all");

  const query = queryProp ?? internalQuery;
  const setQuery = onQueryChange ?? setInternalQuery;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      const matchesTab = tab === "all" ? true : it.status === tab;
      if (!matchesTab) return false;
      if (!q) return true;
      const hay = `${it.name ?? ""} ${it.code ?? ""} ${it.district ?? ""} ${it.city ?? ""} ${it.id ?? ""}`
        .toLowerCase()
        .trim();
      return hay.includes(q);
    });
  }, [items, query, tab]);

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
        <div className="hidden md:block">
          <div className="grid grid-cols-12 gap-3 px-6 py-4 border-b border-surface-container-high bg-surface">
            <div className="col-span-4 text-xs font-black tracking-widest uppercase text-on-surface-variant/60">
              Khu vực
            </div>
            <div className="col-span-3 text-xs font-black tracking-widest uppercase text-on-surface-variant/60">
              Địa bàn
            </div>
            <div className="col-span-3 text-xs font-black tracking-widest uppercase text-on-surface-variant/60">
              Cập nhật
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
              {filtered.map((it) => (
                <div
                  key={it.id}
                  className="grid grid-cols-12 gap-3 px-6 py-4 hover:bg-surface-container-low transition-colors"
                >
                  <div className="col-span-4 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-on-surface truncate">
                          {it.name || "—"}
                        </p>
                        <p className="text-xs text-on-surface-variant truncate font-semibold">
                          Mã: {it.code || it.id}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm font-bold text-on-surface">
                      {it.district || "—"}
                    </p>
                    <p className="text-xs text-on-surface-variant font-semibold">
                      {it.city || "—"}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm font-bold text-on-surface">
                      {it.updatedAt || "—"}
                    </p>
                    <p className="text-xs text-on-surface-variant font-semibold">
                      ID: {it.id}
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

        <div className="md:hidden">
          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center text-on-surface-variant font-semibold">
              {emptyText}
            </div>
          ) : (
            <div className="divide-y divide-surface-container-high">
              {filtered.map((it) => (
                <div key={it.id} className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-extrabold text-on-surface truncate">
                        {it.name || "—"}
                      </p>
                      <p className="text-xs text-on-surface-variant font-semibold truncate">
                        Mã: {it.code || it.id}
                      </p>
                    </div>
                    <StatusPill status={it.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-surface px-4 py-3 border border-surface-container-high">
                      <p className="text-[10px] font-black tracking-widest uppercase text-on-surface-variant/60">
                        Quận/Huyện
                      </p>
                      <p className="text-sm font-bold text-on-surface">
                        {it.district || "—"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-surface px-4 py-3 border border-surface-container-high">
                      <p className="text-[10px] font-black tracking-widest uppercase text-on-surface-variant/60">
                        TP/Tỉnh
                      </p>
                      <p className="text-sm font-bold text-on-surface">
                        {it.city || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-surface px-4 py-3 border border-surface-container-high">
                    <p className="text-[10px] font-black tracking-widest uppercase text-on-surface-variant/60">
                      Cập nhật
                    </p>
                    <p className="text-sm font-bold text-on-surface">
                      {it.updatedAt || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
