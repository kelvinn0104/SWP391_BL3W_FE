import React, { useEffect, useMemo, useState } from "react";
import { Layers, Loader2 } from "lucide-react";
import { getWasteReportCategories } from "../../api/WasteReportapi";

export default function WasteCategoryList({
  emptyText = "Chưa có loại rác nào.",
  query: queryProp,
  onQueryChange,
}) {
  const [internalQuery, setInternalQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const query = queryProp ?? internalQuery;
  const setQuery = onQueryChange ?? setInternalQuery;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getWasteReportCategories();
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "Không tải được danh sách loại rác.");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const hay =
        `${it.name ?? ""} ${it.code ?? ""} ${it.unit ?? ""} ${it.description ?? ""}`
          .toLowerCase()
          .trim();
      return hay.includes(q);
    });
  }, [items, query]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-surface-container-high bg-surface-container-lowest py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-semibold">Đang tải danh sách loại rác…</p>
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
      <div className="rounded-3xl border border-surface-container-high bg-surface-container-lowest overflow-hidden">
        <div className="hidden md:block">
          <div className="grid grid-cols-12 gap-3 px-6 py-4 border-b border-surface-container-high bg-surface">
            <div className="col-span-1 text-xs font-black tracking-widest uppercase text-on-surface-variant/60 text-center">
              STT
            </div>
            <div className="col-span-2 text-xs font-black tracking-widest uppercase text-on-surface-variant/60">
              Mã
            </div>
            <div className="col-span-3 text-xs font-black tracking-widest uppercase text-on-surface-variant/60">
              Tên
            </div>
            <div className="col-span-2 text-xs font-black tracking-widest uppercase text-on-surface-variant/60">
              Đơn vị
            </div>
            <div className="col-span-4 text-xs font-black tracking-widest uppercase text-on-surface-variant/60">
              Mô tả
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-on-surface-variant font-semibold">
              {emptyText}
            </div>
          ) : (
            <div className="divide-y divide-surface-container-high">
              {filtered.map((it, index) => (
                <div
                  key={
                    it.id != null ? String(it.id) : `row-${it.code ?? index}`
                  }
                  className="grid grid-cols-12 gap-3 px-6 py-4 hover:bg-surface-container-low transition-colors"
                >
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-sm font-extrabold text-on-surface tabular-nums">
                      {index + 1}
                    </span>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <p className="text-sm font-bold text-on-surface font-mono truncate">
                      {it.code || "—"}
                    </p>
                  </div>
                  <div className="col-span-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <p className="font-extrabold text-on-surface truncate">
                        {it.name || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-bold text-on-surface">
                      {it.unit || "—"}
                    </p>
                  </div>
                  <div className="col-span-4 min-w-0">
                    <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                      {it.description || "—"}
                    </p>
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
              {filtered.map((it, index) => (
                <div
                  key={
                    it.id != null ? String(it.id) : `row-${it.code ?? index}`
                  }
                  className="p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-extrabold text-on-surface-variant tabular-nums shrink-0">
                      #{index + 1}
                    </span>
                    <div className="min-w-0 flex-1 text-right">
                      <p className="font-extrabold text-on-surface truncate">
                        {it.name || "—"}
                      </p>
                      <p className="text-xs font-mono font-semibold text-on-surface-variant truncate">
                        {it.code || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-surface px-4 py-3 border border-surface-container-high">
                    <p className="text-[10px] font-black tracking-widest uppercase text-on-surface-variant/60 mb-1">
                      Đơn vị
                    </p>
                    <p className="text-sm font-bold text-on-surface">
                      {it.unit || "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-surface px-4 py-3 border border-surface-container-high">
                    <p className="text-[10px] font-black tracking-widest uppercase text-on-surface-variant/60 mb-1">
                      Mô tả
                    </p>
                    <p className="text-sm font-semibold text-on-surface leading-relaxed">
                      {it.description || "—"}
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
