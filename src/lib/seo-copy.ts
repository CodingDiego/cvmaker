import type { Locale } from "@/i18n/config";

/**
 * Per-locale SEO copy (title + description) for every indexable route, kept
 * apart from the UI dictionaries so search snippets can be tuned without
 * touching product strings.
 *
 * Tone derived from the live SERP for "cv maker free" and variants: lead with
 * the high-intent keyword ("Free CV Maker" / "CV gratis" / "Currículo grátis"),
 * then the differentiators that actually convert — ATS-friendly, modern
 * templates, live preview, PDF/DOCX export, minutes, no watermark. Titles stay
 * under ~60 chars (inner pages get " · CVMaker" appended by the layout
 * template); descriptions under ~155.
 */

export type SeoPageKey = "home" | "templates" | "register" | "privacy" | "terms";

export interface SeoCopy {
  title: string;
  description: string;
}

export const seoCopy: Record<SeoPageKey, Record<Locale, SeoCopy>> = {
  home: {
    en: {
      title: "Free CV Maker – ATS-Friendly Resume Builder | CVMaker",
      description:
        "Create a professional, ATS-friendly CV for free. Pick a modern template, edit with live preview, and download as PDF or DOCX in minutes — no watermarks.",
    },
    es: {
      title: "CV Maker Gratis – Crea tu Currículum ATS | CVMaker",
      description:
        "Crea un currículum profesional y compatible con ATS gratis. Elige una plantilla moderna, edita con vista previa y descarga en PDF o DOCX en minutos.",
    },
    pt: {
      title: "Criar Currículo Grátis – CV para ATS | CVMaker",
      description:
        "Crie um currículo profissional e compatível com ATS de graça. Escolha um modelo moderno, edite com pré-visualização e baixe em PDF ou DOCX em minutos.",
    },
  },
  templates: {
    en: {
      title: "Free CV Templates – ATS-Friendly Designs",
      description:
        "Browse free, ATS-friendly CV templates and Pro designs. Start from a professional layout, customize it, and export to PDF or DOCX in minutes.",
    },
    es: {
      title: "Plantillas de CV Gratis – Compatibles con ATS",
      description:
        "Explora plantillas de CV gratis y diseños Pro compatibles con ATS. Empieza con un diseño profesional, personalízalo y expórtalo a PDF o DOCX.",
    },
    pt: {
      title: "Modelos de Currículo Grátis – Para ATS",
      description:
        "Veja modelos de currículo grátis e designs Pro compatíveis com ATS. Comece com um layout profissional, personalize e exporte para PDF ou DOCX.",
    },
  },
  register: {
    en: {
      title: "Create Your Free CV Account",
      description:
        "Sign up free to build, save, and download your ATS-friendly CV. No credit card, no watermarks — start in minutes.",
    },
    es: {
      title: "Crea tu Cuenta de CV Gratis",
      description:
        "Regístrate gratis para crear, guardar y descargar tu CV compatible con ATS. Sin tarjeta ni marcas de agua, en minutos.",
    },
    pt: {
      title: "Crie sua Conta de Currículo Grátis",
      description:
        "Cadastre-se grátis para criar, salvar e baixar seu currículo compatível com ATS. Sem cartão nem marca d'água.",
    },
  },
  privacy: {
    en: {
      title: "Privacy Policy",
      description:
        "How CVMaker collects, uses, stores, and protects your account and resume data.",
    },
    es: {
      title: "Política de Privacidad",
      description:
        "Cómo CVMaker recopila, usa, almacena y protege los datos de tu cuenta y currículum.",
    },
    pt: {
      title: "Política de Privacidade",
      description:
        "Como o CVMaker coleta, usa, armazena e protege os dados da sua conta e currículo.",
    },
  },
  terms: {
    en: {
      title: "Terms of Service",
      description: "The terms governing your access to and use of CVMaker.",
    },
    es: {
      title: "Términos del Servicio",
      description: "Los términos que rigen el acceso y uso de CVMaker.",
    },
    pt: {
      title: "Termos de Serviço",
      description: "Os termos que regem o acesso e uso do CVMaker.",
    },
  },
};

/** Localized heading for the home FAQ section. */
export const faqHeading: Record<Locale, string> = {
  en: "Frequently asked questions",
  es: "Preguntas frecuentes",
  pt: "Perguntas frequentes",
};

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * Home FAQ — one source for both the visible accordion and the `FAQPage`
 * JSON-LD (Google requires the answers to be visible on the page). Questions
 * mirror the high-intent "is it free / ATS / PDF / watermark" queries that
 * surface in the "People also ask" box for "cv maker free".
 */
export const faqCopy: Record<Locale, FaqItem[]> = {
  en: [
    {
      q: "Is CVMaker free?",
      a: "Yes. You can build, edit and download a complete CV for free — no watermark and no credit card. A Pro plan adds extra premium designs.",
    },
    {
      q: "Are the CVs ATS-friendly?",
      a: "Yes. Every template is structured so applicant tracking systems can read your name, experience, skills and education correctly.",
    },
    {
      q: "Can I download my CV as PDF or Word (DOCX)?",
      a: "Yes. Export your finished CV to PDF or DOCX in one click, as many times as you need.",
    },
    {
      q: "Do I need an account to make a CV?",
      a: "You can start from any template right away. A free account lets you save your draft, come back to edit it, and export.",
    },
    {
      q: "Can I change templates without losing my content?",
      a: "Yes. Your CV is one reusable draft — switch designs freely and your content stays exactly as you wrote it.",
    },
    {
      q: "Does the downloaded CV have a watermark?",
      a: "No. Every download is clean, with no watermark or branding — on both the free and Pro plans.",
    },
  ],
  es: [
    {
      q: "¿CVMaker es gratis?",
      a: "Sí. Podés crear, editar y descargar un CV completo gratis, sin marca de agua ni tarjeta de crédito. El plan Pro suma diseños premium extra.",
    },
    {
      q: "¿Los CV son compatibles con ATS?",
      a: "Sí. Cada plantilla está estructurada para que los sistemas ATS lean correctamente tu nombre, experiencia, habilidades y formación.",
    },
    {
      q: "¿Puedo descargar mi CV en PDF o Word (DOCX)?",
      a: "Sí. Exportá tu CV terminado a PDF o DOCX en un clic, todas las veces que necesites.",
    },
    {
      q: "¿Necesito una cuenta para hacer un CV?",
      a: "Podés empezar desde cualquier plantilla al instante. Una cuenta gratis te deja guardar el borrador, volver a editarlo y exportarlo.",
    },
    {
      q: "¿Puedo cambiar de plantilla sin perder mi contenido?",
      a: "Sí. Tu CV es un único borrador reutilizable: cambiá de diseño libremente y tu contenido queda tal como lo escribiste.",
    },
    {
      q: "¿El CV descargado tiene marca de agua?",
      a: "No. Cada descarga es limpia, sin marca de agua ni branding, tanto en el plan gratis como en Pro.",
    },
  ],
  pt: [
    {
      q: "O CVMaker é grátis?",
      a: "Sim. Você pode criar, editar e baixar um currículo completo de graça, sem marca d'água e sem cartão de crédito. O plano Pro adiciona designs premium extras.",
    },
    {
      q: "Os currículos são compatíveis com ATS?",
      a: "Sim. Cada modelo é estruturado para que os sistemas ATS leiam corretamente seu nome, experiência, habilidades e formação.",
    },
    {
      q: "Posso baixar meu currículo em PDF ou Word (DOCX)?",
      a: "Sim. Exporte seu currículo pronto para PDF ou DOCX em um clique, quantas vezes precisar.",
    },
    {
      q: "Preciso de uma conta para fazer um currículo?",
      a: "Você pode começar por qualquer modelo na hora. Uma conta grátis permite salvar o rascunho, voltar para editar e exportar.",
    },
    {
      q: "Posso trocar de modelo sem perder meu conteúdo?",
      a: "Sim. Seu currículo é um único rascunho reutilizável: troque de design livremente e seu conteúdo permanece como você escreveu.",
    },
    {
      q: "O currículo baixado tem marca d'água?",
      a: "Não. Cada download é limpo, sem marca d'água nem branding, tanto no plano grátis quanto no Pro.",
    },
  ],
};
