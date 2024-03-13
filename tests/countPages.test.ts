import { PdfKitExtended } from "../src";

test("Counts the number of pages correctly", () => {
  const doc = new PdfKitExtended({}, {});
  doc.addPage();
  doc.addPage();
  const result = doc.getPageCount();
  expect(result).toBe(2);
});
