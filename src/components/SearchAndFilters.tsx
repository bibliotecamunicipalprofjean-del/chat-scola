import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, ArrowUpDown, X, BookOpen, Layers, Mic, MicOff } from "lucide-react";
import { LibibCollection } from "../types";

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCollection: string;
  onCollectionChange: (collection: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  collections: LibibCollection[];
  totalAll: number;
  totalFiltered?: number;
  onResetFilters?: () => void;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCollection,
  onCollectionChange,
  sortBy,
  onSortChange,
  collections,
  totalAll,
  totalFiltered,
  onResetFilters
}) => {
  // Filter collections that actually have items
  const activeCollections = collections.filter((c) => c.count > 0);

  // Voice Search (Speech Recognition) State
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceHint, setVoiceHint] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech Recognition API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setVoiceSupported(true);
      const recog = new SpeechRecognition();
      recog.lang = "pt-BR";
      recog.continuous = false;
      recog.interimResults = true;

      recog.onstart = () => {
        setIsListening(true);
        setVoiceHint("Ouvindo... pode falar o título ou autor");
      };

      recog.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          const cleaned = transcript.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
          onSearchChange(cleaned.trim());
          setVoiceHint(`Você disse: "${cleaned.trim()}"`);
        }
      };

      recog.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === "not-allowed") {
          setVoiceHint("Microfone bloqueado. Permita o acesso no navegador.");
        } else if (event.error === "no-speech") {
          setVoiceHint("Nenhuma fala detectada. Toque no microfone de novo.");
        } else {
          setVoiceHint("Não foi possível captar. Tente novamente.");
        }
        setTimeout(() => setVoiceHint(null), 4000);
      };

      recog.onend = () => {
        setIsListening(false);
        setTimeout(() => setVoiceHint(null), 3000);
      };

      recognitionRef.current = recog;
    }
  }, [onSearchChange]);

  const toggleVoiceSearch = () => {
    if (!voiceSupported || !recognitionRef.current) {
      alert("Seu navegador não possui suporte para busca por voz. Recomendamos usar o Google Chrome no celular ou computador.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setVoiceHint(null);
    } else {
      try {
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
        setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch {
            // ignore
          }
        }, 200);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-3 sm:p-5 shadow-xs mb-4 sm:mb-6">
      {/* Top Search Input with Mobile-Friendly Design */}
      <div className="space-y-2.5">
        <div className="relative flex items-center">
          <label htmlFor="search-input" className="sr-only">
            Buscar por título ou autor
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={isListening ? "Ouvindo sua voz agora..." : "Buscar livro por título ou autor..."}
            className={`w-full pl-10 pr-22 py-2.5 sm:py-3 bg-stone-50 hover:bg-stone-100/70 focus:bg-white border rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden transition-all ${
              isListening
                ? "border-red-500 ring-2 ring-red-300 bg-red-50/40"
                : "border-stone-200 focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700"
            }`}
          />

          {/* Right Action buttons inside search bar */}
          <div className="absolute inset-y-0 right-0 pr-1.5 sm:pr-2 flex items-center gap-1">
            {searchTerm && (
              <button
                onClick={() => onSearchChange("")}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg cursor-pointer active:bg-stone-200"
                title="Limpar busca"
                aria-label="Limpar texto"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Voice Search Button */}
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleVoiceSearch}
                aria-pressed={isListening}
                aria-label={isListening ? "Parar gravação de voz" : "Pesquisar livro falando"}
                title={isListening ? "Clique para parar" : "Falar o nome do livro (Voz)"}
                className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                  isListening
                    ? "bg-red-600 text-white shadow-md animate-pulse scale-105"
                    : "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 active:scale-95"
                }`}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4 text-emerald-800" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Dropdowns Row: 2 columns on mobile, aligned on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-12 gap-2">
          {/* Category Dropdown */}
          <div className="sm:col-span-6 relative">
            <label htmlFor="category-select" className="sr-only">
              Filtrar por Categoria
            </label>
            <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none text-stone-400">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <select
              id="category-select"
              value={selectedCollection}
              onChange={(e) => onCollectionChange(e.target.value)}
              className="w-full pl-8 pr-6 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 cursor-pointer truncate"
            >
              <option value="all">Todas ({totalAll})</option>
              {activeCollections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name} ({col.count})
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="sm:col-span-6 relative">
            <label htmlFor="sort-select" className="sr-only">
              Ordenar livros
            </label>
            <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none text-stone-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </div>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full pl-8 pr-6 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 cursor-pointer truncate"
            >
              <option value="default">Padrão Libib</option>
              <option value="title-asc">Título (A-Z)</option>
              <option value="title-desc">Título (Z-A)</option>
              <option value="author-asc">Autor (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Voice Status feedback banner */}
      {voiceHint && (
        <div
          role="status"
          aria-live="polite"
          className="mt-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-2 animate-in fade-in"
        >
          <div className="flex items-center gap-2 truncate">
            <span className={`w-2 h-2 rounded-full shrink-0 ${isListening ? "bg-red-500 animate-ping" : "bg-emerald-600"}`}></span>
            <span className="font-medium truncate">{voiceHint}</span>
          </div>
          {isListening && (
            <span className="text-[10px] text-emerald-700 font-bold shrink-0">Fale agora...</span>
          )}
        </div>
      )}

      {/* Horizontal Scrollable Categories Chips for fast touch selection */}
      <div className="mt-2.5 pt-2.5 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => onCollectionChange("all")}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
            selectedCollection === "all"
              ? "bg-emerald-800 text-white shadow-xs"
              : "bg-stone-100 hover:bg-stone-200 text-stone-700 active:bg-stone-300"
          }`}
        >
          Todos ({totalAll})
        </button>
        {activeCollections.map((col) => {
          const isSelected = selectedCollection === col.id;
          return (
            <button
              key={col.id}
              onClick={() => onCollectionChange(col.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-stone-100 hover:bg-stone-200 text-stone-700 active:bg-stone-300"
              }`}
            >
              <span>{col.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-emerald-900/80 text-emerald-100" : "bg-stone-200 text-stone-600"
                }`}
              >
                {col.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
