import React, { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { getCapacity } from "../../api/areaApi";
import Pagination from "./Pagination";

const PAGE_SIZE = 10;

function buildRows(areas) {
  const rows = [];
  for (const area of areas || []) {
    const district =
      typeof area?.district === "string" ? area.district.trim() : "";
    if (!district) continue;
    for (const w of area.wards || []) {
      const wardName = typeof w?.name === "string" ? w.name.trim() : "";
      if (!wardName) continue;
      rows.push({
        district,
        wardName,
        key: `${area.id ?? district}-${wardName}`,
      });
    }
  }
  return rows;
}

export default function AreaList({
  emptyText = "Chưa có dữ liệu khu vực.",
  query: queryProp,
  onQueryChange,
}) {
  const [internalQuery, setInternalQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const query = queryProp ?? internalQuery;
  const setQuery = onQueryChange ?? setInternalQuery;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { areas } = await getCapacity();
        const next = buildRows(areas);
        if (!cancelled) setRows(next);
      } catch (e) {
        if (!cancelled)
          setError(e?.message || "Không tải được danh sách khu vực.");
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
    if (!q) return rows;
    return rows.filter((r) => {
      const d = r.district.toLowerCase();
      const w = r.wardName.toLowerCase();
      return d.includes(q) || w.includes(q);
    });
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="w-full space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="rounded-3xl border border-surface-container-high bg-surface-container-lowest overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-on-surface-variant font-semibold">
            Đang tải…
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center text-rose-600 dark:text-rose-400 font-semibold">
            {error}
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <div className="grid grid-cols-12 gap-3 px-6 py-4 border-b border-surface-container-high bg-surface">
                <div className="col-span-1 text-xs font-black tracking-widest uppercase text-on-surface-variant/60">
                  STT
                </div>
                <div className="col-span-5 text-xs font-black tracking-widest uppercase text-on-surface-variant/60">
                  Quận/Huyện
                </div>
                <div className="col-span-6 text-xs font-black tracking-widest uppercase text-on-surface-variant/60">
                  Phường
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
                      key={it.key}
                      className="grid grid-cols-12 gap-3 px-6 py-4 hover:bg-surface-container-low transition-colors"
                    >
                      <div className="col-span-1 text-sm font-bold text-on-surface">
                        {(page - 1) * PAGE_SIZE + index + 1}
                      </div>
                      <div className="col-span-5 min-w-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <p className="font-extrabold text-on-surface truncate">
                            {it.district}
                          </p>
                        </div>
                      </div>
                      <div className="col-span-6 min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">
                          {it.wardName}
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
                  {pagedItems.map((it, index) => (
                    <div key={it.key} className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-black text-on-surface-variant/70 tabular-nums">
                          #{(page - 1) * PAGE_SIZE + index + 1}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="rounded-2xl bg-surface px-4 py-3 border border-surface-container-high">
                          <p className="text-[10px] font-black tracking-widest uppercase text-on-surface-variant/60">
                            Quận/Huyện
                          </p>
                          <p className="text-sm font-bold text-on-surface">
                            {it.district}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-surface px-4 py-3 border border-surface-container-high">
                          <p className="text-[10px] font-black tracking-widest uppercase text-on-surface-variant/60">
                            Phường
                          </p>
                          <p className="text-sm font-bold text-on-surface">
                            {it.wardName}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {!loading && !error && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="pt-2"
        />
      )}
    </div>
  );
}
