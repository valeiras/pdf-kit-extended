import { PdfKitExtended } from "./../dist/index.js";
import fs from "fs";

// Create a document
const doc = new PdfKitExtended();
doc.pipe(fs.createWriteStream("output.pdf"));

doc.textWithBoundingRectangle("Text inside the rectangle", {
  padding: { top: 5, bottom: 2, left: 3, right: 3 },
  fillColor: "red",
  cornerRadius: 2,
  fillOpacity: 0.2,
  strokeColor: "blue",
  align: "center",
  textColor: "green",
});

doc.fillColor("#000000");
doc.moveDown();

doc.text("Horizontal rule:");
doc.hr({ strokeColor: "#555555" });
doc.moveDown();

const tableRows = [
  [
    { cellText: "Food", cellTextOptions: { align: "left" } },
    { cellText: "Note", cellTextOptions: { align: "center" } },
    { cellText: "Happiness", cellTextOptions: { align: "right" } },
  ],
  [
    { cellText: "Pizza", cellTextOptions: { align: "left" } },
    { cellText: "15/10", cellTextOptions: { align: "center" } },
    { cellText: "16/10", cellTextOptions: { align: "right" } },
  ],
  [
    { cellText: "Cookie", cellTextOptions: { align: "left" } },
    { cellText: "12/10", cellTextOptions: { align: "center" } },
    { cellText: "9/10", cellTextOptions: { align: "right" } },
  ],
];

doc.moveDown();
doc.text("Table: ");
doc.moveDown(0.5);

doc.table(tableRows, {
  prepareRow: PdfKitExtended.highlightHeaders({
    headersFill: "#d5d5d5",
    headersFontFamily: "Times-Bold",
    rowFill: "#f3f3f3",
    rowFontFamily: "Times-Roman",
  }),
});

doc.end();
