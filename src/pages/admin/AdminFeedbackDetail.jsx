import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquare,
  User,
} from "lucide-react";
import { FEEDBACK_ITEMS } from "./AdminFeedback";

const STATUS_OPTIONS = [
  { value: "open", label: "Chờ xử lý" },
  { value: "in_progress", label: "Đang xử lý" },
  { value: "resolved", label: "Đã giải quyết" },
];

function statusText(status) {
  return STATUS_OPTIONS.find((x) => x.value === status)?.label ?? status;
}

export default function AdminFeedbackDetail() {
  const { id = "" } = useParams();
  const decodedId = decodeURIComponent(id);
  const feedback = useMemo(
    () => FEEDBACK_ITEMS.find((item) => item.id === decodedId),
    [decodedId],
  );

  const [status, setStatus] = useState(feedback?.status ?? "open");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  if (!feedback) {
    return (
      <div className="space-y-6">
        <Link
          to="/admin/feedback"
          className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách khiếu nại
        </Link>
        <div className="rounded-2xl border border-surface-container-high bg-surface p-6 text-on-surface-variant">
          Không tìm thấy khiếu nại với mã{" "}
          <span className="font-bold text-on-surface">{decodedId}</span>.
        </div>
      </div>
    );
  }

  function onSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col gap-3 mb-4 md:mb-6 px-2">
        <Link
          to="/admin/feedback"
          className="inline-flex items-center gap-2 text-primary font-bold hover:underline w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách khiếu nại
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tight">
            Chi tiết khiếu nại
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-bold mt-1 opacity-60">
            Mã đơn: {feedback.id}
          </p>
        </div>
      </header>

      <section className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest p-6 space-y-5">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">
            Tiêu đề
          </p>
          <h2 className="text-2xl font-bold text-on-surface">
            {feedback.subject}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-on-surface-variant">
          <p className="inline-flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            {feedback.sender}
          </p>
          <p className="inline-flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            {feedback.email}
          </p>
          <p className="inline-flex items-center gap-2">
            <Clock3 className="w-4 h-4 text-primary" />
            {feedback.createdAt}
          </p>
          <p className="inline-flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Trạng thái hiện tại:{" "}
            <span className="font-bold text-on-surface">
              {statusText(feedback.status)}
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-surface-container-high bg-surface p-5">
          <p className="text-sm leading-relaxed text-on-surface">
            {feedback.message}
          </p>
        </div>
      </section>

      <section className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest p-6 space-y-4">
        <h3 className="text-lg font-bold text-on-surface">Xử lý khiếu nại</h3>
        <div className="space-y-2">
          <label className="text-sm font-bold text-on-surface">
            Cập nhật trạng thái
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full md:max-w-xs rounded-xl border border-surface-container-high bg-surface px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-on-surface">
            Ghi chú phản hồi admin
          </label>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập nội dung xử lý hoặc hướng dẫn phản hồi người dùng..."
            className="w-full rounded-xl border border-surface-container-high bg-surface px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 resize-y"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-container transition-all"
          >
            Lưu xử lý
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              Đã lưu cập nhật
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
