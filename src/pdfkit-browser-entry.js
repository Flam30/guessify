// Browser entry point for PDFKit and blob-stream
// This file will be bundled with Browserify to create a standalone browser version
const PDFDocument = require('pdfkit');
const blobStream = require('blob-stream');

// Expose to window so React components can access them
if (typeof window !== 'undefined') {
  window.PDFDocument = PDFDocument;
  window.blobStream = blobStream;
}

// Also export for potential module usage
module.exports = { PDFDocument, blobStream };