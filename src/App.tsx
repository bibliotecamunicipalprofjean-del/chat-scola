import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Header } from "./components/Header";
import { SearchAndFilters } from "./components/SearchAndFilters";
import { BookCard } from "./components/BookCard";
import { BookDetailModal } from "./components/BookDetailModal";
import { Pagination } from "./components/Pagination";
import { IntegrationInfoModal } from "./components/IntegrationInfoModal";
import { AboutLibraryModal } from "./components/AboutLibraryModal";
import { CreatorTributeModal } from "./components/CreatorTributeModal";
import { AccessibilityBar } from "./components/AccessibilityBar";
import { ReadingGuide } from "./components/ReadingGuide";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { AccessibilitySettings, DEFAULT_ACCESSIBILITY_SETTINGS } from "./accessibilityTypes";
import { CatalogState, LibibBook } from "./types";
import {
  BookOpen,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Library,
  BookMarked,
  Heart,
  Volume2,
  Camera,
  Upload
} from "lucide-react";
import { getCreatorPhoto, subscribeCreatorPhoto, uploadCreatorPhoto } from "./utils/photoManager";

export default function App() {
  const [catalogState, setCatalogState] = useState<CatalogState>({
    books: [],
    collections: [],
    totalBooks: 0,
    lastSyncTime: null,
    isSyncing: true,
    syncError: null,
    sourceUrl: "https://www.libib.com/u/bibliotecaebmjjs/l/258160",
    technicalInfo: {
      publicCatalogUrl: "https://www.libib.com/u/bibliotecaebmjjs/l/258160",
      accountUsername: "bibliotecaebmjjs",
      detectedCollectionsCount: 0,
      availableFields: ["title", "author", "cover_image", "collection", "libib_id"],
      libibLimitationsNote: ""
    }
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [sortBy, setSortBy] = useState("title-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  // Modals
  const [selectedBook, setSelectedBook] = useState<LibibBook | null>(null);
  const [isIntegrationInfoOpen, setIsIntegrationInfoOpen] = useState(false);
  const [isAboutLibraryOpen, setIsAboutLibraryOpen] = useState(false);
  const [isCreatorTributeOpen, setIsCreatorTributeOpen] = useState(false);

  // Creator Photo
  const [creatorPhoto, setCreatorPhoto] = useState<string>(() => getCreatorPhoto());

  useEffect(() => {
    const unsubscribe = subscribeCreatorPhoto((newUrl) => {
      setCreatorPhoto(newUrl);
    });
    return unsubscribe;
  }, []);

  // Toast / Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Accessibility State (stored in localStorage)
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem("library_accessibility_settings");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_ACCESSIBILITY_SETTINGS;
  });

  // Text-To-Speech SpeechSynthesis state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Apply Accessibility Classes to Document Root
  useEffect(() => {
    const root = document.documentElement;

    // Font size level (-1 to 2)
    root.classList.remove("text-size-sm", "text-size-base", "text-size-lg", "text-size-xl");
    if (accessibility.fontSizeLevel === -1) root.classList.add("text-size-sm");
    else if (accessibility.fontSizeLevel === 1) root.classList.add("text-size-lg");
    else if (accessibility.fontSizeLevel === 2) root.classList.add("text-size-xl");
    else root.classList.add("text-size-base");

    // High Contrast
    if (accessibility.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Dyslexic friendly font
    if (accessibility.dyslexicFont) {
      root.classList.add("font-dyslexic");
    } else {
      root.classList.remove("font-dyslexic");
    }

    // Reduced motion
    if (accessibility.reducedMotion) {
      root.classList.add("reduced-motion");
    } else {
      root.classList.remove("reduced-motion");
    }

    // Save to localStorage
    try {
      localStorage.setItem("library_accessibility_settings", JSON.stringify(accessibility));
    } catch {
      // ignore
    }
  }, [accessibility]);

  // Speech synthesis handlers
  const stopSpeech = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speakText = useCallback(
    (text: string) => {
      if (!("speechSynthesis" in window)) {
        alert("Seu navegador não possui suporte para síntese de voz.");
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 0.95; // slightly slower for better accessibility comprehension
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  const handleUpdateAccessibility = (newSettings: Partial<AccessibilitySettings>) => {
    setAccessibility((prev) => ({ ...prev, ...newSettings }));
  };

  const handleResetAccessibility = () => {
    setAccessibility(DEFAULT_ACCESSIBILITY_SETTINGS);
    stopSpeech();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch catalog from backend (which scrapes public Libib)
  const fetchCatalog = useCallback(async () => {
    try {
      setCatalogState((prev) => ({ ...prev, isSyncing: true, syncError: null }));
      const res = await fetch("/api/catalog");
      if (!res.ok) {
        throw new Error(`Erro ao consultar catálogo: ${res.statusText}`);
      }
      const data = await res.json();
      setCatalogState((prev) => ({
        ...prev,
        books: data.books || [],
        collections: data.collections || [],
        totalBooks: data.totalBooks || (data.books ? data.books.length : 0),
        lastSyncTime: data.lastSyncTime || new Date().toISOString(),
        isSyncing: false,
        syncError: null,
        technicalInfo: {
          ...prev.technicalInfo,
          detectedCollectionsCount: data.collections ? data.collections.length : 0
        }
      }));
    } catch (err: any) {
      console.error("Erro ao sincronizar catálogo do Libib:", err);
      setCatalogState((prev) => ({
        ...prev,
        isSyncing: false,
        syncError: err.message || "Falha ao obter livros do Libib."
      }));
    }
  }, []);

  // Force a fresh sync from Libib
  const handleForceRefresh = async () => {
    try {
      setCatalogState((prev) => ({ ...prev, isSyncing: true }));
      showToast("Consultando Libib público para verificar novos livros...");
      const res = await fetch("/api/catalog/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast(`Catálogo sincronizado com sucesso! ${data.totalBooks} livros encontrados.`);
        await fetchCatalog();
      } else {
        throw new Error(data.error || "Erro desconhecido");
      }
    } catch (err: any) {
      showToast("Não foi possível atualizar agora. Tentaremos novamente em instantes.");
      setCatalogState((prev) => ({ ...prev, isSyncing: false, syncError: err.message }));
    }
  };

  // Initial load & periodic background check (every 5 minutes)
  useEffect(() => {
    fetchCatalog();

    const interval = setInterval(() => {
      fetchCatalog();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchCatalog]);

  // Filter & Sort books
  const filteredBooks = useMemo(() => {
    let result = [...catalogState.books];

    // Filter by Collection
    if (selectedCollection && selectedCollection !== "all") {
      result = result.filter(
        (b) => b.collectionId === selectedCollection || b.collectionName === selectedCollection
      );
    }

    // Filter by Search (Title or Author)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "title-asc") {
        return a.title.localeCompare(b.title, "pt-BR");
      }
      if (sortBy === "title-desc") {
        return b.title.localeCompare(a.title, "pt-BR");
      }
      if (sortBy === "author-asc") {
        return a.author.localeCompare(b.author, "pt-BR");
      }
      return 0; // Default Libib catalog order
    });

    return result;
  }, [catalogState.books, selectedCollection, searchTerm, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCollection, sortBy, pageSize]);

  // Paginated books
  const totalPages = Math.ceil(filteredBooks.length / pageSize) || 1;
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredBooks.slice(startIndex, startIndex + pageSize);
  }, [filteredBooks, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCollection("all");
    setSortBy("title-asc");
    setCurrentPage(1);
  };

  const handleScrollToSearch = () => {
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      searchInput.focus();
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/70 flex flex-col selection:bg-emerald-100 selection:text-emerald-950 pb-16 md:pb-0">
      {/* Reading Guide Line */}
      <ReadingGuide isActive={accessibility.readingGuide} />

      {/* Citizen Accessibility Bar */}
      <AccessibilityBar
        settings={accessibility}
        onUpdateSettings={handleUpdateAccessibility}
        onReset={handleResetAccessibility}
        isSpeaking={isSpeaking}
        onStopSpeech={stopSpeech}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-5 right-4 left-4 sm:left-auto z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-medium flex items-center gap-2 border border-stone-700 animate-in slide-in-from-bottom-5">
          <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        catalogState={catalogState}
        onRefreshCatalog={handleForceRefresh}
        onOpenIntegrationInfo={() => setIsIntegrationInfoOpen(true)}
        onOpenAboutLibrary={() => setIsAboutLibraryOpen(true)}
      />

      {/* Main Container */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3.5 sm:py-6 focus:outline-hidden">
        {/* Welcome & Scope Notice - Compact app banner on mobile */}
        <section className="mb-3.5 sm:mb-6 bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-700" />
                  Acervo Integrado Libib
                </span>
                <span className="text-xs text-stone-500 font-medium md:hidden">
                  • {catalogState.totalBooks} exemplares
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-bold text-stone-900 font-display leading-snug">
                Catálogo da Biblioteca Jean Jobis da Silva
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed hidden sm:block">
                Este catálogo é sincronizado diretamente com o nosso registro público no <strong>Libib</strong>.
                Qualquer livro adicionado, alterado ou removido no Libib aparece aqui automaticamente.
              </p>
            </div>

            {/* Quick stats counter box */}
            <div className="hidden sm:flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl p-3 shrink-0">
              <div className="p-2.5 rounded-lg bg-emerald-800 text-white">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-stone-900 leading-none">
                  {catalogState.totalBooks}
                </div>
                <div className="text-[11px] font-medium text-stone-500 mt-0.5">
                  Livros Cadastrados
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search, Categories, Sort Controls */}
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCollection={selectedCollection}
          onCollectionChange={setSelectedCollection}
          sortBy={sortBy}
          onSortChange={setSortBy}
          collections={catalogState.collections}
          totalFiltered={filteredBooks.length}
          totalAll={catalogState.totalBooks}
          onResetFilters={handleResetFilters}
        />

        {/* Catalog Grid / States */}
        {catalogState.isSyncing && catalogState.books.length === 0 ? (
          /* Initial Loading State */
          <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center shadow-xs">
            <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin mx-auto mb-3" />
            <h3 className="font-display text-base sm:text-lg font-bold text-stone-900">
              Sincronizando acervo com o Libib...
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1">
              Conectando com o catálogo público oficial da biblioteca para carregar todas as
              coleções e exemplares atualizados.
            </p>
          </div>
        ) : catalogState.syncError && catalogState.books.length === 0 ? (
          /* Error State */
          <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-xs">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-stone-900">
              Não foi possível carregar o catálogo agora
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto mt-2">
              {catalogState.syncError}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button
                onClick={handleForceRefresh}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                Tentar novamente
              </button>
              <a
                href={catalogState.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors inline-flex items-center gap-1.5"
              >
                <span>Acessar Libib diretamente</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : filteredBooks.length === 0 ? (
          /* Empty State when filtered or no books */
          <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-10 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3 text-stone-400">
              <BookMarked className="w-6 h-6" />
            </div>
            <h3 className="font-display text-base sm:text-lg font-bold text-stone-900">
              Nenhum livro encontrado
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1">
              Não encontramos nenhum exemplar correspondente aos critérios de busca aplicados.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              Ver todos os {catalogState.totalBooks} livros
            </button>
          </div>
        ) : (
          /* Books Grid - 2 columns on mobile, exactly like mobile app stores */
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4">
              {paginatedBooks.map((book) => (
                <BookCard key={book.id} book={book} onSelect={(b) => setSelectedBook(b)} />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={filteredBooks.length}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-300 mt-8 sm:mt-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
            {/* Identity column */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.svg"
                  alt="Logo da Biblioteca"
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain bg-white rounded-lg p-1"
                />
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base">
                    Biblioteca Municipal Professor Jean Jobis da Silva
                  </h4>
                  <p className="text-xs text-stone-400">
                    Escola Básica Municipal • Acervo Aberto à Comunidade
                  </p>
                </div>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed max-w-md">
                Espaço dedicado à formação leitora, incentivo à pesquisa e difusão cultural.
                Catálogo informatizado e mantido com carinho pelos educadores.
              </p>
            </div>

            {/* Libib Source column */}
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">
                Fonte de Dados
              </h5>
              <ul className="space-y-2 text-xs text-stone-400">
                <li>
                  <a
                    href="https://www.libib.com/u/bibliotecaebmjjs/l/258160"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Catálogo no Libib</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => setIsIntegrationInfoOpen(true)}
                    className="hover:text-stone-200 transition-colors cursor-pointer text-left"
                  >
                    Como funciona a sincronização
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleForceRefresh}
                    disabled={catalogState.isSyncing}
                    className="hover:text-stone-200 transition-colors cursor-pointer text-left flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${catalogState.isSyncing ? "animate-spin" : ""}`} />
                    <span>Sincronizar agora</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact column */}
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">
                Atendimento
              </h5>
              <p className="text-xs text-stone-400 leading-relaxed">
                Dúvidas sobre o acervo, doações ou empréstimos de livros? Entre em contato:
              </p>
              <a
                href="mailto:bibliotecamunicipalprofjean@gmail.com"
                className="inline-block mt-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium break-all"
              >
                bibliotecamunicipalprofjean@gmail.com
              </a>
              <p className="text-[11px] text-stone-500 mt-2">
                Segunda a Sexta-feira em horário escolar.
              </p>
            </div>
          </div>

          {/* Creator Tribute Section in Footer */}
          <div className="mt-8 pt-6 border-t border-stone-800 bg-stone-950/80 rounded-2xl p-5 sm:p-6 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-5 shadow-inner">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="shrink-0 flex flex-col items-center">
                <label
                  title="Clique para selecionar e carregar a foto oficial fabio.jpg"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-lg bg-stone-900 ring-2 ring-amber-400/20 relative group cursor-pointer block"
                >
                  <img
                    src={creatorPhoto}
                    alt="Prof. Fabio Gardioli de Carvalho"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.endsWith("/fabio_gardioli.jpg")) {
                        target.src = "/fabio_gardioli.jpg";
                      }
                    }}
                    className="w-full h-full object-cover object-top transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold text-center">
                    <Camera className="w-4 h-4 mb-0.5 text-amber-300" />
                    <span>Alterar</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          await uploadCreatorPhoto(file);
                          setToastMessage("Foto oficial atualizada com sucesso!");
                          setTimeout(() => setToastMessage(null), 4000);
                        } catch {
                          setToastMessage("Erro ao atualizar foto.");
                          setTimeout(() => setToastMessage(null), 3000);
                        }
                      }
                    }}
                  />
                </label>
              </div>

              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    Criação da Logo & Plataforma de Acessibilidade
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Jornalista FENAJ 007408 • Administrador CRA 32116
                  </span>
                </div>
                <h5 className="text-base sm:text-lg font-bold text-white font-display">
                  Prof. Fabio Gardioli de Carvalho
                </h5>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Professor na Prefeitura Municipal de Penha/SC. Criação da logo da biblioteca e desta plataforma de acessibilidade para facilitar de forma inclusiva a vida de todos que amam a leitura e que se interessam por este caminho que aproxima a todos de forma especial.
                </p>
                <p className="text-[11px] text-stone-400 italic">
                  Agradecimento especial à Diretora Valdinéia Bortolato Germano pela confiança na execução dessa missão.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCreatorTributeOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-stone-950 transition-colors cursor-pointer shrink-0 shadow-md flex items-center gap-1.5"
            >
              <span>Criador da Logo & Plataforma</span>
            </button>
          </div>

          {/* Bottom copyright */}
          <div className="pt-6 mt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-500">
            <p>
              © {new Date().getFullYear()} Biblioteca Municipal Professor Jean Jobis da Silva.
            </p>
            <p className="flex items-center gap-1">
              Catálogo oficial sincronizado via <strong className="text-stone-300">Libib</strong>.
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile App Bottom Navigation Bar */}
      <MobileBottomNav
        totalBooks={catalogState.totalBooks}
        onOpenAbout={() => setIsAboutLibraryOpen(true)}
        onScrollToSearch={handleScrollToSearch}
      />

      {/* Book Detail Modal */}
      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        isSpeaking={isSpeaking}
        onSpeakText={speakText}
        onStopSpeech={stopSpeech}
      />

      {/* Technical Integration Info Modal */}
      <IntegrationInfoModal
        isOpen={isIntegrationInfoOpen}
        onClose={() => setIsIntegrationInfoOpen(false)}
        catalogState={catalogState}
        onForceSync={handleForceRefresh}
      />

      {/* About Library Modal */}
      <AboutLibraryModal
        isOpen={isAboutLibraryOpen}
        onClose={() => setIsAboutLibraryOpen(false)}
        onOpenCreatorTribute={() => setIsCreatorTributeOpen(true)}
        creatorPhoto={creatorPhoto}
      />

      {/* Creator Tribute Modal */}
      <CreatorTributeModal
        isOpen={isCreatorTributeOpen}
        onClose={() => setIsCreatorTributeOpen(false)}
        creatorPhoto={creatorPhoto}
      />
    </div>
  );
}
