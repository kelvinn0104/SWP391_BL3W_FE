import React, { useState } from "react";
import { Search } from "lucide-react";
import WasteCategoryList from "../../components/ui/WasteCategoryList";

export default function WasteCategory() {
  const [query, setQuery] = useState("");

  return (
    <div className="w-full space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col px-2">
          <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tight">
            Danh sách loại rác
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-bold mt-1 opacity-60 max-w-2xl">
            Quản lý danh mục loại rác: tìm kiếm theo mã, tên, đơn vị hoặc mô tả.
          </p>
        </div>

        <div className="w-full md:w-[420px] rounded-2xl bg-white dark:bg-surface">
          <div className="relative">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên, mã, đơn vị, mô tả…"
              className="w-full rounded-2xl border border-surface-container-high bg-white dark:bg-surface px-10 py-3 text-on-surface text-sm placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            />
          </div>
        </div>
      </div>

      <WasteCategoryList
        emptyText="Không tìm thấy loại rác phù hợp."
        query={query}
        onQueryChange={setQuery}
      />
    </div>
  );
}
