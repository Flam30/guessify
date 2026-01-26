"use client";
import { useState, useRef, useEffect } from 'react';
import { useTracks } from '../contexts/TracksContext';

export default function Component() {
  const { tracks } = useTracks();
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [bundleLoaded, setBundleLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load the PDFKit bundle once when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if PDFKit is already loaded
      if ((window as any).PDFDocument && (window as any).blobStream) {
        setBundleLoaded(true);
        return;
      }

      // Load the bundle
      const script = document.createElement('script');
      script.src = '/pdfkit.bundle.js';
      script.onload = () => {
        setBundleLoaded(true);
      };
      script.onerror = () => {
        setError('Failed to load PDFKit bundle');
      };
      document.head.appendChild(script);

      // Cleanup
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, []);

  const generatePDF = async () => {
    if (!bundleLoaded) {
      setError('PDFKit bundle not loaded yet');
      return;
    }

    if (!tracks || tracks.length === 0) {
      setError('No tracks loaded. Please fetch a playlist first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Dynamically import the PDF generator
      const { generateDoubleSidedQrPdf } = await import('../utils/pdfQrGenerator');
      
      // Map context Track shape to generator's expected shape
      const payload = tracks.map(t => ({ 
        id: t.track.id, 
        title: t.track.name, 
        artists: t.track.artists.map(a => a.name) 
      }));

      // Generate the double-sided QR PDF
      const blob = await generateDoubleSidedQrPdf(payload);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      
      // Update iframe src
      if (iframeRef.current) {
        iframeRef.current.src = url;
      }
    } catch (err) {
      setError(`Failed to generate PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'tracks-qrcodes-double-sided.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen w-full p-8 bg-background text-foreground">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 space-x-4">
          <button
            onClick={generatePDF}
            disabled={loading || !bundleLoaded}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!bundleLoaded ? 'Loading PDFKit...' : loading ? 'Generating...' : 'Generate PDF'}
          </button>
          
          {pdfUrl && (
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
            >
              Download PDF
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {pdfUrl && (
          <div className="border border-border rounded-md overflow-hidden">
            <iframe
              ref={iframeRef}
              src={pdfUrl}
              className="w-full h-96 md:h-[600px]"
              title="Generated PDF Preview"
            />
          </div>
        )}

        {!pdfUrl && !loading && (
          <div className="border-2 border-dashed border-border rounded-md p-12 text-center">
            <p className="text-muted-foreground">Click "Generate PDF" to create and preview your PDF</p>
          </div>
        )}
      </div>
    </div>
  );
}