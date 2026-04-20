import React, { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Chart, registerables } from "chart.js";
import {
  ClipboardList,
  MessageSquare,
  Shield,
  Ticket,
  Users,
} from "lucide-react";

Chart.register(...registerables);

const MONTHS = [
  "Th1",
  "Th2",
  "Th3",
  "Th4",
  "Th5",
  "Th6",
  "Th7",
  "Th8",
  "Th9",
  "Th10",
  "Th11",
  "Th12",
];

/** Demo — thay bằng API khi backend admin sẵn sàng */
const ADMIN_STATS = {
  activeAccounts: 1240,
  pendingReports: 14,
  openFeedback: 7,
  activeVouchers: 32,
};

const ROLE_PIE_LABELS = [
  "Cư dân",
  "Doanh nghiệp",
  "Nhân viên thu gom",
  "Quản trị",
];

const ROLE_PIE_VALUES = [620, 180, 95, 12];

const MONTHLY_BY_YEAR = {
  2026: [0, 0, 420, 455, 480, 502, 0, 0, 0, 0, 0, 0],
  2025: [380, 402, 410, 425, 440, 438, 450, 448, 460, 472, 465, 478],
  2024: [310, 320, 335, 340, 355, 360, 358, 365, 370, 382, 390, 395],
};

function getMonthlySystemWide(year) {
  return MONTHLY_BY_YEAR[year] ?? MONTHLY_BY_YEAR[2026];
}

export default function AdminDashboard() {
  const { user } = useOutletContext();
  const [year, setYear] = useState(2026);
  const barCanvasRef = useRef(null);
  const doughnutCanvasRef = useRef(null);

  const monthlyData = useMemo(() => getMonthlySystemWide(year), [year]);

  useEffect(() => {
    const canvas = barCanvasRef.current;
    if (!canvas) return;

    Chart.getChart(canvas)?.destroy();

    const chart = new Chart(canvas, {
      type: "bar",
      data: {
        labels: MONTHS,
        datasets: [
          {
            label: "Lượt hoàn thành (hệ thống)",
            data: monthlyData,
            backgroundColor: "rgba(0, 108, 73, 0.78)",
            borderColor: "rgba(0, 108, 73, 1)",
            borderWidth: 0,
            borderRadius: 6,
            maxBarThickness: 36,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 16,
              font: { family: "Manrope, system-ui, sans-serif", size: 12 },
              color: "#43493e",
            },
          },
          tooltip: {
            backgroundColor: "rgba(26, 28, 24, 0.92)",
            padding: 12,
            titleFont: { family: "Manrope, system-ui, sans-serif" },
            bodyFont: { family: "Manrope, system-ui, sans-serif" },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: "#43493e",
              font: { size: 11 },
            },
          },
          y: {
            beginAtZero: true,
            suggestedMax: 600,
            grid: { color: "rgba(226, 226, 216, 0.8)" },
            ticks: {
              color: "#43493e",
              font: { size: 11 },
            },
          },
        },
      },
    });

    return () => {
      chart.destroy();
    };
  }, [monthlyData]);

  useEffect(() => {
    const canvas = doughnutCanvasRef.current;
    if (!canvas) return;

    Chart.getChart(canvas)?.destroy();

    const chart = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: ROLE_PIE_LABELS,
        datasets: [
          {
            data: ROLE_PIE_VALUES,
            backgroundColor: [
              "rgb(16, 185, 129)",
              "rgb(59, 130, 246)",
              "rgb(249, 115, 22)",
              "rgb(168, 85, 247)",
            ],
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
  }, []);

  const cards = [
    {
      title: "Tài khoản hoạt động",
      value: ADMIN_STATS.activeAccounts.toLocaleString("vi-VN"),
      icon: Users,
      iconClass: "bg-emerald-500/15 text-emerald-800",
    },
    {
      title: "Báo cáo chờ duyệt",
      value: ADMIN_STATS.pendingReports,
      icon: ClipboardList,
      iconClass: "bg-amber-500/15 text-amber-800",
    },
    {
      title: "Feedback cần xử lý",
      value: ADMIN_STATS.openFeedback,
      icon: MessageSquare,
      iconClass: "bg-sky-500/15 text-sky-800",
    },
    {
      title: "Voucher đang hiệu lực",
      value: ADMIN_STATS.activeVouchers,
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-on-surface font-sans tracking-tight">
              Thu gom hoàn thành toàn hệ thống
            </h2>
            <label className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant">
              <span className="whitespace-nowrap">Năm</span>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="rounded-xl border border-surface-container-highest bg-surface-container-low px-3 py-2 text-on-surface font-bold min-w-[5.5rem] focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {[2026, 2025, 2024].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="text-sm text-on-surface-variant mb-4">
            Tổng số lượt thu gom đã hoàn tất trên toàn nền tảng theo từng tháng.
          </p>
          <div className="h-64 md:h-72 relative w-full">
            <canvas ref={barCanvasRef} />
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
