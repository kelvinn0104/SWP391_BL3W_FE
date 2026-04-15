import React from 'react';
import { AlertTriangle, Info, XCircle, CheckCircle, X } from 'lucide-react';

/**
 * Premium Alert Modal Component
 * @param {Object} props
 * @param {boolean} props.isOpen - Visibility state
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {string} props.message - Modal body text
 * @param {'warning' | 'error' | 'info' | 'success'} props.type - Alert theme
 * @param {Function} [props.onConfirm] - Optional confirmation handler
 */
const AlertModal = ({ isOpen, onClose, title, message, type = 'warning', onConfirm }) => {
  if (!isOpen) return null;

  const isConfirm = typeof onConfirm === 'function';

  const themes = {
    warning: {
      icon: <AlertTriangle className="w-10 h-10" />,
      color: 'text-warning',
      bgIcon: 'bg-warning/10',
      btn: 'bg-warning hover:bg-warning/90 shadow-warning/20'
    },
    error: {
      icon: <XCircle className="w-10 h-10" />,
      color: 'text-error',
      bgIcon: 'bg-error/10',
      btn: 'bg-error hover:bg-error/90 shadow-error/20'
    },
    info: {
      icon: <Info className="w-10 h-10" />,
      color: 'text-primary',
      bgIcon: 'bg-primary/10',
      btn: 'bg-primary hover:bg-primary/90 shadow-primary/20'
    },
    success: {
      icon: <CheckCircle className="w-10 h-10" />,
      color: 'text-success',
      bgIcon: 'bg-success/10',
      btn: 'bg-success hover:bg-success/90 shadow-success/20'
    }
  };

  const theme = themes[type] || themes.info;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-surface-container-lowest border border-surface-container-highest rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 p-10 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-on-surface-variant hover:text-error transition-all p-2 bg-surface-container hover:bg-error/10 rounded-full group"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        </button>

        <div className={`w-24 h-24 ${theme.bgIcon} ${theme.color} rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner`}>
          {theme.icon}
        </div>

        <h3 className="text-3xl font-black text-on-surface mb-3 tracking-tight">{title}</h3>
        <div className="text-on-surface-variant mb-10 leading-relaxed font-bold opacity-80">
          {message}
        </div>

        {isConfirm ? (
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-bold text-on-surface-variant hover:bg-surface-container-highest transition-all active:scale-95"
            >
              Huỷ
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 ${theme.btn}`}
            >
              Xác nhận
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 ${theme.btn}`}
          >
            Tôi đã hiểu
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertModal;
