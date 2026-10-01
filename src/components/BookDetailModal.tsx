import React, { useState, useEffect } from "react";
import { X, ExternalLink, BookOpen, Copy, Check, Library, Volume2, Square } from "lucide-react";
import { LibibBook } from "../types";

interface BookDetailModalProps {
  book: LibibBook | null;
  onClose: () => void;
  isSpeaking: boolean;
  onSpeakText: (text: string) => void;
  onStopSpeech: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  isSpeaking,
  onSpeakText,
  onStopSpeech
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Close modal when user presses Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onStopSpeech();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onStopSpeech]);

  // Prevent background body scroll when modal is open on mobile
  useEffect(() => {
    if (book) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [book]);

  if (!book) return null;

  const handleCopyCitation = () => {
    const citation = `${book.author}. ${book.title}. Acervo: Biblioteca Municipal Professor Jean Jobis da Silva (Coleção: ${book.collectionName}).`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToggleVoice = () => {
    if (isSpeaking) {
      onStopSpeech();
    } else {
      const textToRead = `Livro: ${book.title}. Autor: ${book.author}. Coleção: ${book.collectionName}. Identificador do Libib: número ${book.id}. Disponível para consulta e empréstimo na Biblioteca Municipal Professor Jean Jobis da Silva.`;
      onSpeakText(textToRead);
    }
  };

  const handleCloseModal = () => {
    onStopSpeech();
    onClose();
  };

  const hasCover = book.coverUrl && !imgError && !book.coverUrl.includes("missing.png");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-book-title"
      onClick={handleCloseModal}
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 md:p-6"
    >
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header Bar with always-visible Close Button */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6 sm:py-3.5 border-b border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 shrink-0 truncate max-w-[160px] sm:max-w-xs">
              {book.collectionName}
            </span>
            <span className="text-xs text-stone-400 font-mono hidden sm:inline">
              ID #{book.id}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Read Aloud Accessible Button */}
            <button
              onClick={handleToggleVoice}
              aria-label={isSpeaking ? "Interromper leitura em voz alta" : "Ouvir informações do livro em voz alta"}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                isSpeaking
                  ? "bg-amber-500 text-stone-950 animate-pulse"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300"
              }`}
              title="Recurso de acessibilidade para leitura por áudio"
            >
              {isSpeaking ? (
                <>
                  <Square className="w-3 h-3 fill-current" />
                  <span>Parar Voz</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden xs:inline">Ouvir</span>
                </>
              )}
            </button>

            {/* Mobile-Friendly High-Contrast Close Button */}
            <button
              onClick={handleCloseModal}
              aria-label="Fechar janela de detalhes do livro"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-700 hover:text-stone-950 transition-colors cursor-pointer flex items-center gap-1 border border-stone-200"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5 text-stone-800 stroke-[2.5]" />
              <span className="text-xs font-bold hidden sm:inline">Fechar</span>
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-center sm:items-start">
            {/* Book Cover / Jacket */}
            <div className="w-36 xs:w-44 sm:w-48 shrink-0 mx-auto sm:mx-0">
              <div className="aspect-3/4 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-md flex items-center justify-center">
                {hasCover ? (
                  <img
                    src={book.coverUrl!}
                    alt={`Capa do livro ${book.title}`}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full p-4 flex flex-col justify-between bg-stone-900 text-stone-100">
                    <BookOpen className="w-8 h-8 text-amber-400/80" />
                    <div>
                      <p className="font-display font-bold text-sm leading-snug line-clamp-4">
                        {book.title}
                      </p>
                      <p className="text-xs text-stone-400 mt-2">{book.author}</p>
                    </div>
                    <span className="text-[10px] text-stone-500 uppercase">{book.collectionName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Book Information */}
            <div className="flex-1 w-full text-left">
              <div className="text-[11px] font-bold tracking-wider uppercase text-emerald-800 mb-1">
                Informações Bibliográficas
              </div>
              <h2
                id="modal-book-title"
                className="font-display text-lg sm:text-2xl font-bold text-stone-900 leading-snug break-words"
              >
                {book.title}
              </h2>
              <p className="text-stone-700 font-medium text-sm sm:text-base mt-2">
                <span className="text-stone-400 text-xs uppercase tracking-wider block font-normal">
                  Autor(es):
                </span>
                {book.author}
              </p>

              {/* Technical / Libib Metadata */}
              <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Origem do Cadastro:</span>
                  <span className="font-semibold text-stone-800 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    Libib Oficial (Público)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Identificador Libib:</span>
                  <span className="font-mono text-stone-700 bg-stone-200/60 px-1.5 py-0.5 rounded text-[11px]">
                    #{book.id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Localização física:</span>
                  <span className="text-stone-800 font-medium">Seção {book.collectionName}</span>
                </div>
              </div>

              {/* Library Notice */}
              <div className="mt-4 p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
                <Library className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  Disponível para consulta e empréstimo na <strong>Biblioteca Municipal Professor Jean Jobis da Silva</strong>. Procure a equipe com o título ou ID do exemplar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Sticky Bottom Bar with Action buttons and bottom Close button */}
        <div className="sticky bottom-0 bg-stone-50 border-t border-stone-200 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <a
              href={book.libibUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white transition-colors cursor-pointer focus:ring-2 focus:ring-amber-400"
            >
              <span>Ver no Libib</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleCopyCitation}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-stone-100 text-stone-700 transition-colors border border-stone-200 cursor-pointer focus:ring-2 focus:ring-amber-400"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>Copiar Citação</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleCloseModal}
            className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold bg-stone-200 hover:bg-stone-300 text-stone-800 transition-colors cursor-pointer text-center"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
