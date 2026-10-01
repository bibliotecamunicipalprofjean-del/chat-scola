import React from "react";
import {
  Accessibility,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  SunMoon,
  Type,
  Eye,
  Volume2,
  Square,
  Sparkles,
  X
} from "lucide-react";
import { AccessibilitySettings } from "../accessibilityTypes";

interface AccessibilityBarProps {
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  onReset: () => void;
  isSpeaking: boolean;
  onStopSpeech: () => void;
}

export const AccessibilityBar: React.FC<AccessibilityBarProps> = ({
  settings,
  onUpdateSettings,
  onReset,
  isSpeaking,
  onStopSpeech
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Close with Esc key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleFontZoom = (delta: number) => {
    const nextLevel = Math.max(-1, Math.min(2, settings.fontSizeLevel + delta));
    onUpdateSettings({ fontSizeLevel: nextLevel });
  };

  const getFontSizeLabel = () => {
    switch (settings.fontSizeLevel) {
      case -1:
        return "85%";
      case 1:
        return "115%";
      case 2:
        return "130%";
      default:
        return "100%";
    }
  };

  return (
    <nav
      aria-label="Barra de Acessibilidade"
      className="bg-emerald-950 text-emerald-50 border-b border-emerald-900 py-1.5 px-3 sm:px-4 text-xs select-none sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left items: skip link + quick font & contrast */}
        <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-amber-400 focus:text-stone-900 focus:font-bold focus:rounded-md shadow-lg"
          >
            Pular para conteúdo
          </a>

          {/* Icon label */}
          <div className="flex items-center gap-1 font-semibold text-emerald-300 shrink-0">
            <Accessibility className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden md:inline">Acessibilidade:</span>
          </div>

          {/* Quick Font Size Controls */}
          <div className="flex items-center bg-emerald-900/70 rounded-lg p-0.5 border border-emerald-800 shrink-0">
            <button
              onClick={() => handleFontZoom(-1)}
              disabled={settings.fontSizeLevel <= -1}
              aria-label="Diminuir tamanho da fonte"
              className="px-2 py-1 rounded hover:bg-emerald-800 text-emerald-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-0.5"
              title="Diminuir tamanho do texto"
            >
              <ZoomOut className="w-3 h-3" />
              <span className="font-bold text-[11px]">A-</span>
            </button>

            <span
              className="text-[10px] px-1 text-emerald-300 font-mono"
              aria-live="polite"
            >
              {getFontSizeLabel()}
            </span>

            <button
              onClick={() => handleFontZoom(1)}
              disabled={settings.fontSizeLevel >= 2}
              aria-label="Aumentar tamanho da fonte"
              className="px-2 py-1 rounded hover:bg-emerald-800 text-emerald-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-0.5"
              title="Aumentar tamanho do texto"
            >
              <span className="font-bold text-[11px]">A+</span>
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          {/* Quick High Contrast Toggle */}
          <button
            onClick={() => onUpdateSettings({ highContrast: !settings.highContrast })}
            aria-pressed={settings.highContrast}
            aria-label="Alternar alto contraste"
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              settings.highContrast
                ? "bg-amber-400 text-stone-950 font-bold"
                : "bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border border-emerald-800"
            }`}
            title="Alto contraste para baixa visão"
          >
            <SunMoon className="w-3.5 h-3.5" />
            <span>Contraste</span>
          </button>
        </div>

        {/* Right side: Speech controller & More modal */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Active speech indicator */}
          {isSpeaking && (
            <button
              onClick={onStopSpeech}
              aria-label="Interromper leitura por voz"
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-2 py-1 rounded-lg text-[11px] flex items-center gap-1 animate-pulse cursor-pointer shadow-xs"
              title="Clique para parar a leitura por voz"
            >
              <Volume2 className="w-3 h-3" />
              <span>Parar</span>
              <Square className="w-2 h-2 fill-current" />
            </button>
          )}

          {/* More options button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label="Abrir opções de acessibilidade"
            className="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 border border-emerald-700 cursor-pointer"
          >
            <Accessibility className="w-3 h-3 text-amber-300" />
            <span className="hidden xs:inline">Mais</span>
          </button>

          {(settings.fontSizeLevel !== 0 ||
            settings.highContrast ||
            settings.dyslexicFont ||
            settings.readingGuide ||
            settings.reducedMotion) && (
            <button
              onClick={onReset}
              aria-label="Restaurar padrões"
              className="text-emerald-300 hover:text-white text-[11px] underline cursor-pointer p-0.5"
              title="Restaurar ao padrão"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Accessibility Sheet */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-start justify-center sm:justify-end p-0 sm:p-4 sm:pt-16 bg-stone-950/60 backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-stone-900 text-stone-100 border border-stone-700 rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 w-full sm:max-w-sm space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Opções detalhadas de acessibilidade"
          >
            {/* Mobile sheet pull bar indicator */}
            <div className="w-12 h-1 bg-stone-700 rounded-full mx-auto sm:hidden mb-2"></div>

            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Accessibility className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Opções de Acessibilidade</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Fechar painel"
                className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Dyslexia friendly font */}
              <label className="flex items-center justify-between p-3 bg-stone-800/80 rounded-xl cursor-pointer hover:bg-stone-800">
                <div className="pr-3">
                  <div className="font-semibold text-stone-100 flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-emerald-400" />
                    <span>Fonte Legível (Dislexia)</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Facilita a distinção das letras e o ritmo de leitura.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.dyslexicFont}
                  onChange={(e) => onUpdateSettings({ dyslexicFont: e.target.checked })}
                  className="w-5 h-5 text-emerald-500 rounded cursor-pointer accent-emerald-500"
                />
              </label>

              {/* High Contrast */}
              <label className="flex items-center justify-between p-3 bg-stone-800/80 rounded-xl cursor-pointer hover:bg-stone-800">
                <div className="pr-3">
                  <div className="font-semibold text-stone-100 flex items-center gap-1.5">
                    <SunMoon className="w-4 h-4 text-amber-400" />
                    <span>Alto Contraste</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Fundo preto e letras brancas para baixa visão.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => onUpdateSettings({ highContrast: e.target.checked })}
                  className="w-5 h-5 text-emerald-500 rounded cursor-pointer accent-emerald-500"
                />
              </label>

              {/* Reading Guide Ruler */}
              <label className="flex items-center justify-between p-3 bg-stone-800/80 rounded-xl cursor-pointer hover:bg-stone-800">
                <div className="pr-3">
                  <div className="font-semibold text-stone-100 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-sky-400" />
                    <span>Régua de Leitura</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Linha guia que acompanha o toque ou cursor na tela.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.readingGuide}
                  onChange={(e) => onUpdateSettings({ readingGuide: e.target.checked })}
                  className="w-5 h-5 text-emerald-500 rounded cursor-pointer accent-emerald-500"
                />
              </label>

              {/* Reduced Motion */}
              <label className="flex items-center justify-between p-3 bg-stone-800/80 rounded-xl cursor-pointer hover:bg-stone-800">
                <div className="pr-3">
                  <div className="font-semibold text-stone-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Reduzir Efeitos</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Desativa animações e transições na tela.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => onUpdateSettings({ reducedMotion: e.target.checked })}
                  className="w-5 h-5 text-emerald-500 rounded cursor-pointer accent-emerald-500"
                />
              </label>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-800">
              <button
                onClick={onReset}
                className="text-xs text-stone-400 hover:text-white underline cursor-pointer"
              >
                Padrão
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
