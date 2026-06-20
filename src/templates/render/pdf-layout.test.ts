import { describe, expect, test } from "bun:test";
import { pdfHeaderStyles, pdfHeaderTextStyle, pdfHeaderTypography } from "./pdf-layout";

describe("pdfHeaderTextStyle", () => {
  test("does not collapse centered photo headers", () => {
    expect(pdfHeaderTextStyle({ hasPhoto: true, photoPosition: "center" })).toEqual({
      marginTop: 8,
      width: "100%",
    });
  });

  test("keeps horizontal photo headers flexible", () => {
    expect(pdfHeaderTextStyle({ hasPhoto: true, photoPosition: "left" })).toMatchObject({
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      marginLeft: 12,
    });
  });

  test("keeps the text block full width when no photo is present", () => {
    expect(pdfHeaderTextStyle({ hasPhoto: false, photoPosition: "left" })).toEqual({
      width: "100%",
    });
  });
});

describe("pdfHeaderTypography", () => {
  test("keeps name and role on separate readable lines", () => {
    expect(pdfHeaderTypography()).toEqual({
      nameLineHeight: 1.2,
      roleLineHeight: 1.25,
      roleMarginTop: 4,
      contactMarginTop: 8,
    });
  });
});

describe("pdfHeaderStyles", () => {
  test("keeps the role and contacts visibly separated from the name", () => {
    expect(pdfHeaderStyles()).toEqual({
      name: { lineHeight: 1.2 },
      role: { lineHeight: 1.25, marginTop: 4 },
      contacts: { marginTop: 8 },
    });
  });
});
