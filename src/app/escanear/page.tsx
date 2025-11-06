'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Header } from '@/components/Header';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function EscanearPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [lastScanned, setLastScanned] = useState<string>('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  // Redirect if not authenticated
  if (status === 'loading') {
    return <div>Cargando...</div>;
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  const startScanning = () => {
    setIsScanning(true);
    setMessage('');

    scannerRef.current = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scannerRef.current.render(onScanSuccess, onScanError);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    // Evitar escaneos duplicados rápidos
    if (lastScanned === decodedText) {
      return;
    }
    setLastScanned(decodedText);

    try {
      // Extraer el ID del documento de la URL
      const url = new URL(decodedText);
      const pathParts = url.pathname.split('/');
      const documentId = pathParts[pathParts.length - 1];

      if (!documentId) {
        setMessage('⚠️ QR no válido');
        return;
      }

      // Enviar a la API para actualizar ubicación
      const response = await fetch('/api/escanear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`📍 ${data.message}`);
        // Detener escaneo después de éxito
        stopScanning();
      } else {
        setMessage(`⚠️ ${data.error}`);
      }
    } catch (error) {
      console.error('Error processing QR:', error);
      setMessage('⚠️ Error al procesar el QR');
    }
  };

  const onScanError = (error: string) => {
    // Ignorar errores de escaneo normales (no hay QR en vista)
    console.debug('QR scan error:', error);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl">📷 Escanear Documento</CardTitle>
              <CardDescription className="text-sm">
                Apunta la cámara al código QR del documento para actualizar su ubicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              {/* Área de escaneo */}
              <div className="relative">
                {!isScanning ? (
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                    <div className="text-center text-muted-foreground">
                      <div className="text-6xl mb-4">📱</div>
                      <p className="text-lg">Cámara lista</p>
                      <p className="text-sm">Presiona &quot;Escanear&quot; para comenzar</p>
                    </div>
                  </div>
                ) : (
                  <div
                    id="qr-reader"
                    className="aspect-square w-full rounded-lg overflow-hidden border"
                  />
                )}
              </div>

              {/* Mensaje de estado */}
              {message && (
                <div className={`text-center p-4 rounded-lg text-lg font-medium ${
                  message.includes('✅') || message.includes('📍')
                    ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  {message}
                </div>
              )}

              {/* Controles */}
              <div className="flex gap-4">
                {!isScanning ? (
                  <Button
                    onClick={startScanning}
                    className="flex-1 text-lg py-6"
                    size="lg"
                  >
                    📷 Escanear QR
                  </Button>
                ) : (
                  <Button
                    onClick={stopScanning}
                    variant="outline"
                    className="flex-1 text-lg py-6"
                    size="lg"
                  >
                    ⏹️ Detener
                  </Button>
                )}
              </div>

              {/* Información adicional */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">💡 Consejos para escanear:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Asegúrate de tener permisos de cámara habilitados</li>
                  <li>• Mantén el QR dentro del marco de enfoque</li>
                  <li>• Evita movimientos bruscos mientras escaneas</li>
                  <li>• La ubicación se actualizará automáticamente a tu despacho</li>
                </ul>
              </div>

              {/* Tu despacho actual */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Tu despacho actual:</p>
                <p className="text-lg font-semibold text-primary">
                  {session.user.despacho || 'No asignado'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
