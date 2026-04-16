import React, { useState } from "react";
import { Layers, Search } from "lucide-react";
import WasteCategoryList from "../../components/ui/WasteCategoryList";

const WASTE_CATEGORIES = [
  {
    id: "WC-001",
    code: "PLASTIC",
    name: "Nhựa",
    unit: "kg",
    note: "Chai, hộp nhựa, túi nilon (đã làm sạch).",
    status: "active",
    updatedAt: "2026-04-16",
  },
  {
    id: "WC-002",
    code: "METAL",
    name: "Kim loại",
    unit: "kg",
    note: "Lon, vỏ hộp, phế liệu kim loại không gỉ.",
    status: "active",
    updatedAt: "2026-04-12",
  },
  {
    id: "WC-003",
    code: "PAPER",
    name: "Giấy",
    unit: "kg",
    note: "Bìa carton, giấy báo, giấy văn phòng.",
    status: "inactive",
    updatedAt: "2026-03-30",
  },
  {
    id: "WC-004",
    code: "GLASS",
    name: "Thủy tinh",
    unit: "kg",
    note: "Chai lọ thủy tinh (không vỡ sắc nhọn).",
    status: "active",
    updatedAt: "2026-03-22",
  },
  {
    id: "WC-005",
    code: "EWASTE",
    name: "Rác điện tử",
    unit: "cái",
    note: "Pin, sạc, thiết bị nhỏ (cần quy trình riêng).",
    status: "inactive",
    updatedAt: "2026-02-18",
  },
];

export default function WasteCategory() {
  const [query, setQuery] = useState("");

  return (
    <div className="w-full space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <p className="inline-flex items-center gap-2 text-primary font-extrabold text-sm">
            <Layers className="w-4 h-4 shrink-0" />
            Quản lí hệ thống
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface">
            Danh sách loại rác
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl">
            Quản lý danh mục loại rác: tìm kiếm nhanh, lọc theo trạng thái và xem
            đơn vị/mô tả hiển thị cho người dùng.
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
        items={WASTE_CATEGORIES}
        emptyText="Không tìm thấy loại rác phù hợp."
        query={query}
        onQueryChange={setQuery}
      />
    </div>
  );
}
