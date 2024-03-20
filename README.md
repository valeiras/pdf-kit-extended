# PdfKitExtended

Some additional functions, built on top of the amazing Javascript Pdf generation library PdfKit.

## Usage

### Installation:

```sh
npm install pdf-kit-extended
```

### Document creation:

Same as PdfKit:

```js
import { PdfKitExtended } from "pdf-kit-extended";
import fs from "fs";

// Create a document
const doc = new PdfKitExtended();
doc.pipe(fs.createWriteStream("output.pdf"));
doc.end();
```

### Additional functions:

- textWithBoundingRectangle

```js
doc.textWithBoundingRectangle("Text inside the rectangle", {
  padding: { top: 5, bottom: 2, left: 3, right: 3 },
  fillColor: "red",
  cornerRadius: 2,
  fillOpacity: 0.2,
  strokeColor: "blue",
  align: "center",
  textColor: "green",
});
```

- Horizontal rule

```js
doc.text("Horizontal rule:");
doc.hr({ strokeColor: "#555555" });
```

- Table

```js
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

doc.table(tableRows, {
  prepareRow: PdfKitExtended.highlightHeaders({
    headersFill: "#d5d5d5",
    headersFontFamily: "Times-Bold",
    rowFill: "#f3f3f3",
    rowFontFamily: "Times-Roman",
  }),
});
```

The library includes a series of static helper functions, designed to ease the personalization of the table appearance:

- alignTwoColumnsToExtremes()
- makeEvenColumnsBold()
- makeOddColumnsBold()
- alternateMainColors()
- highlightHeaders()

Example:

```js
const table2Rows = [
  [{ cellText: "Name" }, { cellText: "Mars" }],
  [{ cellText: "Aphelion" }, { cellText: "249261000 km" }],
  [{ cellText: "Perihelion" }, { cellText: "206650000 km" }],
  [{ cellText: "Eccentricity" }, { cellText: "0.0934" }],
];

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
```
