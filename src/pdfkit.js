// require dependencies
const PDFDocument = require('pdfkit');
const blobStream  = require('blob-stream');

// create a document the same way as above
const doc = new PDFDocument({size: 'A4', margin: 15});

// pipe the document to a blob
const stream = doc.pipe(blobStream());

doc.table({
  rowStyles: { border: false },
  data: [
    ["Header 1", "Header 2", "Header 3, Header 4"],
    ["Sample value 1", "Sample value 2", "Sample value 3", "Sample value 4"],
    ["Sample value 1", "Sample value 2", "Sample value 3", "Sample value 4"],
    ["Sample value 1", "Sample value 2", "Sample value 3", "Sample value 4"],
    ["Sample value 1", "Sample value 2", "Sample value 3", "Sample value 4"],
    ["Sample value 1", "Sample value 2", "Sample value 3", "Sample value 4"],
  ],
})

// get a blob when you're done
doc.end();
stream.on('finish', function() {
  // get a blob you can do whatever you like with
//   const blob = stream.toBlob('application/pdf');

  // or get a blob URL for display in the browser
  const url = stream.toBlobURL('application/pdf');
  iframe.src = url;
});