import React, { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Chart, registerables } from "chart.js";
import { ClipboardList, Truck, MapPin, Tags } from "lucide-react";
import { getCollectorAssignedReports } from "../../api/collectorJobApi";

Chart.register(...registerables);

function normalizeReportStatus(status) {
  if (status == null) return "";
  return String(status).trim().toLowerCase();
}

/** Tổng hợp từ GET /api/collector/jobs/collector-report-assigned */
function aggregateAssignedReports(reports) {
  const list = Array.isArray(reports) ? reports : [];
  let assignedCount = 0;
  let collectedCount = 0;
  let totalKg = 0;
  for (const r of list) {
    const st = normalizeReportStatus(r.status ?? r.Status);
    if (st === "assigned") assignedCount += 1;
    if (st === "collected") collectedCount += 1;
    const kgRaw = r.actualTotalWeightKg ?? r.ActualTotalWeightKg;
    const kg = Number(kgRaw);
    if (!Number.isNaN(kg)) totalKg += kg;
  }
  const totalJobs = list.length;
  const completionRatePercent =
    totalJobs > 0 ? (collectedCount / totalJobs) * 100 : 0;
  return {
    assignedCount,
    collectedCount,
    totalKg,
    totalJobs,
    completionRatePercent,
  };
}

/** Gom số công việc theo category (mọi trạng thái) */
function aggregateReportsByCategory(reports) {
  const map = new Map();
  for (const r of Array.isArray(reports) ? reports : []) {
    const raw = r.category ?? r.Category;
    const cat = String(raw ?? "").trim() || "Khác";
    map.set(cat, (map.get(cat) ?? 0) + 1);
  }
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
  return {
    labels: entries.map((e) => e[0]),
    values: entries.map((e) => e[1]),
  };
}

/**
 * Ví dụ: "11 Đoàn Kết, Phường Bình Thọ, Thành phố Thủ Đức" → phường là phần sau dấu phẩy đầu tiên.
 */
function extractWardFromReport(report) {
  const raw =
    report?.locationText ??
    report?.LocationText ??
    report?.location ??
    report?.Location ??
    "";
  const s = String(raw).trim();
  if (!s) return null;
  const parts = s
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) return parts[1];
  const found = parts.find((p) =>
    /^(Phường|phường|Xã|xã|Thị trấn|thị trấn)\b/.test(p),
  );
  return found ?? parts[0] ?? null;
}

/** Đếm mọi status — mỗi báo cáo = một lượt, gom theo tên phường */
function aggregateReportsByWard(reports) {
  const map = new Map();
  for (const r of Array.isArray(reports) ? reports : []) {
    const ward = extractWardFromReport(r);
    const key = ward || "Không xác định";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
  return {
    labels: entries.map((e) => e[0]),
    values: entries.map((e) => e[1]),
  };
}

const WARD_PIE_COLORS = [
  "rgb(16, 185, 129)",
  "rgb(59, 130, 246)",
  "rgb(249, 115, 22)",
  "rgb(168, 85, 247)",
  "rgb(236, 72, 153)",
  "rgb(14, 165, 233)",
];

function wardPieBackgrounds(count) {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    out.push(WARD_PIE_COLORS[i % WARD_PIE_COLORS.length]);
  }
  return out;
}

/** Bảng màu riêng cho biểu đồ “theo loại rác” — tông tím/amber, tránh trùng chart phường */
const CATEGORY_PIE_COLORS = [
  "rgb(124, 58, 237)",
  "rgb(245, 158, 11)",
  "rgb(219, 39, 119)",
  "rgb(20, 184, 166)",
  "rgb(234, 88, 12)",
  "rgb(99, 102, 241)",
];

function categoryPieBackgrounds(count) {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    out.push(CATEGORY_PIE_COLORS[i % CATEGORY_PIE_COLORS.length]);
  }
  return out;
}

const EMPTY_WARD_PIE = { labels: [], values: [] };
const EMPTY_CATEGORY_PIE = { labels: [], values: [] };

export default function CollectorDashboard() {
  const { user } = useOutletContext();
  const categoryDoughnutCanvasRef = useRef(null);
  const doughnutCanvasRef = useRef(null);
  const [jobStats, setJobStats] = useState({
    assignedCount: null,
    collectedCount: null,
    totalKg: null,
    totalJobs: null,
    completionRatePercent: null,
  });
  const [jobStatsLoading, setJobStatsLoading] = useState(true);
  /** null = chưa tải; sau tải là mảng (có thể rỗng) */
  const [collectorReports, setCollectorReports] = useState(null);

  const categoryPie = useMemo(() => {
    if (collectorReports == null) return EMPTY_CATEGORY_PIE;
    return aggregateReportsByCategory(collectorReports);
  }, [collectorReports]);

  const categoryPieSum = useMemo(() => {
    if (collectorReports == null) return null;
    return categoryPie.values.reduce((a, b) => a + b, 0);
  }, [collectorReports, categoryPie.values]);

  const wardPie = useMemo(() => {
    if (collectorReports == null) return EMPTY_WARD_PIE;
    return aggregateReportsByWard(collectorReports);
  }, [collectorReports]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setJobStatsLoading(true);
      setCollectorReports(null);
      try {
        const reports = await getCollectorAssignedReports();
        if (cancelled) return;
        const list = Array.isArray(reports) ? reports : [];
        setCollectorReports(list);
        const agg = aggregateAssignedReports(list);
        setJobStats({
          assignedCount: agg.assignedCount,
          collectedCount: agg.collectedCount,
          totalKg: agg.totalKg,
          totalJobs: agg.totalJobs,
          completionRatePercent: agg.completionRatePercent,
        });
      } catch {
        if (!cancelled) {
          setCollectorReports([]);
          setJobStats({
            assignedCount: 0,
            collectedCount: 0,
            totalKg: 0,
            totalJobs: 0,
            completionRatePercent: 0,
          });
        }
      } finally {
        if (!cancelled) setJobStatsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const canvas = categoryDoughnutCanvasRef.current;
    if (!canvas) return;

    Chart.getChart(canvas)?.destroy();

    const { labels, values } = categoryPie;
    if (!labels.length || !values.length) return;

    const chart = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            label: "Số công việc",
            data: values,
            backgroundColor: categoryPieBackgrounds(labels.length),
            borderWidth: 0,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "58%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 14,
              font: { family: "Manrope, system-ui, sans-serif", size: 12 },
              color: "#43493e",
            },
          },
          tooltip: {
            backgroundColor: "rgba(26, 28, 24, 0.92)",
            padding: 12,
          },
        },
      },
    });

    return () => {
      chart.destroy();
    };
  }, [categoryPie]);

  useEffect(() => {
    const canvas = doughnutCanvasRef.current;
    if (!canvas) return;

    Chart.getChart(canvas)?.destroy();

    const { labels, values } = wardPie;
    if (!labels.length || !values.length) return;

    const chart = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: wardPieBackgrounds(labels.length),
            borderWidth: 0,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "58%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 14,
              font: { family: "Manrope, system-ui, sans-serif", size: 12 },
              color: "#43493e",
            },
          },
          tooltip: {
            backgroundColor: "rgba(26, 28, 24, 0.92)",
            padding: 12,
          },
        },
      },
    });

    return () => {
      chart.destroy();
    };
  }, [wardPie]);

  const cards = useMemo(() => {
    const loading = jobStatsLoading;
    const fmtInt = (n) =>
      loading || n == null ? "…" : Number(n).toLocaleString("vi-VN");
    const fmtPercent = () => {
      if (loading || jobStats.completionRatePercent == null) return "…";
      const p = jobStats.completionRatePercent;
      const s = new Intl.NumberFormat("vi-VN", {
        maximumFractionDigits: 1,
      }).format(p);
      return `${s}%`;
    };
    const fmtKg = () => {
      if (loading || jobStats.totalKg == null) return "…";
      const s = new Intl.NumberFormat("vi-VN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(jobStats.totalKg);
      return `${s} kg`;
    };
    return [
      {
        title: "Công việc đã nhận",
        value: fmtInt(jobStats.assignedCount),
        icon: ClipboardList,
        iconClass: "bg-blue-500/15 text-blue-600",
      },
      {
        title: "Công việc đã hoàn thành",
        value: fmtInt(jobStats.collectedCount),
        icon: Truck,
        iconClass: "bg-orange-500/15 text-orange-600",
      },
      {
        title: "Tỷ lệ hoàn thành",
        value: fmtPercent(),
        icon: MapPin,
        iconClass: "bg-emerald-500/15 text-emerald-700",
      },
      {
        title: "Khối lượng đã thu gom",
        value: fmtKg(),
        icon: Tags,
        iconClass: "bg-slate-500/15 text-slate-700",
      },
    ];
  }, [jobStats, jobStatsLoading]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col mb-4 md:mb-6 px-2">
        <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tight">
          Xin chào, {user?.displayName || "Nhân viên"}
        </h1>
        <p className="text-sm md:text-base text-on-surface-variant font-bold mt-1 opacity-60">
          Bắt đầu ngày làm việc của bạn ngay hôm nay.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cards.map((c) => (
          <article
            key={c.title}
            className="bg-surface-container-lowest rounded-2xl p-5 md:p-6 border border-surface-container-highest botanical-shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 className="font-sans text-sm font-semibold text-on-surface-variant leading-snug tracking-tight max-w-[70%]">
                {c.title}
              </h2>
              <div
                className={`shrink-0 flex items-center justify-center size-11 rounded-xl ${c.iconClass}`}
              >
                <c.icon className="w-5 h-5" strokeWidth={2.25} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-on-surface tabular-nums tracking-tight">
              {c.value}
            </p>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        <section className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest botanical-shadow p-6 md:p-8">
          <h2 className="text-xl font-bold text-on-surface font-sans tracking-tight mb-2">
            Công việc theo loại rác
          </h2>
          <p className="text-sm text-on-surface-variant mb-6">
            Tổng số công việc được giao theo từng loại rác
          </p>
          <div className="h-64 md:h-72 relative w-full max-w-md mx-auto">
            {jobStatsLoading || collectorReports == null ? (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-on-surface-variant">
                Đang tải…
              </div>
            ) : categoryPieSum === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-sm font-semibold text-on-surface-variant px-4">
                Chưa có công việc.
              </div>
            ) : (
              <canvas ref={categoryDoughnutCanvasRef} />
            )}
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest botanical-shadow p-6 md:p-8">
          <h2 className="text-xl font-bold text-on-surface font-sans tracking-tight mb-2">
            Công việc theo khu vực
          </h2>
          <p className="text-sm text-on-surface-variant mb-6">
            Tổng số lượt thu gom theo phường
          </p>
          <div className="h-64 md:h-72 relative w-full max-w-md mx-auto">
            {jobStatsLoading ? (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-on-surface-variant">
                Đang tải…
              </div>
            ) : wardPie.labels.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-sm font-semibold text-on-surface-variant px-4">
                Chưa có công việc hoặc không tách được phường từ địa chỉ.
              </div>
            ) : (
              <canvas ref={doughnutCanvasRef} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
