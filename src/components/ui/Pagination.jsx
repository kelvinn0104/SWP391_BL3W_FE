import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Compact page list: e.g. 1 … 4 5 [6] 7 8 … 27 — avoids dozens of buttons in a row.
 * @param {number} current
 * @param {number} total
 * @returns {(number | 'ellipsis')[]}
 */
function buildPageItems(current, total) {
  if (total <= 1) return [1];
  if (total <= 9) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const delta = 1;
  const range = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  if (left > 2) range.push("ellipsis");
  for (let p = left; p <= right; p++) {
    if (p !== 1 && p !== total) range.push(p);
  }
  if (right < total - 1) range.push("ellipsis");
  if (total > 1) range.push(total);

  /** @type {(number|'ellipsis')[]} */
  const deduped = [];
  let last = null;
  for (const item of range) {
    if (item === "ellipsis" && last === "ellipsis") continue;
    if (typeof item === "number" && typeof last === "number" && item === last)
      continue;
    deduped.push(item);
    last = item;
  }
  return deduped;
}

/**
 * Reusable Pagination Component
 * @param {Object} props
 * @param {number} props.currentPage - Current active page
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {string} props.className - Extra container classes
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  const items = useMemo(
    () => buildPageItems(currentPage, totalPages),
    [currentPage, totalPages],
  );

  if (totalPages <= 1) return null;

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-full ${className}`}
    >
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-3 rounded-full bg-surface-container-highest/50 text-on-surface-variant hover:text-primary hover:bg-primary/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm shrink-0"
        title="Trang trước"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 bg-surface-container-highest/30 p-1.5 rounded-full border border-surface-container-highest min-w-0 max-w-full overflow-x-auto no-scrollbar">
        {items.map((item, idx) =>
          item === "ellipsis" ? (
            <span
              key={`e-${idx}`}
              className="px-1.5 sm:px-2 text-on-surface-variant/50 font-black text-sm select-none"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`min-w-9 h-9 sm:w-10 sm:h-10 rounded-full font-black text-xs sm:text-sm transition-all focus:outline-none shrink-0 ${
                currentPage === item
                  ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                  : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
              }`}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-3 rounded-full bg-surface-container-highest/50 text-on-surface-variant hover:text-primary hover:bg-primary/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm shrink-0"
        title="Trang sau"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;
