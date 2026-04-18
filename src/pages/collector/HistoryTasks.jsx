import React, { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Calendar, FileText, Leaf, MapPin, Package } from "lucide-react";
import Pagination from "../../components/ui/Pagination.jsx";

const PAGE_SIZE = 5;

const HISTORY_STATUS = "Đã thu gom";

/** Demo — thay bằng API khi backend sẵn sàng (export để TaskDetail dùng chung) */
export const MOCK_HISTORY_TASKS = [
  {
    id: "RP-2380",
    title: "Thu gom chai nhựa khu tập thể",
    status: "Đã thu gom",
    weightKg: 24.6,
    category: "Kim loại",
    description:
      "Đã cân và bàn giao tại kho trung chuyển Quận 10, biên nhận số BN-8821.",
    location: "Quận 10, TP.HCM",
    createdAt: "2026-03-28",
    coordinates: { lat: 10.7756, lng: 106.6662 },
    images: [
      "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=1200&q=80",
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&q=80",
    ],
  },
  {
    id: "RP-2385",
    title: "Giấy vụn siêu thị mini",
    status: "Đã thu gom",
    weightKg: 56.0,
    category: "Giấy",
    description: "Thu gom đúng khung giờ, đã xác nhận trên app.",
    location: "Gò Vấp, TP.HCM",
    createdAt: "2026-04-01",
    coordinates: { lat: 10.8398, lng: 106.6669 },
    images: [
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&q=80",
    ],
  },
  {
    id: "RP-2390",
    title: "Phế liệu kim loại công trình",
    status: "Đang trên đường",
    weightKg: 12.0,
    category: "Kim loại",
    description: "Không hiện ở lịch sử.",
    location: "Quận 12, TP.HCM",
    createdAt: "2026-04-06",
    coordinates: { lat: 10.8616, lng: 106.678 },
    images: [],
  },
  {
    id: "RP-2392",
    title: "Nhựa văn phòng",
    status: "Đã thu gom",
    weightKg: 9.4,
    category: "Nhựa",
    description: "Phân loại sơ bộ tại chỗ, đủ khối lượng theo báo cáo.",
    location: "Quận 1, TP.HCM",
    createdAt: "2026-04-04",
    coordinates: { lat: 10.7756, lng: 106.7021 },
    images: [
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80",
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200&q=80",
    ],
  },
];

function statusBadgeClass(status) {
  switch (status) {
    case "Đã thu gom":
      return "bg-emerald-500/12 text-emerald-900 ring-1 ring-emerald-500/25";
    default:
      return "bg-surface-container-highest text-on-surface-variant";
  }
}

function HistoryTaskCard({ task }) {
  return (
    <Link
      to={`/collector/tasks/${encodeURIComponent(task.id)}`}
      className="block w-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      <article className="w-full bg-surface-container-lowest rounded-2xl border border-surface-container-highest botanical-shadow p-5 md:p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-wrap items-start justify-between gap-3 gap-y-2 mb-4">
          <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
            <h2 className="text-lg md:text-xl font-extrabold text-on-surface leading-snug">
              {task.title}
            </h2>
            <span
              className={`inline-flex items-center shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${statusBadgeClass(
                task.status,
              )}`}
            >
              {task.status}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 text-primary px-3 py-1.5 text-sm font-bold shrink-0">
            <Package className="w-4 h-4" strokeWidth={2.25} />
            {typeof task.weightKg === "number"
              ? `${task.weightKg}kg`
              : task.weightKg}
          </span>
        </div>

        <div className="space-y-2.5 text-sm text-on-surface-variant">
          <p className="flex items-start gap-2 font-medium text-on-surface">
            <Leaf
              className="w-4 h-4 text-primary mt-0.5 shrink-0"
              strokeWidth={2}
            />
            <span>{task.category}</span>
          </p>
          <p className="pl-6 text-xs font-semibold tracking-wide text-on-surface-variant/90">
            Mã report:{" "}
            <span className="text-on-surface font-mono">{task.id}</span>
          </p>
          <p className="flex items-start gap-2">
            <FileText
              className="w-4 h-4 text-on-surface-variant mt-0.5 shrink-0"
              strokeWidth={2}
            />
            <span className="leading-relaxed">{task.description}</span>
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-surface-container-highest text-sm">
          <span className="inline-flex items-center gap-2 font-semibold text-on-surface">
            <MapPin className="w-4 h-4 text-primary shrink-0" strokeWidth={2} />
            {task.location}
          </span>
          <span className="inline-flex items-center gap-2 text-on-surface-variant font-medium">
            <Calendar className="w-4 h-4 shrink-0" strokeWidth={2} />
            Ngày tạo:{" "}
            <time
              dateTime={task.createdAt}
              className="text-on-surface tabular-nums"
            >
              {task.createdAt}
            </time>
          </span>
        </div>
      </article>
    </Link>
  );
}

export default function HistoryTasks() {
  const { user } = useOutletContext();
  const [page, setPage] = useState(1);

  const tasks = useMemo(
    () => MOCK_HISTORY_TASKS.filter((t) => t.status === HISTORY_STATUS),
    [],
  );

  const totalPages = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE));

  const pagedTasks = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return tasks.slice(start, start + PAGE_SIZE);
  }, [tasks, page]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [tasks.length, totalPages]);

  return (
    <div className="w-full min-w-0 max-w-none space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col mb-4 md:mb-6 px-2">
        <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tight">
          Lịch sử công việc
        </h1>
        <p className="text-sm md:text-base text-on-surface-variant font-bold mt-1 opacity-60">
          Các công việc đã hoàn tất thu gom
        </p>
      </header>

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-container-highest bg-surface-container-low/50 px-6 py-14 text-center">
          <p className="text-on-surface-variant font-medium">
            Chưa có công việc nào ở trạng thái &quot;Đã thu gom&quot;.
          </p>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-5 list-none p-0 m-0">
            {pagedTasks.map((task) => (
              <li key={task.id}>
                <HistoryTaskCard task={task} />
              </li>
            ))}
          </ul>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-10"
          />
        </>
      )}
    </div>
  );
}
