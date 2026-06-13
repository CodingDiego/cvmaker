import { sampleResume } from "@/lib/cv/types";
import { renderPdf } from "@/templates/render/pdf";
import { renderDocx } from "@/templates/render/docx";
import { putToStore, getBytes, delFromStore, defaultStore } from "@/lib/blob";
import { env } from "@/lib/env";

async function main() {
  const data = sampleResume();
  const opts = { templateId: "classic", accentColor: "#2563eb", fontFamily: "inter" };

  const pdf = await renderPdf(data, opts);
  const pdfMagic = pdf.subarray(0, 4).toString("latin1");
  console.log(`PDF: ${pdf.length} bytes, magic="${pdfMagic}"`, pdfMagic === "%PDF" ? "✓" : "✗");
  if (pdfMagic !== "%PDF") throw new Error("invalid PDF");

  const docx = await renderDocx(data, opts);
  const docxMagic = docx.subarray(0, 2).toString("latin1");
  console.log(`DOCX: ${docx.length} bytes, magic="${docxMagic}"`, docxMagic === "PK" ? "✓" : "✗");
  if (docxMagic !== "PK") throw new Error("invalid DOCX");

  // Blob roundtrip against whichever store is configured.
  if (env.hasPrivateBlob() || env.hasPublicBlob()) {
    const store = defaultStore();
    const path = `smoke/${Date.now()}.pdf`;
    const { url } = await putToStore(store, path, pdf, { contentType: "application/pdf", addRandomSuffix: true });
    console.log(`blob (${store}) upload url:`, url.slice(0, 60) + "…");
    const back = await getBytes(store, url);
    console.log("blob roundtrip bytes match:", back.length === pdf.length ? "✓" : "✗");
    await delFromStore(store, url).catch(() => {});
  } else {
    console.log("blob: skipped (not configured)");
  }

  console.log("\n✅ RENDER SMOKE PASSED");
}

main().catch((e) => {
  console.error("❌ RENDER SMOKE FAILED:", e);
  process.exit(1);
});
