import React from "react";
import { X, CheckCircle2, AlertCircle, Database, RefreshCw, ExternalLink, ShieldCheck } from "lucide-react";
import { CatalogState } from "../types";

interface IntegrationInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogState: CatalogState;
  onForceSync: () => void;
}

export const IntegrationInfoModal: React.FC<IntegrationInfoModalProps> = ({
  isOpen,
  onClose,
  catalogState,
  onForceSync
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-stone-900 leading-tight">
                Integração Direta com o Libib
              </h2>
              <p className="text-xs text-stone-500">
                Como o catálogo do site é sincronizado com a sua conta oficial
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-4 text-xs sm:text-sm text-stone-700">
          {/* Status Box */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-950">
                Fonte Única e Oficial: Libib (bibliotecaebmjjs)
              </p>
              <p className="text-emerald-800 text-xs mt-0.5">
                Não existe segundo cadastro manual. Todos os {catalogState.totalBooks} livros
                exibidos são lidos automaticamente do seu catálogo público oficial no Libib.
              </p>
            </div>
          </div>

          {/* How it works pipeline */}
          <div>
            <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2">
              Fluxo de Dados Automatizado:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80">
                <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center mx-auto mb-1.5">
                  1
                </div>
                <strong className="block text-xs text-stone-900">Você cadastra no Libib</strong>
                <span className="text-[11px] text-stone-500">
                  Adicione, altere ou remova livros direto na sua conta do Libib.
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80">
                <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center mx-auto mb-1.5">
                  2
                </div>
                <strong className="block text-xs text-stone-900">Servidor Consulta</strong>
                <span className="text-[11px] text-stone-500">
                  Nosso backend em Node.js consulta o catálogo público sem bloqueios de CORS.
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80">
                <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center mx-auto mb-1.5">
                  3
                </div>
                <strong className="block text-xs text-stone-900">Atualização Automática</strong>
                <span className="text-[11px] text-stone-500">
                  O site reflete a mudança automaticamente ou via botão imediato.
                </span>
              </div>
            </div>
          </div>

          {/* Technical Diagnostics */}
          <div>
            <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2">
              Dados Públicos Disponibilizados pelo Libib:
            </h3>
            <ul className="space-y-1.5 bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
              <li className="flex items-center gap-2 text-stone-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <strong>Capa do livro:</strong> Carregada do CDN CloudFront oficial do Libib quando disponível.
              </li>
              <li className="flex items-center gap-2 text-stone-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <strong>Título da obra:</strong> Texto exato cadastrado no Libib.
              </li>
              <li className="flex items-center gap-2 text-stone-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <strong>Autor(es):</strong> Nome(s) dos autores catalogados.
              </li>
              <li className="flex items-center gap-2 text-stone-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <strong>Coleção / Categoria:</strong> Mapeamento dinâmico das coleções ativas ({catalogState.collections.length} detectadas).
              </li>
              <li className="flex items-center gap-2 text-stone-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <strong>ID do exemplar:</strong> Identificador numérico do item no banco do Libib.
              </li>
            </ul>
          </div>

          {/* Transparency about Libib Limitations */}
          <div className="p-3.5 bg-stone-100 rounded-xl border border-stone-300/80 flex items-start gap-2.5 text-xs text-stone-700">
            <AlertCircle className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-stone-900 font-semibold mb-0.5">
                Relatório Técnico sobre Limitações do Libib:
              </strong>
              <p>
                Como sua conta do Libib é Standard (sem o plano pago Libib Pro), o Libib não fornece uma chave REST API oficial. O site resolve isso consultando as páginas e endpoints públicos da sua biblioteca. Detalhes secundários (como sinopse estendida ou ISBN) não são expostos na exibição pública básica pelo Libib, mas cada livro possui um link direto que abre a página correspondente no Libib.
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <a
            href={catalogState.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium"
          >
            <span>Abrir catálogo original no Libib</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onForceSync();
                onClose();
              }}
              disabled={catalogState.isSyncing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${catalogState.isSyncing ? "animate-spin" : ""}`} />
              <span>Forçar Sincronização Agora</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
