import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable Pagination Component
 * @param {Object} props
 * @param {number} props.currentPage - Current active page
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {string} props.className - Extra container classes
 */
const Pagination = ({ currentPage, totalPages, onPageChange, className = "" }) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-3 rounded-full bg-surface-container-highest/50 text-on-surface-variant hover:text-primary hover:bg-primary/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
        title="Trang trước"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 bg-surface-container-highest/30 p-1.5 rounded-full border border-surface-container-highest">
        {[...Array(totalPages)].map((_, i) => {
          const pageNum = i + 1;
          const isActive = currentPage === pageNum;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-10 h-10 rounded-full font-black text-sm transition-all focus:outline-none ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110'
                  : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-3 rounded-full bg-surface-container-highest/50 text-on-surface-variant hover:text-primary hover:bg-primary/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
        title="Trang sau"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;
