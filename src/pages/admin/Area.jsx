import React, { useState } from "react";
import { MapPin, Search } from "lucide-react";
import AreaList from "../../components/ui/AreaList";

const AREAS = [
  {
    id: "AR-001",
    code: "Q1-HCM",
    name: "Quận 1",
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
    status: "active",
    updatedAt: "2026-04-16",
  },
  {
    id: "AR-002",
    code: "Q3-HCM",
    name: "Quận 3",
    district: "Quận 3",
    city: "TP. Hồ Chí Minh",
    status: "active",
    updatedAt: "2026-04-14",
  },
  {
    id: "AR-003",
    code: "TB-HCM",
    name: "Quận Tân Bình",
    district: "Tân Bình",
    city: "TP. Hồ Chí Minh",
    status: "inactive",
    updatedAt: "2026-04-02",
  },
  {
    id: "AR-004",
    code: "HN-HBT",
    name: "Hoàn Kiếm",
    district: "Hoàn Kiếm",
    city: "Hà Nội",
    status: "active",
    updatedAt: "2026-03-28",
  },
  {
    id: "AR-005",
    code: "DN-HC",
    name: "Hải Châu",
    district: "Hải Châu",
    city: "Đà Nẵng",
    status: "inactive",
    updatedAt: "2026-03-10",
  },
];

export default function Area() {
  const [query, setQuery] = useState("");

  return (
    <div className="w-full space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <p className="inline-flex items-center gap-2 text-primary font-extrabold text-sm">
            <MapPin className="w-4 h-4 shrink-0" />
            Quản lí hệ thống
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface">
            Danh sách khu vực
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl">
            Quản lý khu vực thu gom: tìm kiếm nhanh, lọc theo trạng thái và xem
            thông tin địa bàn.
          </p>
        </div>

        <div className="w-full md:w-[420px] rounded-2xl bg-white dark:bg-surface">
          <div className="relative">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên, mã, quận/huyện, TP…"
              className="w-full rounded-2xl border border-surface-container-high bg-white dark:bg-surface px-10 py-3 text-on-surface text-sm placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            />
          </div>
        </div>
      </div>

      <AreaList
        items={AREAS}
        emptyText="Không tìm thấy khu vực phù hợp."
        query={query}
        onQueryChange={setQuery}
      />
    </div>
  );
}
