import React, { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Chart, registerables } from "chart.js";
import { MessageSquare, Shield, Ticket, Users } from "lucide-react";
import { getCitizens, getCollectors } from "../../api/userApi";
import { getAllComplaints } from "../../api/complaintApi";
import { getVouchers } from "../../api/voucherApi";

Chart.register(...registerables);

/** Gom số lượng voucher theo category (tên hiển thị từ API) */
function aggregateVouchersByCategory(vouchers) {
  const map = new Map();
  for (const v of Array.isArray(vouchers) ? vouchers : []) {
    const raw = v.category ?? v.Category;
    const cat = String(raw ?? "").trim() || "Khác";
    map.set(cat, (map.get(cat) ?? 0) + 1);
  }
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
  return {
    labels: entries.map((e) => e[0]),
    values: entries.map((e) => e[1]),
  };
}

const VOUCHER_PIE_COLORS = [
  "rgb(0, 108, 73)",
  "rgb(16, 185, 129)",
  "rgb(59, 130, 246)",
  "rgb(249, 115, 22)",
  "rgb(168, 85, 247)",
  "rgb(236, 72, 153)",
];

function voucherPieBackgrounds(count) {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    out.push(VOUCHER_PIE_COLORS[i % VOUCHER_PIE_COLORS.length]);
  }
  return out;
}

/** Đếm tài khoản hoạt động / bị khóa từ danh sách API citizens + collectors */
function countAccountsByLockState(list) {
  let active = 0;
  let locked = 0;
  if (!Array.isArray(list)) return { active, locked };
  for (const p of list) {
    const isLocked = p.isLocked ?? p.IsLocked ?? false;
    if (isLocked) locked += 1;
    else active += 1;
  }
  return { active, locked };
}

export default function AdminDashboard() {
  const { user } = useOutletContext();
  const voucherDoughnutCanvasRef = useRef(null);
  const doughnutCanvasRef = useRef(null);
  const [stats, setStats] = useState({
    activeAccounts: null,
    lockedAccounts: null,
    submittedFeedback: null,
    voucherCount: null,
    /** Tài khoản đang hoạt động theo vai trò (cho biểu đồ doughnut) */
    citizenActive: null,
    collectorActive: null,
    /** Voucher theo category (labels + counts) */
    voucherCategoryLabels: null,
    voucherCategoryCounts: null,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatsLoading(true);
      try {
        const [citizens, collectors, complaints, vouchers] = await Promise.all([
          getCitizens(),
          getCollectors(),
          getAllComplaints("Submitted"),
          getVouchers(),
        ]);
        if (cancelled) return;
        const cCit = countAccountsByLockState(citizens);
        const cCol = countAccountsByLockState(collectors);
        const voucherList = Array.isArray(vouchers) ? vouchers : [];
        const voucherPie = aggregateVouchersByCategory(voucherList);
        setStats({
          activeAccounts: cCit.active + cCol.active,
          lockedAccounts: cCit.locked + cCol.locked,
          submittedFeedback: Array.isArray(complaints) ? complaints.length : 0,
          voucherCount: voucherList.length,
          citizenActive: cCit.active,
          collectorActive: cCol.active,
          voucherCategoryLabels: voucherPie.labels,
          voucherCategoryCounts: voucherPie.values,
        });
      } catch {
        if (!cancelled) {
          setStats({
            activeAccounts: 0,
            lockedAccounts: 0,
            submittedFeedback: 0,
            voucherCount: 0,
            citizenActive: 0,
            collectorActive: 0,
            voucherCategoryLabels: [],
            voucherCategoryCounts: [],
          });
        }
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const voucherPieLabels = useMemo(
    () =>
      Array.isArray(stats.voucherCategoryLabels)
        ? stats.voucherCategoryLabels
        : [],
    [stats.voucherCategoryLabels],
  );

  const voucherPieValues = useMemo(
    () =>
      Array.isArray(stats.voucherCategoryCounts)
        ? stats.voucherCategoryCounts
        : [],
    [stats.voucherCategoryCounts],
  );

  useEffect(() => {
    const canvas = voucherDoughnutCanvasRef.current;
    if (!canvas) return;

    Chart.getChart(canvas)?.destroy();

    if (!voucherPieLabels.length || !voucherPieValues.length) return;

    const chart = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: voucherPieLabels,
        datasets: [
          {
            data: voucherPieValues,
            backgroundColor: voucherPieBackgrounds(voucherPieLabels.length),
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
  }, [voucherPieLabels, voucherPieValues]);

  const rolePieLabels = useMemo(() => ["Cư dân", "Nhân viên thu gom"], []);

  const rolePieValues = useMemo(() => {
    const c = stats.citizenActive ?? 0;
    const col = stats.collectorActive ?? 0;
    return [c, col];
  }, [stats.citizenActive, stats.collectorActive]);

  useEffect(() => {
    const canvas = doughnutCanvasRef.current;
    if (!canvas) return;

    Chart.getChart(canvas)?.destroy();

    const chart = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: rolePieLabels,
        datasets: [
          {
            data: rolePieValues,
            backgroundColor: ["rgb(16, 185, 129)", "rgb(249, 115, 22)"],
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
  }, [rolePieLabels, rolePieValues]);

  const formatStat = (n) =>
    statsLoading || n == null ? "…" : Number(n).toLocaleString("vi-VN");

  const cards = [
    {
      title: "Tài khoản hoạt động",
      value: formatStat(stats.activeAccounts),
      icon: Users,
      iconClass: "bg-emerald-500/15 text-emerald-800",
    },
    {
      title: "Tài khoản bị khóa",
      value: formatStat(stats.lockedAccounts),
      icon: Shield,
      iconClass: "bg-amber-500/15 text-amber-800",
    },
    {
      title: "Feedback cần xử lý",
      value: formatStat(stats.submittedFeedback),
      icon: MessageSquare,
      iconClass: "bg-sky-500/15 text-sky-800",
    },
    {
      title: "Tổng voucher",
      value: formatStat(stats.voucherCount),
      icon: Ticket,
      iconClass: "bg-violet-500/15 text-violet-800",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col mb-4 md:mb-6 px-2">
        <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tight">
          Chào ngày mới, {user?.displayName || "Admin"}
        </h1>
        <p className="text-sm md:text-base text-on-surface-variant font-bold mt-1 opacity-60">
          Bảng điều khiển quản trị tối cao của EcoSort.
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
          <div className="flex items-start gap-2 mb-2">
            <Ticket className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-bold text-on-surface font-sans tracking-tight">
                Voucher theo phân loại
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Tổng số voucher được nhóm theo từng phân loại trong hệ thống.
              </p>
            </div>
          </div>
          <div className="h-64 md:h-72 relative w-full max-w-md mx-auto mt-6">
            {statsLoading ? (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-on-surface-variant">
                Đang tải…
              </div>
            ) : voucherPieLabels.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-on-surface-variant">
                Chưa có voucher.
              </div>
            ) : (
              <canvas ref={voucherDoughnutCanvasRef} />
            )}
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest botanical-shadow p-6 md:p-8">
          <div className="flex items-start gap-2 mb-2">
            <Shield className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-bold text-on-surface font-sans tracking-tight">
                Người dùng theo vai trò
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Cơ cấu tài khoản đang hoạt động trong hệ thống EcoSort.
              </p>
            </div>
          </div>
          <div className="h-64 md:h-72 relative w-full max-w-md mx-auto mt-6">
            <canvas ref={doughnutCanvasRef} />
          </div>
        </section>
      </div>
    </div>
  );
}
