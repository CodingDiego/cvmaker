import { describe, expect, test } from "bun:test";
import { pdfHeaderTextStyle, pdfHeaderTypography } from "./pdf-layout";

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

  test("uses the same horizontal text sizing when no photo is present", () => {
    expect(pdfHeaderTextStyle({ hasPhoto: false, photoPosition: "left" })).toEqual({
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
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
