import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  totalItems: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems
}) => {
  if (totalPages <= 1 && totalItems <= 12) return null;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-1 border-t border-stone-200 mt-4 sm:mt-6 select-none">
      {/* Range indicator & Page size selector */}
      <div className="flex items-center justify-between w-full sm:w-auto text-xs text-stone-600 gap-2">
        <span>
          <strong>{startItem}</strong> - <strong>{endItem}</strong> de <strong>{totalItems}</strong> livros
        </span>
        <div className="flex items-center gap-1.5">
          <label htmlFor="page-size-select" className="text-stone-400 text-[11px] hidden xs:inline">
            Exibir:
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-700 cursor-pointer focus:ring-1 focus:ring-emerald-700"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
            <option value={96}>96</option>
          </select>
        </div>
      </div>

      {/* Page navigation buttons - touch friendly */}
      <div className="flex items-center justify-center gap-1 w-full sm:w-auto">
        <button
          onClick={() => {
            onPageChange(currentPage - 1);
            window.scrollTo({ top: 120, behavior: "smooth" });
          }}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:bg-stone-100"
          title="Página anterior"
          aria-label="Ir para página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === "...") {
              return (
                <span key={`dots-${idx}`} className="px-1 text-stone-400 text-xs">
                  ...
                </span>
              );
            }
            const isCurrent = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => {
                  onPageChange(Number(page));
                  window.scrollTo({ top: 120, behavior: "smooth" });
                }}
                className={`min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  isCurrent
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 active:bg-stone-100"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            onPageChange(currentPage + 1);
            window.scrollTo({ top: 120, behavior: "smooth" });
          }}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:bg-stone-100"
          title="Próxima página"
          aria-label="Ir para próxima página"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
