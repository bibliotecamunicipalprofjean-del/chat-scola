import React from "react";
import { BookOpen, Sparkles } from "lucide-react";

interface MobileBottomNavProps {
  totalBooks: number;
  onOpenAbout: () => void;
  onScrollToSearch: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  totalBooks,
  onOpenAbout,
  onScrollToSearch
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-2 shadow-lg flex items-center justify-around safe-area-pb">
      <button
        onClick={onScrollToSearch}
        className="flex flex-col items-center gap-0.5 text-stone-700 active:text-emerald-800 cursor-pointer"
        aria-label="Ir para a busca do catálogo"
      >
        <BookOpen className="w-4 h-4 text-emerald-800" />
        <span className="text-[10px] font-bold">Catálogo ({totalBooks})</span>
      </button>

      <div className="w-px h-6 bg-stone-200"></div>

      <button
        onClick={onOpenAbout}
        className="flex flex-col items-center gap-0.5 text-stone-700 active:text-emerald-800 cursor-pointer"
        aria-label="Sobre a biblioteca"
      >
        <Sparkles className="w-4 h-4 text-amber-600" />
        <span className="text-[10px] font-bold">A Biblioteca</span>
      </button>
    </div>
  );
};

