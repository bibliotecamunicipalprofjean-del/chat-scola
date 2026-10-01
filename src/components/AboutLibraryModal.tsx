import React from "react";
import { X, Mail, MapPin, Clock, BookMarked, ShieldCheck, Heart } from "lucide-react";
import { getCreatorPhoto, subscribeCreatorPhoto } from "../utils/photoManager";

interface AboutLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreatorTribute?: () => void;
  creatorPhoto?: string;
}

export const AboutLibraryModal: React.FC<AboutLibraryModalProps> = ({
  isOpen,
  onClose,
  onOpenCreatorTribute,
  creatorPhoto
}) => {
  const [imgSrc, setImgSrc] = React.useState(() => creatorPhoto || getCreatorPhoto());

  React.useEffect(() => {
    if (creatorPhoto) {
      setImgSrc(creatorPhoto);
    } else {
      setImgSrc(getCreatorPhoto());
    }
  }, [creatorPhoto]);

  React.useEffect(() => {
    const unsubscribe = subscribeCreatorPhoto((newUrl) => {
      setImgSrc(newUrl);
    });
    return unsubscribe;
  }, []);
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
        className="relative bg-white rounded-2xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with logo */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="Logo da Biblioteca"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-stone-900 leading-tight">
                Biblioteca Municipal Prof. Jean Jobis da Silva
              </h2>
              <p className="text-xs text-stone-500">
                Escola Básica Municipal • Incentivo à Leitura e ao Saber
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

        {/* Content */}
        <div className="overflow-y-auto py-4 space-y-4 text-xs sm:text-sm text-stone-700">
          <p className="leading-relaxed">
            A <strong>Biblioteca Municipal Professor Jean Jobis da Silva</strong> é um polo
            educativo e cultural dedicado a fomentar o gosto pela leitura em estudantes, professores
            e em toda a comunidade escolar. Nosso acervo é continuamente renovado e organizado
            através da plataforma Libib.
          </p>

          {/* Creator Profile Card */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-stone-50 rounded-xl border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 shadow-2xs">
            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-amber-400 shrink-0 bg-stone-800 shadow-xs">
              <img
                src={imgSrc}
                alt="Prof. Fabio Gardioli de Carvalho"
                onError={() => setImgSrc("/fabio_gardioli.jpg")}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-md">
                  Criação da Logo & Acessibilidade
                </span>
              </div>
              <h3 className="font-bold text-stone-900 text-sm mt-0.5">
                Prof. Fabio Gardioli de Carvalho
              </h3>
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                Professor da Rede Municipal de Penha. Criação da logo da biblioteca e desta plataforma de acessibilidade para facilitar de forma inclusiva a vida de todos que amam a leitura e que se interessam por este caminho que aproxima a todos de forma especial. Agradecimento especial à Diretora Valdinéia Bortolato Germano.
              </p>
              {onOpenCreatorTribute && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCreatorTribute();
                  }}
                  className="mt-2 text-xs font-bold text-amber-900 hover:text-amber-800 underline inline-flex items-center gap-1 cursor-pointer"
                >
                  Conhecer qualificações, registros (FENAJ, CRA) e projeto →
                </button>
              )}
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs text-stone-900">Horário de Atendimento</strong>
                <span className="text-xs text-stone-600">
                  Segunda a Sexta-feira
                  <br />
                  07h30 às 11h45 | 13h15 às 17h15
                </span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs text-stone-900">Contato Oficial</strong>
                <a
                  href="mailto:bibliotecamunicipalprofjean@gmail.com"
                  className="text-xs text-emerald-800 font-medium hover:underline break-all"
                >
                  bibliotecamunicipalprofjean@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Loan rules */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wider">
              <BookMarked className="w-4 h-4 text-emerald-700" />
              <span>Orientações para Consulta e Empréstimo</span>
            </div>
            <ul className="text-xs text-emerald-900 space-y-1 pl-4 list-disc">
              <li>
                Alunos, educadores e comunidade têm livre acesso ao acervo para leitura no local.
              </li>
              <li>
                O empréstimo domiciliar é realizado mediante cadastro do leitor na biblioteca.
              </li>
              <li>
                Ao buscar um exemplar, anote o título ou o <strong>ID do Libib</strong> indicado no catálogo online.
              </li>
              <li>
                Cuide com carinho de cada livro para que outros leitores também possam desfrutar da obra.
              </li>
            </ul>
          </div>

          {/* Accessibility features info */}
          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-1.5 text-xs text-amber-950">
            <strong className="block text-amber-900 font-bold">
              ♿ Recursos de Acessibilidade Cidadã:
            </strong>
            <p>
              Este portal dispõe de barra de acessibilidade com: zoom e ajuste do tamanho das fontes (A- / A+), modo de alto contraste para baixa visão, tipografia especializada para dislexia, régua visual que acompanha o mouse e leitura por voz (síntese de áudio) nos detalhes dos livros.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
