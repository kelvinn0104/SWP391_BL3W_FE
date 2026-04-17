import React, { useState } from "react";
import { Search, UserRound } from "lucide-react";
import AccountList from "../../components/ui/AccountList";

const CITIZENS = [
  {
    id: "CIT-0001",
    name: "Nguyễn Văn An",
    email: "an.nguyen@gmail.com",
    phone: "0901 234 567",
    status: "active",
    createdAt: "2026-04-12",
  },
  {
    id: "CIT-0002",
    name: "Trần Thị Bình",
    email: "binh.tran@gmail.com",
    phone: "0908 888 222",
    status: "active",
    createdAt: "2026-04-10",
  },
  {
    id: "CIT-0003",
    name: "Lê Minh Châu",
    email: "chau.le@gmail.com",
    phone: "0912 555 909",
    status: "blocked",
    createdAt: "2026-03-29",
  },
  {
    id: "CIT-0004",
    name: "Phạm Gia Huy",
    email: "huy.pham@gmail.com",
    phone: "0933 101 202",
    status: "active",
    createdAt: "2026-03-18",
  },
  {
    id: "CIT-0005",
    name: "Võ Thảo My",
    email: "my.vo@gmail.com",
    phone: "0977 234 111",
    status: "blocked",
    createdAt: "2026-03-02",
  },
];

export default function CitizenList() {
  const [query, setQuery] = useState("");

  return (
    <div className="w-full space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface">
            Danh sách dân cư
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl">
            Quản lý tài khoản người dùng (dân cư): tìm kiếm nhanh, lọc theo
            trạng thái và xem thông tin liên hệ.
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
        items={CITIZENS}
        emptyText="Không tìm thấy tài khoản dân cư phù hợp."
        query={query}
        onQueryChange={setQuery}
      />
    </div>
  );
}
