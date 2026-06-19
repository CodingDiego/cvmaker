import type { PremiumDesign } from "./types";
import { meta as clasicoMeta } from "./clasico-ats/meta";
import { ClasicoAtsPreview } from "./clasico-ats/preview";
import { meta as modernoMeta } from "./moderno-acento/meta";
import { ModernoAcentoPreview } from "./moderno-acento/preview";
import { meta as tecnicoMeta } from "./tecnico-dev/meta";
import { TecnicoDevPreview } from "./tecnico-dev/preview";
import { meta as esencialMeta } from "./esencial/meta";
import { EsencialPreview } from "./esencial/preview";
import { meta as compactoMeta } from "./compacto/meta";
import { CompactoPreview } from "./compacto/preview";
import { meta as acentoLateralMeta } from "./acento-lateral/meta";
import { AcentoLateralPreview } from "./acento-lateral/preview";

/**
 * The free design catalog — metadata + on-screen preview for each. Client-safe:
 * no react-pdf/docx imports, so importing this into the gallery/editor doesn't
 * pull the export renderers into client bundles. Premium designs are merged in
 * by the registry from the `@premium` overlay.
 */
export const FREE_DESIGNS: PremiumDesign[] = [
  { meta: clasicoMeta, Preview: ClasicoAtsPreview },
  { meta: modernoMeta, Preview: ModernoAcentoPreview },
  { meta: tecnicoMeta, Preview: TecnicoDevPreview },
  { meta: esencialMeta, Preview: EsencialPreview },
  { meta: compactoMeta, Preview: CompactoPreview },
  { meta: acentoLateralMeta, Preview: AcentoLateralPreview },
];
