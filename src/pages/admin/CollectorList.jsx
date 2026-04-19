import React, { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import AccountList from "../../components/ui/AccountList";
import CreateCollectorModal from "../../components/modal/CreateCollectorModal";

export default function CollectorList() {
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [listKey, setListKey] = useState(0);

  return (
    <div className="w-full space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col px-2">
          <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tight">
            Danh sách người thu gom
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-bold mt-1 opacity-60 max-w-2xl">
            Quản lý tài khoản người thu gom: tìm kiếm nhanh, lọc theo trạng thái
            và kiểm tra thông tin liên hệ.
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 md:items-center">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-white px-5 py-3 text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Thêm người thu gom
          </button>
          <div className="w-full sm:w-[min(100%,420px)] md:w-105 rounded-2xl bg-white dark:bg-surface">
            <div className="relative">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên, email, SĐT…"
                className="w-full rounded-2xl border border-surface-container-high bg-white dark:bg-surface px-10 py-3 text-on-surface text-sm placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
              />
            </div>
          </div>
        </div>
      </div>

      <AccountList
        key={listKey}
        accountKind="collectors"
        emptyText="Không tìm thấy tài khoản người thu gom phù hợp."
        query={query}
        onQueryChange={setQuery}
      />

      <CreateCollectorModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setListKey((k) => k + 1)}
      />
    </div>
  );
}
