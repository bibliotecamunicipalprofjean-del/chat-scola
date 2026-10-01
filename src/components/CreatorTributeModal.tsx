import React from "react";
import {
  X,
  Award,
  BookOpen,
  GraduationCap,
  Heart,
  CheckCircle2,
  Building2,
  Sparkles,
  Quote,
  Share2,
  Check,
  Camera,
  Upload
} from "lucide-react";
import { getCreatorPhoto, uploadCreatorPhoto, subscribeCreatorPhoto } from "../utils/photoManager";

interface CreatorTributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorPhoto?: string;
}

export const CreatorTributeModal: React.FC<CreatorTributeModalProps> = ({
  isOpen,
  onClose,
  creatorPhoto
}) => {
  const [copied, setCopied] = React.useState(false);
  const [imgSrc, setImgSrc] = React.useState(() => creatorPhoto || getCreatorPhoto());
  const [uploadFeedback, setUploadFeedback] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadFeedback("Atualizando foto...");
      const newUrl = await uploadCreatorPhoto(file);
      setImgSrc(newUrl);
      setUploadFeedback("Foto fabio.jpg atualizada com sucesso!");
      setTimeout(() => setUploadFeedback(null), 4000);
    } catch {
      setUploadFeedback("Erro ao carregar a foto.");
      setTimeout(() => setUploadFeedback(null), 3000);
    }
  };

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

  const handleShare = () => {
    const text = "Conheça a criação da logo e desta plataforma de acessibilidade da Biblioteca Municipal Professor Jean Jobis da Silva por Fabio Gardioli de Carvalho: https://ais-pre-oahrv3m25ieg7y4ak2ddfj-284586336772.us-west1.run.app";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tribute-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
    >
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-amber-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-amber-950 text-white p-5 sm:p-6 relative overflow-hidden shrink-0">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Criador da Logo & Plataforma
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label="Fechar"
              className="p-1.5 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Header in Banner */}
          <div className="mt-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left relative z-10">
            <div className="relative shrink-0 flex flex-col items-center">
              <div 
                onClick={() => fileInputRef.current?.click()}
                title="Clique para selecionar a foto oficial fabio.jpg do seu computador"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl bg-stone-800 relative group cursor-pointer"
              >
                <img
                  src={imgSrc}
                  alt="Prof. Fabio Gardioli de Carvalho"
                  onError={() => setImgSrc("/fabio_gardioli.jpg")}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1 text-[10px] font-bold text-center">
                  <Camera className="w-5 h-5 mb-0.5 text-amber-300" />
                  <span>Trocar Foto</span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-[10px] text-amber-200 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-md border border-amber-400/40 flex items-center gap-1 cursor-pointer transition-colors"
                title="Carregar foto oficial fabio.jpg"
              >
                <Upload className="w-2.5 h-2.5" />
                <span>Foto fabio.jpg</span>
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <h2 id="tribute-title" className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                Fabio Gardioli de Carvalho
              </h2>
              <p className="text-amber-300 text-xs sm:text-sm font-medium mt-0.5">
                Professor da Rede Municipal de Ensino de Penha • SC
              </p>
              <p className="text-stone-300 text-xs mt-1.5 leading-relaxed font-light max-w-lg">
                Criação da logo da biblioteca e desta plataforma de acessibilidade para facilitar de forma inclusiva a vida de todos que amam a leitura e que se interessam por este caminho que aproxima a todos de forma especial.
              </p>

              {uploadFeedback && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-lg text-xs font-semibold animate-in fade-in duration-200">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{uploadFeedback}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 text-stone-700 text-xs sm:text-sm leading-relaxed">
          {/* Credentials Badges */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2.5">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              <span>Qualificações & Registros Profissionais</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-semibold text-[11px] border border-emerald-200">
                Jornalista FENAJ 007408
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-900 font-semibold text-[11px] border border-sky-200">
                Administrador CRA 32116
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 font-semibold text-[11px] border border-amber-200">
                Perito
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-950 font-semibold text-[11px] border border-purple-200">
                Especialista em RH
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-200/80 text-stone-800 font-medium text-[11px]">
                Físico
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-200/80 text-stone-800 font-medium text-[11px]">
                Filósofo
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-200/80 text-stone-800 font-medium text-[11px]">
                Teólogo
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-200/80 text-stone-800 font-medium text-[11px]">
                Pedagogo
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-200/80 text-stone-800 font-medium text-[11px]">
                Psicanalista
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-200/80 text-stone-800 font-medium text-[11px]">
                Psicopedagogo
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-200/80 text-stone-800 font-medium text-[11px]">
                Cientista da Religião
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-200/80 text-stone-800 font-medium text-[11px]">
                Bacharel em Contabilidade
              </span>
            </div>
          </div>

          {/* Core Mission & Story */}
          <div className="space-y-3.5">
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex items-start gap-3">
              <Quote className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <p className="italic text-stone-800 leading-relaxed font-serif text-sm">
                &ldquo;Criação da logo da biblioteca e desta plataforma de acessibilidade para facilitar de forma inclusiva a vida de todos que amam a leitura e que se interessam por este caminho que aproxima a todos de forma especial.&rdquo;
              </p>
            </div>

            <div className="space-y-3 pl-1">
              <p>
                Como <strong>criador da logo da biblioteca e desta plataforma de acessibilidade</strong>, o professor Fabio planejou cada aspecto visual e funcional para facilitar de forma inclusiva a vida de todos que amam a leitura: paleta de cores de alto contraste, leitor de voz integrado para estudantes com baixa visão ou em fase de alfabetização, e navegação simplificada que aproxima a todos de forma especial.
              </p>

              <p>
                A concepção deste portal digital inclusivo permite que os estudantes e toda a comunidade escolar consultem o acervo com autonomia e facilidade, fortalecendo o gosto pelos livros e pela cultura.
              </p>
            </div>
          </div>

          {/* Acknowledgement to Leadership */}
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-start gap-3 text-emerald-950">
            <Building2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-emerald-900 font-bold text-xs uppercase tracking-wide">
                Agradecimento Especial à Gestão Escolar
              </strong>
              <p className="mt-1 text-emerald-900 text-xs sm:text-sm leading-relaxed">
                O criador expressa sua profunda gratidão à <strong>Diretora Valdinéia Bortolato Germano</strong> pela confiança irrestrita e pelo apoio institucional concedido para a concepção e execução desta plataforma inclusiva em prol dos estudantes da E.B.M. João Antônio Pinto.
              </p>
            </div>
          </div>

          {/* Key Achievements Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900 font-semibold text-xs">Incentivo Tecnológico</strong>
                <span className="text-[11px] text-stone-500">Uso estratégico da internet para tornar a leitura irresistível aos alunos.</span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900 font-semibold text-xs">Identidade Visual Própria</strong>
                <span className="text-[11px] text-stone-500">Design completo e harmonização estética criados de forma autoral.</span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900 font-semibold text-xs">Acessibilidade Total</strong>
                <span className="text-[11px] text-stone-500">Recursos de voz, alto contraste e fontes adaptadas para inclusão cidadã.</span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900 font-semibold text-xs">Legado Educacional</strong>
                <span className="text-[11px] text-stone-500">Ambiente acolhedor e vivo para a E.B.M. João Antônio Pinto em Penha/SC.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Link Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-stone-500" />
                <span>Compartilhar Informações</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white transition-colors cursor-pointer shadow-xs"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
