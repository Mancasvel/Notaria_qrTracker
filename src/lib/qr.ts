import QRCode from 'qrcode';

export async function generateQRCode(documentId: string): Promise<string> {
  try {
    // Crear la URL que apunta al documento
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const url = `${baseUrl}/documento/${documentId}`;

    // Generar el QR code como data URL
    const qrCodeDataURL = await QRCode.toDataURL(url, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Return empty string instead of throwing error to prevent registration failure
    return '';
  }
}
