import React, { useState } from "react";
import { Search, UserRound } from "lucide-react";
import AccountList from "../../components/ui/AccountList";

const ENTERPRISES = [
  {
    id: "ENT-0101",
    name: "GreenCycle Co., Ltd.",
    email: "contact@greencycle.vn",
    phone: "028 7300 1234",
    status: "active",
    createdAt: "2026-04-08",
  },
  {
    id: "ENT-0102",
    name: "EcoMetal Recycling",
    email: "hello@ecometal.vn",
    phone: "028 7300 5678",
    status: "active",
    createdAt: "2026-03-30",
  },
  {
    id: "ENT-0103",
    name: "PlasticLoop Factory",
    email: "support@plasticloop.vn",
    phone: "028 7300 9012",
    status: "blocked",
    createdAt: "2026-03-16",
  },
  {
    id: "ENT-0104",
    name: "BioPaper Recovery",
    email: "team@biopaper.vn",
    phone: "028 7300 2468",
    status: "active",
    createdAt: "2026-02-28",
  },
];

export default function EnterpriseList() {
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
            Danh sách doanh nghiệp tái chế
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl">
            Quản lý tài khoản doanh nghiệp tái chế: tìm kiếm nhanh, lọc theo trạng
            thái và xem thông tin liên hệ.
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
        items={ENTERPRISES}
        emptyText="Không tìm thấy tài khoản doanh nghiệp tái chế phù hợp."
        query={query}
        onQueryChange={setQuery}
      />
    </div>
  );
}
