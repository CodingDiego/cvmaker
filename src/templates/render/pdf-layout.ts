import type { ResumeData } from "@/lib/cv/types";

type PhotoPosition = ResumeData["header"]["photoPosition"];

export type PdfStyleValue = string | number;
export type PdfStyle = Record<string, PdfStyleValue>;

export function pdfHeaderTextStyle({
  hasPhoto,
  photoPosition,
}: {
  hasPhoto: boolean;
  photoPosition: PhotoPosition;
}): PdfStyle {
  if (hasPhoto && photoPosition === "center") {
    return {
      marginTop: 8,
      width: "100%",
    };
  }

  return {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    ...(hasPhoto && photoPosition === "left" ? { marginLeft: 12 } : {}),
    ...(hasPhoto && photoPosition === "right" ? { marginRight: 12 } : {}),
  };
}

export function pdfHeaderTypography() {
  return {
    nameLineHeight: 1.2,
    roleLineHeight: 1.25,
    roleMarginTop: 4,
    contactMarginTop: 8,
  } as const;
}
