import { PdfKitExtended } from "./../dist/index.js";
import fs from "fs";

const fontSize = 10;

// Create a document
const doc = new PdfKitExtended();
doc.pipe(fs.createWriteStream("output.pdf"));
doc.fontSize(fontSize);

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

doc.text("This is a", { continued: true });
doc.superscript("superscript", fontSize, { continued: true });
doc.text(", even if the font family does not support it");
doc.moveDown();

doc.text("Horizontal rule:");
doc.hr({ strokeColor: "#555555" });
doc.moveDown();

const table1Rows = [
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

doc.table(table1Rows, {
  prepareRow: PdfKitExtended.highlightHeaders({
    headersFill: "#d5d5d5",
    headersFontFamily: "Times-Bold",
    rowFill: "#f3f3f3",
    rowFontFamily: "Times-Roman",
  }),
});

doc.moveDown(2);

doc.font("Helvetica");
const table2Rows = [
  [{ cellText: "Name" }, { cellText: "Mars" }],
  [{ cellText: "Aphelion" }, { cellText: "249261000 km" }],
  [{ cellText: "Perihelion" }, { cellText: "206650000 km" }],
  [{ cellText: "Eccentricity" }, { cellText: "0.0934" }],
];
doc.text("Another table with planet information: ");
doc.moveDown();
doc.table(table2Rows, {
  width: (2 * doc.getUsableWidth()) / 3,
  predefinedWidthFractions: [0.4, 0.6],
  makeAlign: PdfKitExtended.alignTwoColumnsToExtremes(),
  prepareCell: PdfKitExtended.makeEvenColumnsBold("Courier", "Courier-Bold", {
    cellHasStroke: true,
    cellStrokeColor: "aquamarine",
  }),
  prepareRow: PdfKitExtended.alternateMainColors("#d2d3d5", "#f3f3f3"),
  hasHorizontalLines: false,
});
doc.end();
