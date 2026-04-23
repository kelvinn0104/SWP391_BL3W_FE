import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, FileText, Leaf, MapPin, Package, Phone } from "lucide-react";
import Pagination from "../../components/ui/Pagination";
import { getCollectorAssignedReports } from "../../api/collectorJobApi";

const PAGE_SIZE = 5;

/**
 * Trạng thái backend (WasteReportStatus).
 */
export const COLLECTOR_ACTIVE_STATUSES = ["Assigned", "Accepted"];

export function collectorStatusLabel(status) {
  if (!status) return "-";
  const map = {
    Assigned: "Assigned",
    Accepted: "Accepted",
    Pending: "Pending",
    Collected: "Collected",
    Cancelled: "Cancelled",
  };
  return map[status] ?? status;
}

export function statusBadgeClass(status) {
  const key = status;
  switch (key) {
    case "Assigned":
      return "bg-violet-500/12 text-violet-800 ring-1 ring-violet-500/25";
    case "Accepted":
      return "bg-sky-500/12 text-sky-800 ring-1 ring-sky-500/25";
    case "Collected":
      return "bg-emerald-500/12 text-emerald-900 ring-1 ring-emerald-500/25";
    default:
      return "bg-surface-container-highest text-on-surface-variant";
  }
}

function formatWeightKg(weightKg) {
  if (weightKg == null || weightKg === "") return "-";
  const n = Number(weightKg);
  if (Number.isFinite(n)) {
    return `${Number.isInteger(n) ? n : n.toFixed(2)}kg`;
  }
  return String(weightKg);
}

function resolveCreatedDate(task) {
  if (task?.createdAt) return String(task.createdAt);
  if (task?.createdAtUtc) {
    const d = new Date(task.createdAtUtc);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return "";
}

function formatDateDdMmYyyy(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    const s = String(value);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    return s;
  }
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

function TaskCard({ task }) {
  const locationText = task.location ?? task.locationText ?? "";
  const phone = task.citizen?.phoneNumber?.trim();
  const created = resolveCreatedDate(task);

  return (
    <Link
      to={`/collector/tasks/${encodeURIComponent(String(task.id))}`}
      state={{ from: "tasks" }}
      className="block w-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      <article className="w-full bg-surface-container-lowest rounded-2xl border border-surface-container-highest botanical-shadow p-5 md:p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-wrap items-start justify-between gap-3 gap-y-2 mb-4">
          <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
            <h2 className="text-lg md:text-xl font-black text-on-surface leading-snug tracking-tight">
              {task.title || "-"}
            </h2>
            <span
              className={`inline-flex items-center shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-black tracking-wide ${statusBadgeClass(
                task.status,
              )}`}
            >
              {collectorStatusLabel(task.status)}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 text-primary px-3 py-1.5 text-xs font-extrabold shrink-0">
            <Package className="w-4 h-4" strokeWidth={2.25} />
            {formatWeightKg(task.weightKg)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-on-surface-variant">
          <p className="inline-flex items-center gap-2">
            <Leaf className="w-4 h-4 text-primary shrink-0" strokeWidth={2} />
            <span>{task.category || "-"}</span>
          </p>
          {phone ? (
            <p className="inline-flex items-center gap-2">
              <Phone
                className="w-4 h-4 text-primary shrink-0"
                strokeWidth={2}
              />
              <span className="tabular-nums">{phone}</span>
            </p>
          ) : null}
          <p
            className="inline-flex min-w-0 max-w-full items-center gap-2"
            title={task.description || undefined}
          >
            <FileText
              className="w-4 h-4 text-on-surface-variant shrink-0"
              strokeWidth={2}
            />
            <span className="min-w-0 truncate">{task.description || "-"}</span>
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-surface-container-highest text-sm font-medium">
          <span className="inline-flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-primary shrink-0" strokeWidth={2} />
            <span className="truncate">{locationText || "-"}</span>
          </span>
          {created ? (
            <span className="inline-flex items-center gap-2 text-on-surface-variant shrink-0">
              <Calendar className="w-4 h-4 shrink-0" strokeWidth={2} />
              Ngày tạo:{" "}
              <time
                dateTime={created}
                className="tabular-nums"
              >
                {formatDateDdMmYyyy(created)}
              </time>
            </span>
          ) : null}
        </div>
      </article>
    </Link>
  );
}

export default function Tasks() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    getCollectorAssignedReports()
      .then((list) => {
        if (!cancelled) setItems(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (!cancelled)
          setLoadError(err?.message || "Không tải được danh sách công việc.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const tasks = useMemo(
    () => items.filter((t) => COLLECTOR_ACTIVE_STATUSES.includes(t.status)),
    [items],
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
          Quản lý công việc
        </h1>
        <p className="text-sm md:text-base text-on-surface-variant font-bold mt-1 opacity-60">
          Các công việc đã phân công và đang trên đường thu gom
        </p>
      </header>

      {loadError ? (
        <div
          className="rounded-2xl border border-red-200 bg-red-50/90 px-6 py-6 text-center text-sm text-red-800"
          role="alert"
        >
          {loadError}
        </div>
      ) : loading ? (
        <div className="rounded-2xl border border-surface-container-highest bg-surface-container-low/40 px-6 py-14 text-center text-on-surface-variant font-medium">
          Đang tải danh sách...
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-container-highest bg-surface-container-low/50 px-6 py-14 text-center">
          <p className="text-on-surface-variant font-medium">
            Hiện không có công việc nào ở trạng thái "Đã phân công" hoặc "Đang
            trên đường".
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
