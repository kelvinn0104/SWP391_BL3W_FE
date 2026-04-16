import React, { useState } from "react";
import { Search, UserRound } from "lucide-react";
import AccountList from "../../components/ui/AccountList";

const COLLECTORS = [
  {
    id: "COL-0001",
    name: "Ngô Thành Đạt",
    email: "dat.ngo@collector.vn",
    phone: "0902 111 333",
    status: "active",
    createdAt: "2026-04-13",
  },
  {
    id: "COL-0002",
    name: "Đặng Thu Hà",
    email: "ha.dang@collector.vn",
    phone: "0938 222 444",
    status: "active",
    createdAt: "2026-04-09",
  },
  {
    id: "COL-0003",
    name: "Phan Quốc Bảo",
    email: "bao.phan@collector.vn",
    phone: "0919 555 222",
    status: "blocked",
    createdAt: "2026-03-25",
  },
  {
    id: "COL-0004",
    name: "Hồ Minh Khang",
    email: "khang.ho@collector.vn",
    phone: "0971 888 777",
    status: "active",
    createdAt: "2026-03-11",
  },
];

export default function CollectorList() {
  const [query, setQuery] = useState("");

  return (
    <div className="w-full space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <p className="inline-flex items-center gap-2 text-primary font-extrabold text-sm">
            <UserRound className="w-4 h-4 shrink-0" />
            Quản lý tài khoản
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface">
            Danh sách người thu gom
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl">
            Quản lý tài khoản người thu gom: tìm kiếm nhanh, lọc theo trạng thái và
            kiểm tra thông tin liên hệ.
          </p>
        </div>

        <div className="w-full md:w-[420px] rounded-2xl bg-white dark:bg-surface">
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

      <AccountList
        items={COLLECTORS}
        emptyText="Không tìm thấy tài khoản người thu gom phù hợp."
        query={query}
        onQueryChange={setQuery}
      />
    </div>
  );
}
