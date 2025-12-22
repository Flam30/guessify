// src/utils/pdfQrGenerator.ts
// Generates a double-sided PDF: page of QR codes, then a matching page with track info.
// Uses pdfkit + blob-stream in the browser. Converts QR SVG -> PNG via canvas for embedding.

import { generateTrackQrDataUrl } from './qrcode';

type Track = { id: string; title?: string; artists?: string[] };

// Page and layout constants (A4 in points)
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 7; // points - margin equals gap size for balanced spacing
const COLUMNS = 4;
const ROWS = 5;
const GAP_X = 7; // points - equal to margin
const GAP_Y = 7; // points - equal to margin
const CELL_WIDTH = 140; // points - square cells based on QR size (118pt) + padding
const CELL_HEIGHT = 140; // points - square cells
const LABEL_HEIGHT = 22; // space reserved for the text side under each QR (CELL_HEIGHT - QR_BOX_SIZE)
const QR_BOX_SIZE = 118; // points - unchanged, provides ~11pt padding within cell
const PAGE_CAPACITY = COLUMNS * ROWS;

// Module-level cache for PNG data URLs by track ID to avoid repeated SVG->PNG conversions
const pngDataUrlCache: Map<string, string> = new Map();

/** Draw dotted grid lines to demarcate cell borders for cutting guides. */
function drawCuttingGuides(doc: any): void {
  const lineColor = '#cccccc';
  const dashArray = [2, 3]; // 2pt dash, 3pt gap for dotted effect

  doc.strokeColor(lineColor).dash(...dashArray);

  // Vertical lines (between columns)
  for (let col = 1; col < COLUMNS; col++) {
    const x = MARGIN + col * (CELL_WIDTH + GAP_X) - GAP_X / 2;
    doc.moveTo(x, MARGIN).lineTo(x, PAGE_HEIGHT - MARGIN).stroke();
  }

  // Horizontal lines (between rows)
  for (let row = 1; row < ROWS; row++) {
    const y = MARGIN + row * (CELL_HEIGHT + GAP_Y) - GAP_Y / 2;
    doc.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y).stroke();
  }

  // Restore stroke style
  doc.undash().strokeColor('#000000');
}

/** Generate a double-sided PDF blob where page pairs are: QR page, text page. */
export async function generateDoubleSidedQrPdf(tracks: Track[]): Promise<Blob> {
  if (typeof window === 'undefined') throw new Error('PDF generation must run in the browser');

  // Use the browser bundle loaded on the page (public/pdfkit.bundle.js) which exposes globals
  const PDFDocument = (window as any).PDFDocument;
  const blobStream = (window as any).blobStream;
  if (!PDFDocument || !blobStream) throw new Error('PDFKit or blobStream not available on window - ensure /pdfkit.bundle.js is loaded');

  const doc = new PDFDocument({ size: [PAGE_WIDTH, PAGE_HEIGHT], margin: 0 });
  const stream = doc.pipe(blobStream());

  // iterate chunks of PAGE_CAPACITY
  for (let chunkStart = 0; chunkStart < tracks.length; chunkStart += PAGE_CAPACITY) {
    const chunk = tracks.slice(chunkStart, chunkStart + PAGE_CAPACITY);

    // --- QR page ---
    // Draw a page for QR codes
    // (If not first page, addPage; doc starts with a page by default)
    if (chunkStart !== 0) doc.addPage();

    // Pre-generate PNG data URLs for all chunk entries in parallel (with caching)
    const pngPromises = chunk.map(async (t) => {
      // Check cache first
      const cached = pngDataUrlCache.get(t.id);
      if (cached) return cached;

      // Generate QR code directly as PNG data URL
      const pxSize = Math.ceil(QR_BOX_SIZE * 2);
      const dataUrl = await generateTrackQrDataUrl(t.id, pxSize);
      try {
        pngDataUrlCache.set(t.id, dataUrl);
      } catch (e) {
        // ignore cache set failures
      }
      return dataUrl;
    });

    const pngDataUrls = await Promise.all(pngPromises);

    // Draw cutting guides before placing images
    drawCuttingGuides(doc);

    // Place images in grid
    for (let i = 0; i < PAGE_CAPACITY; i++) {
      const col = i % COLUMNS;
      const row = Math.floor(i / COLUMNS);
      const x = MARGIN + col * (CELL_WIDTH + GAP_X);
      const y = MARGIN + row * (CELL_HEIGHT + GAP_Y);

      if (i < pngDataUrls.length) {
        const imgData = pngDataUrls[i];
        const imgX = x + (CELL_WIDTH - QR_BOX_SIZE) / 2;
        const imgY = y + (CELL_HEIGHT - QR_BOX_SIZE) / 2;
        // draw image
        try {
          doc.image(imgData, imgX, imgY, { width: QR_BOX_SIZE, height: QR_BOX_SIZE });
        } catch (e) {
          // fallback: if pdfkit doesn't accept data URL in your build, skip image
          console.warn('Failed to draw image into PDF page', e);
        }
      } else {
        // nothing in this cell
      }
    }

    // --- Text page (matching layout) ---
    doc.addPage();
    // Draw cutting guides on text page as well
    drawCuttingGuides(doc);
    
    for (let i = 0; i < PAGE_CAPACITY; i++) {
      const col = i % COLUMNS;
      const row = Math.floor(i / COLUMNS);
      const x = MARGIN + col * (CELL_WIDTH + GAP_X);
      const y = MARGIN + row * (CELL_HEIGHT + GAP_Y);

      if (i < chunk.length) {
        const t = chunk[i];
        const cellX = x;
        const cellY = y;

        // title at the top of the cell (centered)
        doc.fontSize(9).text(t.title ?? '', cellX + 2, cellY + 2, {
          width: CELL_WIDTH - 4,
          align: 'center',
          height: CELL_HEIGHT / 2,
          ellipsis: true
        });

        // artists at the bottom of the cell (centered)
        const artistsText = (t.artists || []).join(', ');
        doc.fontSize(8).text(artistsText, cellX + 2, cellY + CELL_HEIGHT / 2 + 2, {
          width: CELL_WIDTH - 4,
          align: 'center',
          height: CELL_HEIGHT / 2,
          ellipsis: true
        });
      }
    }
  }

  doc.end();

  return await new Promise<Blob>((resolve) => {
    stream.on('finish', () => {
      const blob = stream.toBlob('application/pdf');
      resolve(blob);
    });
  });
}
