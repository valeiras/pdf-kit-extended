import sizeOf from "buffer-image-size";
import PDFDocument from "pdfkit";
import { scaleImageToMaxWidth } from "./utils.ts";
import {
  AlignMaker,
  AlignedImageConfig,
  CellPreparer,
  ColorSettings,
  FooterImageConfig,
  HeaderImageConfig,
  ImageConfig,
  RectangleConfig,
  RowConfig,
  RowPreparer,
  RowYPos,
  TableConfig,
  TableParameters,
  TableRow,
} from "./types.ts";
// const __dirname = import.meta.dirname;

class PdfKitExtended extends PDFDocument {
  private defaultColors: ColorSettings;

  constructor(
    docSettings?: PDFKit.PDFDocumentOptions,
    {
      footerImageConfig,
      headerImageConfig,
    }: { footerImageConfig?: FooterImageConfig; headerImageConfig?: HeaderImageConfig } = {}
  ) {
    super({ ...docSettings, autoFirstPage: false });

    this.defaultColors = {
      textColor: "#000000",
      strokeColor: "#cdcdce",
      backgroundColor: "#ffffff",
      fillColor: "#cdcdce",
    };

    this.on("pageAdded", () => {
      this.rect(0, 0, this.page.width, this.page.height).fill(this.defaultColors.backgroundColor);
      this.useDefaultColors();
      if (headerImageConfig) {
        this.centeredImage(headerImageConfig.image, { imageWidth: headerImageConfig.width, y: 0 });
      }
      if (footerImageConfig) {
        this.centeredImage(footerImageConfig.image, {
          imageWidth: footerImageConfig.width,
          y: this.page.height - footerImageConfig.height,
        });
      }
    });
  }

  useDefaultColors(): void {
    this.fillColor(this.defaultColors.textColor);
    this.strokeColor(this.defaultColors.strokeColor);
  }

  setDefaultColors(colors: Partial<ColorSettings>): void {
    const { textColor, strokeColor, backgroundColor, fillColor } = { ...this.defaultColors, ...colors };
    this.defaultColors = { textColor, strokeColor, backgroundColor, fillColor };
  }

  getRemainingHeight(): number {
    return this.page.height - this.y - this.page.margins.bottom;
  }

  getUsableWidth(): number {
    return this.page.width - this.page.margins.left - this.page.margins.right;
  }

  getUsableHeight(): number {
    return this.page.height - this.page.margins.top - this.page.margins.bottom;
  }

  getMiddlePoint(): number {
    return this.page.margins.left + this.getUsableWidth() / 2;
  }

  getMaxX(): number {
    return this.page.width - this.page.margins.right;
  }

  getMaxY(): number {
    return this.page.height - this.page.margins.bottom;
  }

  getXRightAligned({
    x,
    imageWidth,
    containerWidth,
  }: {
    x: number;
    imageWidth: number;
    containerWidth: number;
  }): number {
    return this.x + containerWidth - imageWidth;
  }

  getXCentered({ x, imageWidth, containerWidth }: { x: number; imageWidth: number; containerWidth: number }): number {
    return x + (containerWidth - imageWidth) / 2;
  }

  getPageCount(): number {
    const range = this.bufferedPageRange();
    return range.start + range.count;
  }

  getCurrentPageNumber(): number {
    const pageBuffer: PDFKit.PDFPage[] = (this as any)._pageBuffer;
    const currentPage = this.page;
    let currentPageNumber: number | null = null;
    pageBuffer.forEach((page: PDFKit.PDFPage, i: number) => {
      if (page === currentPage) {
        currentPageNumber = i;
      }
    });
    if (currentPageNumber === null) {
      throw new Error("Unable to get current page number");
    }
    return currentPageNumber;
  }

  goToNextPage(): void {
    this.switchToPage(this.getCurrentPageNumber() + 1);
    this.x = this.page.margins.left;
    this.y = this.page.margins.top;
  }

  superscript(text: string, fontSize: number, { continued = false }: { continued?: boolean } = {}): void {
    const currY = this.y;
    this.fontSize(fontSize / 2).text(text);
    this.fontSize(fontSize);
    this.y = currY;
    if (!continued) this.moveDown();
  }

  hr({
    x1 = this.page.margins.left,
    x2 = this.getMaxX(),
    y = this.y,
    strokeColor = null,
    lineWidth = 1,
  }: {
    x1?: number;
    x2?: number;
    y?: number;
    strokeColor?: PDFKit.Mixins.ColorValue | null;
    lineWidth?: number;
  } = {}): void {
    if (strokeColor) this.strokeColor(strokeColor);

    this.lineWidth(lineWidth).moveTo(x1, y).lineTo(x2, y).stroke();
  }

  leftAlignedImage(imageBuffer: Buffer, config?: ImageConfig): void {
    this.alignedImage(imageBuffer, { ...config, align: "left" });
  }

  rightAlignedImage(imageBuffer: Buffer, config?: ImageConfig): void {
    this.alignedImage(imageBuffer, { ...config, align: "right" });
  }

  centeredImage(imageBuffer: Buffer, config?: ImageConfig): void {
    this.alignedImage(imageBuffer, { ...config, align: "center" });
  }

  alignedImage(
    imageBuffer: Buffer,
    {
      imageWidth = sizeOf(imageBuffer).width,
      containerWidth = this.getUsableWidth(),
      x = this.x,
      y = this.y,
      forceCursorDisplacement = false,
      plotFrame = false,
      align,
      imageOptions,
    }: AlignedImageConfig
  ): void {
    let xImage;
    switch (align) {
      case "left":
        xImage = x;
        break;
      case "center":
        xImage = this.getXCentered({ x, imageWidth, containerWidth });
        break;
      case "right":
        xImage = this.getXRightAligned({ x, imageWidth, containerWidth });
        break;
      default:
        xImage = x;
        break;
    }

    if (forceCursorDisplacement) {
      this.x = xImage;
      this.y = y;
      if (imageOptions) this.image(imageBuffer, imageOptions);
      else this.image(imageBuffer, { width: imageWidth });
    } else {
      if (imageOptions) this.image(imageBuffer, xImage, y, imageOptions);
      else this.image(imageBuffer, xImage, y, { width: imageWidth });
    }
    if (plotFrame) {
      if (imageOptions?.fit) {
        this.rect(xImage, y, imageOptions.fit[0], imageOptions.fit[1]).stroke();
      } else {
        const height = this.getImageHeight(imageBuffer, imageWidth);
        this.rect(xImage, y, imageWidth, height).stroke();
      }
    }
  }

  textWithBoundingRectangle(
    text: string,
    {
      x,
      y,
      width,
      paddingAll = 1,
      padding = { top: paddingAll, left: paddingAll, bottom: paddingAll, right: paddingAll },
      cornerRadius = 0,
      fillOpacity = 1,
      strokeColor = this.defaultColors.strokeColor,
      fillColor = this.defaultColors.fillColor,
      textColor = this.defaultColors.textColor,
      lineWidth = 1,
      align = "justify",
    }: RectangleConfig = {}
  ): void {
    const rectangleWidth = width || this.widthOfString(text) + padding.left + padding.right;

    const textWidth = rectangleWidth - padding.left - padding.right;
    const textHeight = this.heightOfString(text, {
      width: textWidth,
    });

    const rectangleHeight = textHeight + padding.bottom + padding.top;
    if (rectangleHeight > this.getRemainingHeight()) {
      console.log(`Adding page: ${text}`);
      this.addPage();
    }

    y = y || this.y;
    x = x || this.x;

    if (cornerRadius !== 0) {
      this.roundedRect(x, y, rectangleWidth, rectangleHeight, cornerRadius);
    } else {
      this.rect(x, y, rectangleWidth, rectangleHeight);
    }
    this.lineWidth(lineWidth).fillOpacity(fillOpacity).fillAndStroke(fillColor, strokeColor);

    this.fillColor(textColor).fillOpacity(1);
    this.text(text, x + padding.left, y + padding.top, {
      align,
      width: textWidth,
    });
    this.y = y + rectangleHeight;
  }

  table(tableRows: TableRow[], tableConfig: TableConfig = {}): void {
    const tableParameters = this.#prepareTableParameters({ tableConfig, tableRows });

    let {
      startX,
      startY,
      width,
      heightMinNumberOfRows,
      maxY,
      rowHeights,
      hasHeaderOnTopOfNewPage,
      hasHorizontalLines,
      hasNewPages,
    } = tableParameters;

    const x1 = startX;
    const x2 = startX + width;

    // Check to have enough room for header and first rows
    if (startY + heightMinNumberOfRows > maxY) {
      if (hasNewPages) this.addPage();
      else this.goToNextPage();
      startY = this.page.margins.top;
    }

    const lastRowYPos: RowYPos = {
      topY: 0,
      bottomY: startY,
    };

    // Topmost line
    if (hasHorizontalLines) this.hr({ x1, x2, y: startY });

    tableRows.forEach((row, rowIdx) => {
      // Switch to next page if we cannot go any further because the space is over.
      if (lastRowYPos.bottomY + rowHeights[rowIdx] > maxY) {
        this.#addPageOrGoToNext({ tp: tableParameters, lastRowYPos, rowIdx, x1, x2 });
        if (hasHeaderOnTopOfNewPage) {
          this.#repeatHeader({ headerRow: tableRows[0], tp: tableParameters, lastRowYPos, x1, x2 });
        }
      } else {
        lastRowYPos.topY = lastRowYPos.bottomY;
        lastRowYPos.bottomY = lastRowYPos.topY + rowHeights[rowIdx];
      }

      this.row(row, rowIdx, lastRowYPos, tableParameters);
      if (hasHorizontalLines) this.hr({ x1, x2, y: lastRowYPos.bottomY });
    });

    this.x = startX;
    this.y = lastRowYPos.bottomY;
  }

  row(row: TableRow, rowIdx: number, lastRowYPos: RowYPos, tableParameters: TableParameters) {
    const {
      columnXs,
      columnWidths,
      columnTextWidths,
      width,
      rowHeights,
      startX,
      horPadding,
      textColor,
      prepareRow,
      prepareCell,
      makeAlign,
    } = tableParameters;

    const {
      rowHasFill = false,
      rowHasStroke = false,
      rowFillOpacity = 1,
      rowTextColor = textColor,
      rowFillColor,
      rowStrokeColor,
    } = prepareRow(rowIdx);

    this.#setupRowFont(prepareRow, rowIdx);

    if (rowHasFill || rowHasStroke) {
      this.rect(startX, lastRowYPos.topY, width, rowHeights[rowIdx]);
      if (rowHasStroke) this.stroke(rowStrokeColor);
      if (rowHasFill) {
        this.opacity(rowFillOpacity);
        this.fill(rowFillColor);
        this.opacity(1);
      }
    }

    // Print all cells of the current row
    row.forEach(({ cellText, cellImage, cellTextOptions, cellImageOptions }, jj) => {
      const {
        cellHasFill = false,
        cellHasStroke = false,
        lineWidth = 1,
        cellFillOpacity = 1,
        cellTextColor = rowTextColor,
        cellFillColor,
        cellStrokeColor,
      } = prepareCell(rowIdx, jj);

      this.#setupCellFont(prepareCell, rowIdx, jj);

      if (cellHasFill || cellHasStroke) {
        this.lineWidth(lineWidth);
        this.rect(columnXs[jj], lastRowYPos.topY, columnWidths[jj], rowHeights[rowIdx]);
        if (cellHasStroke) this.stroke(cellStrokeColor);
        if (cellHasFill) {
          this.opacity(cellFillOpacity);
          this.fill(cellFillColor);
          this.opacity(1);
        }
      }

      this.fillColor(cellTextColor);

      const { imageHeight } = cellImage ? scaleImageToMaxWidth(cellImage, columnTextWidths[jj]) : { imageHeight: 0 };
      const textHeight = cellText ? this.heightOfString(cellText, { width: columnTextWidths[jj] }) : 0;

      if (cellImage) {
        let yPos = this.getImageYPos({
          lastRowTopY: lastRowYPos.topY,
          imageHeight,
          textHeight,
          tp: tableParameters,
          rowIdx,
        });

        this.image(cellImage, columnXs[jj] + horPadding, yPos, {
          fit: [columnTextWidths[jj], rowHeights[rowIdx]],
          ...cellImageOptions,
        });
      }

      if (cellText) {
        let yPos =
          this.getImageYPos({ lastRowTopY: lastRowYPos.topY, imageHeight, textHeight, tp: tableParameters, rowIdx }) +
          imageHeight;
        this.text(cellText, columnXs[jj] + horPadding, yPos, {
          width: columnTextWidths[jj],
          align: makeAlign(rowIdx, jj),
          ...cellTextOptions,
        });
      }
    });
  }

  #addPageOrGoToNext({
    tp,
    lastRowYPos,
    rowIdx,
    x1,
    x2,
  }: {
    tp: TableParameters;
    lastRowYPos: RowYPos;
    rowIdx: number;
    x1: number;
    x2: number;
  }): void {
    const { hasNewPages, hasHorizontalLines, rowHeights } = tp;
    if (hasNewPages) this.addPage();
    else this.goToNextPage();
    if (hasHorizontalLines) this.hr({ x1, x2, y: this.page.margins.top });

    lastRowYPos.topY = this.page.margins.top;
    lastRowYPos.bottomY = this.page.margins.top + rowHeights[rowIdx];
  }

  #repeatHeader({
    headerRow,
    tp,
    lastRowYPos,
    x1,
    x2,
  }: {
    headerRow: TableRow;
    tp: TableParameters;
    lastRowYPos: RowYPos;
    x1: number;
    x2: number;
  }): void {
    const { hasHorizontalLines, rowHeights } = tp;
    this.row(headerRow, 0, lastRowYPos, tp);
    lastRowYPos.topY += tp.rowHeights[0];
    lastRowYPos.bottomY += tp.rowHeights[0];
    if (hasHorizontalLines) this.hr({ x1, x2, y: this.page.margins.top + rowHeights[0] });
  }

  getTableHeight(tableRows: TableRow[], tableConfig: TableConfig = {}): number {
    const tableParameters: TableParameters = this.#prepareTableParameters({ tableConfig, tableRows });
    return tableParameters.totalHeight;
  }

  getImageHeight(imageBuffer: Buffer, width: number): number {
    return (sizeOf(imageBuffer).height * width) / sizeOf(imageBuffer).width;
  }

  getImageYPos({
    lastRowTopY,
    imageHeight,
    textHeight,
    tp,
    rowIdx,
  }: {
    lastRowTopY: number;
    imageHeight: number;
    textHeight: number;
    tp: TableParameters;
    rowIdx: number;
  }): number {
    const { verticalAlign, verPadding, rowHeights } = tp;
    let yPos;
    switch (verticalAlign) {
      case "top":
        yPos = lastRowTopY + verPadding;
        break;
      case "bottom":
        yPos = lastRowTopY + rowHeights[rowIdx] - (imageHeight + textHeight) - verPadding;
        break;
      case "center":
      default:
        yPos = lastRowTopY + (rowHeights[rowIdx] - (imageHeight + textHeight)) / 2;
        break;
    }
    return yPos;
  }

  static alignTwoColumnsToExtremes(): AlignMaker {
    return (_rowIdx: number, cellIdx: number) => {
      return cellIdx % 2 === 0 ? "left" : "right";
    };
  }

  static makeEvenColumnsBold(mainFont: string | undefined, highlightedFont: string | undefined): CellPreparer {
    return (_rowIdx: number, cellIdx: number) => {
      if (cellIdx % 2 === 0) return { cellFontFamily: highlightedFont };
      else return { cellFontFamily: mainFont };
    };
  }

  static makeOddColumnsBold(mainFont: string | undefined, highlightedFont: string | undefined): CellPreparer {
    return (_rowIdx: number, cellIdx: number) => {
      if (cellIdx % 2 === 0) return { cellFontFamily: mainFont };
      else return { cellFontFamily: highlightedFont };
    };
  }

  static alternateMainColors(
    fillColor1: PDFKit.Mixins.ColorValue | undefined,
    fillColor2: PDFKit.Mixins.ColorValue | undefined,
    commonConfig: RowConfig = {}
  ): RowPreparer {
    return (rowIdx: number) => {
      const commonParameters: RowConfig = { ...commonConfig, rowHasFill: true };
      return rowIdx % 2 === 0
        ? { ...commonParameters, rowFillColor: fillColor1 }
        : { ...commonParameters, rowFillColor: fillColor2 };
    };
  }

  static highlightHeaders(
    {
      headersFill,
      headersFontFamily,
      rowFill,
      rowFontFamily,
    }: {
      headersFill: PDFKit.Mixins.ColorValue | undefined;
      headersFontFamily: string | undefined;
      rowFill: PDFKit.Mixins.ColorValue | undefined;
      rowFontFamily: string | undefined;
    },
    commonConfig: RowConfig = {}
  ): RowPreparer {
    return (rowIdx) => {
      const commonParameters = { ...commonConfig, rowHasFill: true };
      if (rowIdx === 0) {
        return { ...commonParameters, rowFontFamily: headersFontFamily, rowFillColor: headersFill };
      } else {
        return { ...commonParameters, rowFontFamily, rowFillColor: rowFill };
      }
    };
  }

  #prepareTableParameters({ tableConfig, tableRows }: { tableConfig: TableConfig; tableRows: TableRow[] }) {
    const tp: TableParameters = {
      startX: tableConfig.startX ?? this.x,
      startY: tableConfig.startY ?? this.y,
      horPadding: tableConfig.horPadding ?? 5,
      verPadding: tableConfig.verPadding ?? 5,
      width: tableConfig.width || this.getUsableWidth(),
      predefinedWidthFractions: tableConfig.predefinedWidthFractions ?? null,
      predefinedWidths: tableConfig.predefinedWidths ?? null,
      verticalAlign: tableConfig.verticalAlign || "center",
      minRowsBottomOfPage: tableConfig.minRowsBottomOfPage || 3, // If there is space for less than this number, we start a new page
      hasHeaderOnTopOfNewPage: tableConfig.hasHeaderOnTopOfNewPage ?? true,
      hasNewPages: tableConfig.hasNewPages ?? true,
      textColor: tableConfig.textColor || this.defaultColors.textColor,
      hasHorizontalLines: tableConfig.hasHorizontalLines ?? true,
      makeAlign: tableConfig.makeAlign || (() => "center"),
      prepareRow:
        tableConfig.prepareRow ||
        (() => {
          return {};
        }),
      prepareCell:
        tableConfig.prepareCell ||
        (() => {
          return {};
        }),

      // Additional calculations
      columnCount: tableRows[0].length,
      maxY: this.page.height - this.page.margins.bottom,

      columnXs: [],
      columnWidths: [],
      columnTextWidths: [],
      rowHeights: [],
      heightMinNumberOfRows: 0,
      totalHeight: 0,
    };

    this.#computeTableWidths(tp);

    tp.rowHeights = tableRows.map((row, rowIdx) => {
      return this.#getRowHeight(row, rowIdx, tp);
    });

    tp.heightMinNumberOfRows = tp.rowHeights.slice(0, tp.minRowsBottomOfPage).reduce((acc, curr) => acc + curr);
    tp.totalHeight = tp.rowHeights.reduce((acc, curr) => acc + curr);

    return tp;
  }

  #getRowHeight(row: TableRow, rowIdx: number, tp: TableParameters) {
    const { columnTextWidths, makeAlign, verPadding, prepareRow, prepareCell } = tp;

    this.#setupRowFont(prepareRow, rowIdx);

    const maxHeight = row.reduce((acc, { cellText, cellImage, cellTextOptions }, cellIdx) => {
      let currCellHeight = 0;

      if (cellImage) {
        const { imageHeight } = scaleImageToMaxWidth(cellImage, columnTextWidths[cellIdx]);
        currCellHeight += imageHeight;
      }

      if (cellText) {
        this.#setupCellFont(prepareCell, rowIdx, cellIdx);

        const textHeight = this.heightOfString(cellText, {
          width: columnTextWidths[cellIdx],
          align: makeAlign(rowIdx, cellIdx),
          ...cellTextOptions,
        });
        currCellHeight += textHeight;
      }
      return Math.max(acc, currCellHeight);
    }, 0);

    return maxHeight + 2 * verPadding;
  }

  #computeTableWidths(tp: TableParameters): void {
    if (tp.predefinedWidths) {
      tp.columnWidths = [];
      let lastX = tp.startX;
      for (const currWidth of tp.predefinedWidths) {
        tp.columnXs.push(lastX);
        tp.columnWidths.push(currWidth);
        tp.columnTextWidths.push(currWidth - 2 * tp.horPadding);
        lastX += currWidth;
      }
    } else if (tp.predefinedWidthFractions) {
      tp.columnWidths = [];
      let lastX = tp.startX;
      for (const fraction of tp.predefinedWidthFractions) {
        const currWidth = tp.width * fraction;
        tp.columnXs.push(lastX);
        tp.columnWidths.push(currWidth);
        tp.columnTextWidths.push(currWidth - 2 * tp.horPadding);
        lastX += currWidth;
      }
    } else {
      tp.columnWidths = [];
      const currWidth = tp.width / tp.columnCount;
      for (let jj = 0; jj < tp.columnCount; jj++) {
        tp.columnXs.push(tp.startX + jj * currWidth);
        tp.columnWidths.push(currWidth);
        tp.columnTextWidths.push(currWidth - 2 * tp.horPadding);
      }
    }
  }

  #setupRowFont(prepareRow: RowPreparer, rowIdx: number) {
    const { rowFontSize, rowFontFamily } = prepareRow(rowIdx);
    if (rowFontSize) this.fontSize(rowFontSize);
    if (rowFontFamily) this.font(rowFontFamily);
  }

  #setupCellFont(prepareCell: CellPreparer, rowIdx: number, cellIdx: number) {
    const { cellFontSize, cellFontFamily } = prepareCell(rowIdx, cellIdx);
    if (cellFontSize) this.fontSize(cellFontSize);
    if (cellFontFamily) this.font(cellFontFamily);
  }
}

export default PdfKitExtended;
