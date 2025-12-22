// src/utils/qrcode.ts
// QR code generation using the 'qrcode' library. Browser-safe and efficient.

/** Generate a QR code data URL for a Spotify track URI */
export async function generateTrackQrDataUrl(trackId: string, size: number = 300): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const QRCode = require('qrcode');
    
    const uri = `spotify:track:${trackId}`;
    // QRCode.toDataURL generates a data URL directly
    const dataUrl = await QRCode.toDataURL(uri, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: size,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw new Error(`Failed to generate QR code: ${err instanceof Error ? err.message : String(err)}`);
  }
}



