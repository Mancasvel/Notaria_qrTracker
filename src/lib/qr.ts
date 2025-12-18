import QRCode from 'qrcode';

/**
 * Genera un código QR para un documento
 * IMPORTANTE: Esta función solo se ejecuta en el servidor
 */
export async function generateQRCode(documentId: string): Promise<string> {
  // Asegurar que solo se ejecute en el servidor
  if (typeof window !== 'undefined') {
    throw new Error('generateQRCode solo puede ejecutarse en el servidor');
  }
  
  try {
    // Crear la URL que apunta al documento
    // NEXTAUTH_URL es seguro de usar aquí ya que es información pública
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
