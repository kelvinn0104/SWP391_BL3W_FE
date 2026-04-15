import React, { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Calendar, FileText, Leaf, MapPin, Package } from "lucide-react";
import Pagination from "../../components/ui/Pagination.jsx";

const PAGE_SIZE = 5;

/** Chỉ hiển thị các công việc thuộc hai trạng thái này */
export const COLLECTOR_ACTIVE_STATUSES = ["Đã phân công", "Đang trên đường"];

/** Demo — thay bằng API khi backend sẵn sàng */
export const MOCK_TASKS = [
  {
    id: "RP-2401",
    title: "Nhựa và lon tại hẻm 12",
    status: "Đã phân công",
    weightKg: 3.2,
    category: "Kim loại",
    description:
      "Tập kết chai nhựa PET và lon nhôm tại sân sau, liên hệ chị Lan trước khi đến.",
    location: "Quận 3, TP.HCM",
    createdAt: "2026-04-10",
    coordinates: { lat: 10.7829, lng: 106.6882 },
    images: [
      "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=1200&q=80",
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&q=80",
      "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=1200&q=80",
    ],
  },
  {
    id: "RP-2402",
    title: "Giấy vụn văn phòng",
    status: "Đang trên đường",
    weightKg: 18.5,
    category: "Giấy",
    description:
      "Thu gom thùng carton và giấy A4 đã phân loại, có sẵn cân tại chỗ.",
    location: "Quận 1, TP.HCM",
    createdAt: "2026-04-11",
    coordinates: { lat: 10.7756, lng: 106.7021 },
    images: [
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&q=80",
      "https://images.unsplash.com/photo-1621451537084-482c73073a2f?w=1200&q=80",
    ],
  },
  {
    id: "RP-2398",
    title: "Chờ duyệt — không hiện",
    status: "Chờ duyệt",
    weightKg: 1.0,
    category: "Nhựa",
    description: "Bản ghi test filter.",
    location: "Quận 7, TP.HCM",
    createdAt: "2026-04-08",
    coordinates: { lat: 10.7314, lng: 106.7184 },
    images: [
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80",
    ],
  },
  {
    id: "RP-2405",
    title: "Kho phế liệu Thảo Điền",
    status: "Đã phân công",
    weightKg: 42.0,
    category: "Nhựa",
    description: "Xe tải nhỏ có thể vào hẻm; bảo vệ sẽ mở cổng từ 8h–11h.",
    location: "Thủ Đức, TP.HCM",
    createdAt: "2026-04-12",
    coordinates: { lat: 10.8027, lng: 106.7384 },
    images: [
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200&q=80",
      "https://images.unsplash.com/photo-1581092160562-40aa08c7880a?w=1200&q=80",
    ],
  },
  {
    id: "RP-2406",
    title: "Thu gom theo ca tối",
    status: "Đang trên đường",
    weightKg: 7.8,
    category: "Kim loại",
    description: "Ưu tiên sau 18h, gọi số trên cổng khi tới nơi.",
    location: "Bình Thạnh, TP.HCM",
    createdAt: "2026-04-12",
    coordinates: { lat: 10.8106, lng: 106.7092 },
    images: [
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200&q=80",
      "https://images.unsplash.com/photo-1528323273322-d81489248c40?w=1200&q=80",
    ],
  },
];

export function statusBadgeClass(status) {
  switch (status) {
    case "Đã phân công":
      return "bg-violet-500/12 text-violet-800 ring-1 ring-violet-500/25";
    case "Đang trên đường":
      return "bg-sky-500/12 text-sky-800 ring-1 ring-sky-500/25";
    case "Đã thu gom":
      return "bg-emerald-500/12 text-emerald-900 ring-1 ring-emerald-500/25";
    default:
      return "bg-surface-container-highest text-on-surface-variant";
  }
}

function TaskCard({ task }) {
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

export default function Tasks() {
  const { user } = useOutletContext();
  const [page, setPage] = useState(1);

  const tasks = useMemo(
    () =>
      MOCK_TASKS.filter((t) => COLLECTOR_ACTIVE_STATUSES.includes(t.status)),
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
      <header>
        <h1 className="text-2xl md:text-3xl font-serif italic text-on-surface mb-2">
          Quản lý{" "}
          <span className="not-italic font-black text-primary">công việc</span>
        </h1>
        <p className="text-on-surface-variant font-medium">
          Các công việc đã phân công và đang trên đường thu gom
        </p>
      </header>

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-container-highest bg-surface-container-low/50 px-6 py-14 text-center">
          <p className="text-on-surface-variant font-medium">
            Hiện không có công việc nào ở trạng thái &quot;Đã phân công&quot;
            hoặc &quot;Đang trên đường&quot;.
          </p>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-5 list-none p-0 m-0">
            {pagedTasks.map((task) => (
              <li key={task.id}>
                <TaskCard task={task} />
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
