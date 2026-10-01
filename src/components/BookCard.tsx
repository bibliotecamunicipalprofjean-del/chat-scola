import React, { useState } from "react";
import { Book, Bookmark, Volume2 } from "lucide-react";
import { LibibBook } from "../types";

interface BookCardProps {
  book: LibibBook;
  onSelect: (book: LibibBook) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onSelect }) => {
  const [imageError, setImageError] = useState(false);

  const hasCover = book.coverUrl && !imageError && !book.coverUrl.includes("missing.png");

  // Determine an accent color based on collection
  const getCollectionColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("infantil")) return "bg-amber-50 text-amber-900 border-amber-200";
    if (n.includes("literatura")) return "bg-sky-50 text-sky-900 border-sky-200";
    if (n.includes("história")) return "bg-orange-50 text-orange-900 border-orange-200";
    if (n.includes("pedagogia")) return "bg-emerald-50 text-emerald-900 border-emerald-200";
    if (n.includes("ciências") || n.includes("meio ambiente")) return "bg-teal-50 text-teal-900 border-teal-200";
    if (n.includes("autoajuda")) return "bg-purple-50 text-purple-900 border-purple-200";
    if (n.includes("religião")) return "bg-stone-100 text-stone-900 border-stone-300";
    return "bg-stone-50 text-stone-800 border-stone-200";
  };

  return (
    <article
      id={`book-card-${book.id}`}
      tabIndex={0}
      role="button"
      aria-label={`Livro ${book.title}, de ${book.author}. Toque para abrir.`}
      onClick={() => onSelect(book)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(book);
        }
      }}
      className="group bg-white rounded-2xl border border-stone-200 hover:border-emerald-700/50 active:scale-[0.98] focus:outline-hidden focus:ring-3 focus:ring-amber-500 focus:border-amber-600 hover:shadow-md transition-all duration-150 flex flex-col overflow-hidden cursor-pointer h-full select-none shadow-xs"
    >
      {/* Cover container with aspect-3/4 */}
      <div className="relative aspect-3/4 bg-stone-100 flex items-center justify-center overflow-hidden border-b border-stone-100">
        {hasCover ? (
          <img
            src={book.coverUrl!}
            alt={book.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          /* Stylized literary jacket */
          <div className="w-full h-full p-3 sm:p-4 flex flex-col justify-between bg-radial from-stone-800 to-stone-900 text-stone-100 relative">
            <div className="absolute left-1.5 top-0 bottom-0 w-1.5 border-r border-stone-700/60 shadow-inner"></div>
            <div className="flex justify-between items-start pl-2">
              <Book className="w-5 h-5 text-amber-400/80" />
              <Bookmark className="w-3.5 h-3.5 text-emerald-400/60" />
            </div>
            <div className="pl-2 pr-1 my-auto">
              <p className="font-display font-semibold text-xs sm:text-sm line-clamp-3 leading-snug text-stone-100">
                {book.title}
              </p>
              <p className="text-[11px] text-stone-400 mt-1.5 font-medium line-clamp-1">
                {book.author}
              </p>
            </div>
            <div className="pl-2 text-[9px] text-stone-400 uppercase tracking-wider truncate">
              {book.collectionName}
            </div>
          </div>
        )}

        {/* Collection badge overlay on top */}
        <div className="absolute top-2 left-2 max-w-[85%] pointer-events-none">
          <span
            className={`inline-block px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold border backdrop-blur-md shadow-xs truncate ${getCollectionColor(
              book.collectionName
            )}`}
          >
            {book.collectionName}
          </span>
        </div>
      </div>

      {/* Book Information - Compact app styling on mobile */}
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3
            className="font-display text-xs sm:text-sm font-bold text-stone-900 line-clamp-2 leading-snug group-hover:text-emerald-900 transition-colors"
            title={book.title}
          >
            {book.title}
          </h3>
          <p
            className="text-[11px] sm:text-xs text-stone-600 font-medium mt-1 line-clamp-1"
            title={book.author}
          >
            {book.author}
          </p>
        </div>

        {/* Mobile-friendly card footer */}
        <div className="mt-2 sm:mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] sm:text-[11px]">
          <span className="font-mono text-stone-400 text-[10px]">#{book.id}</span>
          <span className="text-emerald-800 font-bold group-hover:underline flex items-center gap-0.5">
            Abrir →
          </span>
        </div>
      </div>
    </article>
  );
};
