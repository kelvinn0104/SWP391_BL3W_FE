import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  FileText,
  Image as ImageIcon,
  Leaf,
  Map as MapIcon,
  MapPin,
  Package,
  PackageCheck,
  X,
} from "lucide-react";
import UploadImageModal from "../../components/modal/UploadImageModal";
import { MOCK_HISTORY_TASKS } from "./HistoryTasks";
import { MOCK_TASKS, statusBadgeClass } from "./Tasks";

function mapEmbedSrc(lat, lng) {
  const q = `${lat},${lng}`;
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=16&hl=vi&output=embed`;
}

const STATUS_ASSIGNED = "Đã phân công";
const STATUS_ON_THE_WAY = "Đang trên đường";

export default function TaskDetail() {
  const navigate = useNavigate();
  const { id: rawId } = useParams();
  const id = rawId ? decodeURIComponent(rawId) : "";
  const task = [...MOCK_TASKS, ...MOCK_HISTORY_TASKS].find((t) => t.id === id);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [id]);

  const images = task?.images ?? [];
  const activeSrc = images[activeImageIndex] ?? images[0];

  const embedSrc = useMemo(() => {
    if (!task?.coordinates) return null;
    return mapEmbedSrc(task.coordinates.lat, task.coordinates.lng);
  }, [task]);

  if (!task) {
    return (
      <div className="relative min-h-full overflow-x-hidden">
        <div className="relative z-0 px-4 sm:px-6 md:px-0 py-10 sm:py-14 space-y-6">
          <Link
            to="/collector/tasks"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách công việc
          </Link>
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-surface-container-high/60 text-on-surface-variant">
            Không tìm thấy công việc với mã{" "}
            <span className="font-bold text-on-surface">{id || "—"}</span>.
          </div>
        </div>
      </div>
    );
  }

  const weightLabel =
    typeof task.weightKg === "number" ? `${task.weightKg}kg` : task.weightKg;

  const showAssignedActions = task.status === STATUS_ASSIGNED;
  const showConfirmPickup = task.status === STATUS_ON_THE_WAY;

  function handleReject() {
    // TODO: gọi API từ chối phân công
    navigate("/collector/tasks");
  }

  function handleAccept() {
    // TODO: gọi API đồng ý → chuyển sang Đang trên đường
    navigate("/collector/tasks");
  }

  return (
    <div className="relative min-h-full overflow-x-hidden">
      <div className="relative z-0 px-4 sm:px-6 md:px-0 py-10 sm:py-14 space-y-8">
        <Link
          to="/collector/tasks"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách công việc
        </Link>

        <article className="bg-surface-container-lowest rounded-[2.5rem] sm:rounded-[3rem] p-7 sm:p-10 border border-surface-container-high/60 botanical-shadow space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-3 min-w-0 flex-1">
              <p className="text-sm font-bold text-primary">
                Chi tiết công việc
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tight">
                  {task.title}
                </h1>
                <span
                  className={`inline-flex items-center shrink-0 rounded-full px-3 py-1 text-xs font-black ${statusBadgeClass(
                    task.status,
                  )}`}
                >
                  {task.status}
                </span>
              </div>
              <p className="text-sm font-semibold text-on-surface-variant">
                Mã report:{" "}
                <span className="text-on-surface font-mono">{task.id}</span>
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                <Leaf className="w-4 h-4 shrink-0" />
                <span>Danh mục: {task.category}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-on-surface-variant pt-1">
                <div className="inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>{task.location}</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary shrink-0" />
                  <span>Ngày tạo: {task.createdAt}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-surface-container-high/70 bg-surface-container-low/50 p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">
                  Mô tả
                </p>
                <p className="text-sm sm:text-base text-on-surface leading-relaxed inline-flex gap-2">
                  <FileText className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <span>{task.description}</span>
                </p>
              </div>
            </div>

            <div className="self-start shrink-0 w-full lg:w-auto lg:min-w-[14rem] space-y-3">
              <div className="inline-flex w-full lg:w-auto items-center justify-center gap-2 bg-primary/5 text-primary rounded-xl px-4 py-2.5 text-sm font-bold">
                <Package className="w-4 h-4" />
                {weightLabel}
              </div>
            </div>
          </div>

          {images.length > 0 && (
            <div className="space-y-4 border-t border-surface-container-high/60 pt-8">
              <h2 className="text-lg font-extrabold text-on-surface inline-flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                Hình ảnh hiện trường
              </h2>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-4">
                <div className="min-w-0 w-full max-w-full overflow-hidden rounded-2xl border border-surface-container-high/60 bg-surface-container-low aspect-[4/3] sm:aspect-video lg:max-w-[min(100%,42rem)]">
                  {activeSrc ? (
                    <img
                      src={activeSrc}
                      alt={`Ảnh ${activeImageIndex + 1} của công việc ${task.id}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 lg:flex-col lg:w-28 shrink-0 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0 -mx-1 px-1 lg:mx-0 lg:px-0">
                    {images.map((src, index) => {
                      const isActive = index === activeImageIndex;
                      return (
                        <button
                          key={`${task.id}-img-${index}`}
                          type="button"
                          onClick={() => setActiveImageIndex(index)}
                          className={`relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 lg:w-full lg:aspect-square rounded-xl overflow-hidden border-2 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                            isActive
                              ? "border-primary ring-2 ring-primary/25 shadow-md"
                              : "border-transparent opacity-90 hover:opacity-100 hover:border-surface-container-high"
                          }`}
                          aria-label={`Xem ảnh ${index + 1}`}
                          aria-pressed={isActive}
                        >
                          <img
                            src={src}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4 border-t border-surface-container-high/60 pt-8">
            <h2 className="text-lg font-extrabold text-on-surface inline-flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-primary" />
              Vị trí trên bản đồ
            </h2>
            {embedSrc ? (
              <div className="overflow-hidden rounded-2xl border border-surface-container-high/60 bg-surface-container-low shadow-inner">
                <iframe
                  title={`Bản đồ khu vực: ${task.location}`}
                  className="h-[min(420px,55vh)] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={embedSrc}
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-surface-container-high p-8 text-center text-sm text-on-surface-variant">
                Chưa có dữ liệu bản đồ cho công việc này.
              </div>
            )}
          </div>

          {(showAssignedActions || showConfirmPickup) && (
            <div className="border-t border-surface-container-high/60 pt-8 space-y-4">
              {showAssignedActions && (
                <div className="flex flex-col-reverse sm:flex-row sm:flex-wrap sm:justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleReject}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-red-600 text-white px-5 py-3 text-sm font-extrabold shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest"
                  >
                    <X className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                    Từ chối
                  </button>
                  <button
                    type="button"
                    onClick={handleAccept}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white px-5 py-3 text-sm font-extrabold shadow-md shadow-primary/25 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest"
                  >
                    <Check className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                    Đồng ý
                  </button>
                </div>
              )}

              {showConfirmPickup && (
                <div className="flex flex-col sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(true)}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary text-white px-6 py-3.5 text-sm font-extrabold shadow-md shadow-primary/25 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest"
                  >
                    <PackageCheck
                      className="w-4 h-4 shrink-0"
                      strokeWidth={2.5}
                    />
                    Xác nhận thu gom
                  </button>
                </div>
              )}
            </div>
          )}
        </article>
      </div>

      <UploadImageModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        taskId={task.id}
        taskTitle={task.title}
        onSuccess={() => navigate("/collector/history")}
      />
    </div>
  );
}
