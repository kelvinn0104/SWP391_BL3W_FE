import { createPortal } from "react-dom";
import { X } from "lucide-react";

const confirmButtonVariants = {
  danger: "bg-error hover:bg-error/90 shadow-error/20",
  success: "bg-success hover:bg-success/90 shadow-success/20",
};

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {() => void | Promise<void>} props.onConfirm
 * @param {string} [props.title]
 * @param {string} [props.message]
 * @param {string} [props.confirmText]
 * @param {boolean} [props.isLoading]
 * @param {"danger" | "success"} [props.variant] — danger: xóa / khóa; success: mở khóa / bật lại
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận xóa",
  message = "Bạn có chắc chắn muốn xóa?",
  confirmText = "Xóa",
  isLoading = false,
  variant = "danger",
}) => {
  if (!isOpen) return null;

  const confirmBtnClass =
    confirmButtonVariants[variant] ?? confirmButtonVariants.danger;

  return createPortal(
    <div
      className="fixed inset-0 z-300 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={isLoading ? undefined : onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-lg p-8 bg-surface-container-lowest border border-surface-container-high rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute text-on-surface-variant transition-colors top-4 right-4 p-2 rounded-full hover:bg-surface-container-high hover:text-on-surface disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" strokeWidth={2.25} />
        </button>

        <h2
          id="confirm-modal-title"
          className="mb-6 text-xl font-bold text-center text-on-surface pr-8"
        >
          {title}
        </h2>

        <div className="mb-8">
          <p className="text-center text-on-surface-variant font-semibold leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            type="button"
            className={`px-12 py-2.5 font-bold text-white transition-all rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${confirmBtnClass}`}
          >
            {isLoading ? "Đang xác nhận..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmModal;
