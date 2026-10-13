import { jsPDF } from "jspdf";
import { CONDITION_LABELS } from "@/lib/products/productConstants";
import { formatAmount } from "@/lib/products/format";
import type { ProductRecord } from "@/lib/products/productTypes";

const PAGE_MARGIN_PT = 48;
const LINE_HEIGHT_PT = 16;
const SECTION_GAP_PT = 6;
const TITLE_FONT_SIZE = 20;
const BODY_FONT_SIZE = 11;

/** Generates a PDF with every stored detail of a product and downloads it (browser only). */
export function downloadProductPdf(product: ProductRecord): void {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pdf.internal.pageSize.getWidth() - PAGE_MARGIN_PT * 2;
  let cursorY = PAGE_MARGIN_PT;

  function writeLines(lines: string[]): void {
    for (const line of lines) {
      if (cursorY > pageHeight - PAGE_MARGIN_PT) {
        pdf.addPage();
        cursorY = PAGE_MARGIN_PT;
      }
      pdf.text(line, PAGE_MARGIN_PT, cursorY);
      cursorY += LINE_HEIGHT_PT;
    }
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(TITLE_FONT_SIZE);
  writeLines(["Product details"]);
  cursorY += SECTION_GAP_PT;

  const rows: ReadonlyArray<readonly [string, string]> = [
    ["Title", product.title],
    ["Listing ID", product.id],
    ["Category", product.category],
    ["Condition", CONDITION_LABELS[product.condition]],
    ["Price", `${product.currency} ${formatAmount(product.priceInCents)}`],
    ["Shipping cost", `${product.currency} ${formatAmount(product.shippingCostInCents)}`],
    ["Quantity", String(product.quantity)],
    ["Image name", product.imageName],
    ["Image URL", product.imageUrl],
    ["Created at", new Date(product.createdAt).toUTCString()],
    ["Description", product.description],
  ];

  pdf.setFontSize(BODY_FONT_SIZE);
  for (const [label, value] of rows) {
    pdf.setFont("helvetica", "bold");
    writeLines([label]);
    pdf.setFont("helvetica", "normal");
    writeLines(pdf.splitTextToSize(value, contentWidth));
    cursorY += SECTION_GAP_PT;
  }

  pdf.save(`product-${product.id}.pdf`);
}