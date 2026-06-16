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
