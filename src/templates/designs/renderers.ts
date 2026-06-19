import "server-only";
import type { DesignRenderer } from "./types";
import { renderPdf as clasicoPdf } from "./clasico-ats/pdf";
import { renderDocx as clasicoDocx } from "./clasico-ats/docx";
import { renderPdf as modernoPdf } from "./moderno-acento/pdf";
import { renderDocx as modernoDocx } from "./moderno-acento/docx";
import { renderPdf as tecnicoPdf } from "./tecnico-dev/pdf";
import { renderDocx as tecnicoDocx } from "./tecnico-dev/docx";
import { renderPdf as esencialPdf } from "./esencial/pdf";
import { renderDocx as esencialDocx } from "./esencial/docx";
import { renderPdf as compactoPdf } from "./compacto/pdf";
import { renderDocx as compactoDocx } from "./compacto/docx";
import { renderPdf as acentoLateralPdf } from "./acento-lateral/pdf";
import { renderDocx as acentoLateralDocx } from "./acento-lateral/docx";

/**
 * Server-only export renderers for the free designs. Kept separate from the
 * client-safe `index.ts` so react-pdf and docx never reach client bundles.
 */
export const FREE_RENDERERS: DesignRenderer[] = [
  { id: "clasico-ats", renderPdf: clasicoPdf, renderDocx: clasicoDocx },
  { id: "moderno-acento", renderPdf: modernoPdf, renderDocx: modernoDocx },
  { id: "tecnico-dev", renderPdf: tecnicoPdf, renderDocx: tecnicoDocx },
  { id: "esencial", renderPdf: esencialPdf, renderDocx: esencialDocx },
  { id: "compacto", renderPdf: compactoPdf, renderDocx: compactoDocx },
  { id: "acento-lateral", renderPdf: acentoLateralPdf, renderDocx: acentoLateralDocx },
];
