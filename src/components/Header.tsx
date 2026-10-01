import React, { useState } from "react";
import { RefreshCw, BookOpen, ExternalLink, Info, Clock, Menu, X, Library } from "lucide-react";
import { CatalogState } from "../types";

interface HeaderProps {
  catalogState: CatalogState;
  onRefreshCatalog: () => void;
  onOpenIntegrationInfo: () => void;
  onOpenAboutLibrary: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  catalogState,
  onRefreshCatalog,
  onOpenIntegrationInfo,
  onOpenAboutLibrary
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "Carregando...";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Agora";
    }
  };

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      {/* Top institution bar - Compact on mobile */}
      <div className="bg-stone-900 text-stone-300 text-[11px] py-1 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span className="font-medium text-stone-200 truncate">E.B.M. Professor Jean Jobis da Silva</span>
            <span className="text-stone-600 hidden sm:inline">•</span>
            <span className="hidden sm:inline text-stone-400">Rede Municipal de Ensino</span>
          </div>

          <div className="flex items-center gap-3 text-stone-400 shrink-0">
            <a
              href="https://www.libib.com/u/bibliotecaebmjjs/l/258160"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 transition-colors inline-flex items-center gap-1 text-[11px]"
            >
              <span>Libib.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onOpenAboutLibrary}
              className="hover:text-stone-200 transition-colors cursor-pointer hidden xs:inline"
            >
              Horários
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Container - App bar feel on mobile */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo and Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <img
              src="/logo.svg"
              alt="Logo da Biblioteca"
              className="w-10 h-10 sm:w-16 sm:h-16 object-contain drop-shadow-xs shrink-0 rounded-lg p-0.5 bg-emerald-50/50 border border-emerald-100"
            />
            <div className="min-w-0">
              <div className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-emerald-800 leading-tight">
                Biblioteca Municipal
              </div>
              <h1 className="text-sm sm:text-xl font-bold tracking-tight text-stone-900 leading-tight truncate">
                Prof. Jean Jobis da Silva
              </h1>
              <p className="text-[10px] sm:text-xs text-stone-500 hidden sm:flex items-center gap-1 mt-0.5">
                <BookOpen className="w-3 h-3 text-amber-700 inline shrink-0" />
                <span>Catálogo Oficial Integrado com Libib</span>
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Status Pill */}
            <div className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-xs">
              <span className="relative flex h-2 w-2">
                {catalogState.isSyncing ? (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                )}
              </span>
              <div className="flex flex-col text-left">
                <span className="font-semibold text-stone-800 text-[11px] leading-tight">
                  {catalogState.isSyncing ? "Sincronizando..." : "Libib Conectado"}
                </span>
                <span className="text-stone-500 text-[10px] flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {catalogState.lastSyncTime ? `${formatTime(catalogState.lastSyncTime)}` : "Online"}
                </span>
              </div>
            </div>

            {/* Force Sync button */}
            <button
              id="btn-update-catalog"
              onClick={onRefreshCatalog}
              disabled={catalogState.isSyncing}
              title="Sincronizar com o Libib agora"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                catalogState.isSyncing
                  ? "bg-amber-100 text-amber-900 border border-amber-300 cursor-not-allowed"
                  : "bg-emerald-800 hover:bg-emerald-900 text-white active:scale-95 shadow-sm"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${catalogState.isSyncing ? "animate-spin" : ""}`} />
              <span>{catalogState.isSyncing ? "Atualizando..." : "Atualizar catálogo"}</span>
            </button>

            {/* Info button */}
            <button
              id="btn-integration-info"
              onClick={onOpenIntegrationInfo}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200/80 transition-colors border border-stone-200 cursor-pointer"
              title="Sobre a integração com o Libib"
            >
              <Info className="w-3.5 h-3.5 text-stone-500" />
              <span>Sobre o Libib</span>
            </button>
          </div>

          {/* Mobile Right Controls: Compact Sync button + Mobile Menu Hamburger */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            <button
              onClick={onRefreshCatalog}
              disabled={catalogState.isSyncing}
              aria-label="Atualizar livros do Libib"
              className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                catalogState.isSyncing
                  ? "bg-amber-100 border-amber-300 text-amber-900"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800 active:bg-emerald-100"
              }`}
              title="Atualizar dados do Libib"
            >
              <RefreshCw className={`w-4 h-4 ${catalogState.isSyncing ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Menu principal"
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 cursor-pointer flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-stone-200 px-4 py-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-2 text-xs">
            {/* Status indicator */}
            <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-200">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${catalogState.isSyncing ? "bg-amber-400 animate-ping" : "bg-emerald-500"}`}></span>
                <span className="font-semibold text-stone-800">Status do Libib:</span>
              </div>
              <span className="text-stone-500 font-medium">
                {catalogState.isSyncing ? "Sincronizando..." : `${catalogState.totalBooks} livros online`}
              </span>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAboutLibrary();
                }}
                className="p-2.5 rounded-xl bg-stone-100 active:bg-stone-200 text-stone-800 font-semibold flex items-center justify-center gap-1.5 border border-stone-200 cursor-pointer"
              >
                <Library className="w-3.5 h-3.5 text-stone-600" />
                <span>Sobre a Biblioteca</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenIntegrationInfo();
                }}
                className="p-2.5 rounded-xl bg-stone-100 active:bg-stone-200 text-stone-800 font-semibold flex items-center justify-center gap-1.5 border border-stone-200 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-stone-600" />
                <span>Integração Libib</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
