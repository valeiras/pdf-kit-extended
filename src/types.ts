export type ColorSettings = {
  textColor: PDFKit.Mixins.ColorValue;
  strokeColor: PDFKit.Mixins.ColorValue;
  backgroundColor: PDFKit.Mixins.ColorValue;
  fillColor: PDFKit.Mixins.ColorValue;
};

export type HeaderImageConfig = {
  image: Buffer;
  width: number;
};

export type FooterImageConfig = HeaderImageConfig & {
  height: number;
};

export type ImageConfig = {
  imageWidth?: number;
  containerWidth?: number;
  x?: number;
  y?: number;
  forceCursorDisplacement?: boolean;
  plotFrame?: boolean;
  fitOptions?: { fit: [number, number] };
};

export type AlignedImageConfig = ImageConfig & {
  align: PDFKit.Mixins.TextOptions["align"];
};

export type RectangleConfig = {
  x?: number;
  y?: number;
  width?: number;
  paddingAll?: number;
  padding?: { top: number; left: number; bottom: number; right: number };
  cornerRadius?: number;
  fillOpacity?: number;
  strokeColor?: PDFKit.Mixins.ColorValue;
  fillColor?: PDFKit.Mixins.ColorValue;
  textColor?: PDFKit.Mixins.ColorValue;
  lineWidth?: number;
  align?: PDFKit.Mixins.TextOptions["align"];
};

export interface TableConfig {
  startX?: number;
  startY?: number;
  horPadding?: number;
  verPadding?: number;
  width?: number;
  predefinedWidthFractions?: number[] | null;
  predefinedWidths?: number[] | null;
  verticalAlign?: "center" | "top" | "bottom";
  minRowsBottomOfPage?: number;
  hasHeaderOnTopOfNewPage?: boolean;
  hasNewPages?: boolean;
  hasHorizontalLines?: boolean;
  textColor?: PDFKit.Mixins.ColorValue;
  makeAlign?: AlignMaker;
  prepareRow?: RowPreparer;
  prepareCell?: CellPreparer;
}

export type AlignMaker = (rowIdx: number, colIdx: number) => PDFKit.Mixins.TextOptions["align"];
export type RowPreparer = (rowIdx: number) => RowConfig;
export type CellPreparer = (rowIdx: number, colIdx: number) => CellConfig;

export interface TableParameters extends Required<TableConfig> {
  columnCount: number;
  maxY: number;
  columnXs: number[];
  columnWidths: number[];
  columnTextWidths: number[];
  rowHeights: number[];
  heightMinNumberOfRows: number;
  totalHeight: number;
}

export type TableRow = TableCell[];

export type TableCell = {
  cellText?: string;
  cellImage?: Buffer;
  cellTextOptions?: PDFKit.Mixins.TextOptions;
  cellImageOptions?: PDFKit.Mixins.ImageOption;
};

export type RowConfig = {
  rowHasFill?: boolean;
  rowHasStroke?: boolean;
  rowFillOpacity?: number;
  rowFontFamily?: string;
  rowFontSize?: number;
  rowTextColor?: PDFKit.Mixins.ColorValue;
  rowFillColor?: PDFKit.Mixins.ColorValue;
  rowStrokeColor?: PDFKit.Mixins.ColorValue;
};

export type CellConfig = {
  cellHasFill?: boolean;
  cellHasStroke?: boolean;
  cellFillOpacity?: number;
  lineWidth?: number;
  cellFontFamily?: string;
  cellFontSize?: number;
  cellTextColor?: PDFKit.Mixins.ColorValue;
  cellFillColor?: PDFKit.Mixins.ColorValue;
  cellStrokeColor?: PDFKit.Mixins.ColorValue;
};

export type RowYPos = {
  topY: number;
  bottomY: number;
};
