'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Header } from '@/components/Header';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { UbicacionModal } from '@/components/UbicacionModal';

export default function EscanearPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [lastScanned, setLastScanned] = useState<string>('');
  const [lastDocumentId, setLastDocumentId] = useState<string>('');
  const [isArchiving, setIsArchiving] = useState(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [diagnosticInfo, setDiagnosticInfo] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [pendingDocumentId, setPendingDocumentId] = useState<string>('');
  const [pendingDocumentNumero, setPendingDocumentNumero] = useState<string>('');
  const [pendingDocumentNotario, setPendingDocumentNotario] = useState<'MAPE' | 'MCVF' | undefined>(undefined);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrReaderRef = useRef<HTMLDivElement>(null);

  // Obtener lista de cámaras disponibles
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices.map((device) => ({ id: device.id, label: device.label || `Camera ${device.id}` })));
          // Seleccionar la cámara trasera por defecto (si está disponible)
          const backCamera = devices.find((device) => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('trasera')
          );
          setSelectedCamera(backCamera?.id || devices[0].id);
        }
      })
      .catch((err) => {
        console.error('Error getting cameras:', err);
        setMessage('⚠️ No se pudo acceder a las cámaras. Verifica los permisos.');
      });

    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const startScanning = async () => {
    setIsScanning(true);
    setMessage('Iniciando cámara...');
    setLastScanned('');

    try {
      // Si ya existe un scanner, limpiarlo primero
      if (scannerRef.current) {
        try {
          if (scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
            await scannerRef.current.stop();
          }
          await scannerRef.current.clear();
        } catch (e) {
          console.log('Error cleaning previous scanner:', e);
        }
        scannerRef.current = null;
      }

      // Esperar un momento para que la cámara se libere
      await new Promise(resolve => setTimeout(resolve, 500));

      // Crear nuevo scanner
      scannerRef.current = new Html5Qrcode('qr-reader');

      // Intentar primero con facingMode (más compatible)
      let started = false;
      
      if (!selectedCamera || cameras.length === 0) {
        // Método 1: Usar facingMode (más compatible)
        try {
          await scannerRef.current.start(
            { facingMode: "environment" }, // Cámara trasera
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            onScanSuccess,
            onScanError
          );
          started = true;
          setMessage('');
        } catch (e) {
          console.log('Failed with environment camera, trying user camera:', e);
          
          // Intentar con cámara frontal
          try {
            await scannerRef.current.start(
              { facingMode: "user" }, // Cámara frontal
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
              },
              onScanSuccess,
              onScanError
            );
            started = true;
            setMessage('');
          } catch (e2) {
            console.log('Failed with user camera:', e2);
          }
        }
      }
      
      // Método 2: Si facingMode falla, intentar con ID de cámara específico
      if (!started && selectedCamera) {
        await scannerRef.current.start(
          selectedCamera,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          onScanSuccess,
          onScanError
        );
        started = true;
        setMessage('');
      }
      
      if (!started) {
        throw new Error('No se pudo iniciar ninguna cámara');
      }
      
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      
      // Limpiar el scanner fallido
      if (scannerRef.current) {
        try {
          await scannerRef.current.clear();
        } catch (e) {
          console.log('Error clearing failed scanner:', e);
        }
        scannerRef.current = null;
      }
      
      // Mensajes de error específicos
      let errorMessage = '⚠️ Error al iniciar la cámara.';
      
      if (err.name === 'NotReadableError' || err.message?.includes('not start video source')) {
        errorMessage = '⚠️ La cámara está siendo usada por otra aplicación. Cierra TODAS las pestañas del navegador que puedan estar usando la cámara (incluyendo WhatsApp Web, Meet, Zoom, etc.) y recarga esta página.';
      } else if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
        errorMessage = '⚠️ Permiso de cámara denegado. Haz clic en el icono de candado 🔒 en la barra de direcciones y permite el acceso a la cámara.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = '⚠️ No se encontró ninguna cámara. Verifica que tu dispositivo tenga una cámara conectada.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = '⚠️ La cámara no cumple con los requisitos. Intenta recargar la página.';
      }
      
      setMessage(errorMessage);
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) return;
    
    // Detener el escaneo actual
    await stopScanning();
    
    // Cambiar a la siguiente cámara
    const currentIndex = cameras.findIndex(c => c.id === selectedCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setSelectedCamera(cameras[nextIndex].id);
    
    setMessage(`📷 Cambiado a: ${cameras[nextIndex].label}`);
  };

  const onScanSuccess = async (decodedText: string) => {
    // Evitar escaneos duplicados rápidos
    if (lastScanned === decodedText) {
      return;
    }
    setLastScanned(decodedText);

    // Detener escaneo inmediatamente después de leer
    await stopScanning();

    try {
      // Extraer el ID del documento de la URL
      const url = new URL(decodedText);
      const pathParts = url.pathname.split('/');
      const documentId = pathParts[pathParts.length - 1];

      if (!documentId) {
        setMessage('⚠️ QR no válido');
        return;
      }

      // Guardar el ID para la función de archivar
      setLastDocumentId(documentId);

      // Obtener información del documento
      const docResponse = await fetch(`/api/registros/${documentId}`);
      if (!docResponse.ok) {
        setMessage('⚠️ Documento no encontrado');
        return;
      }
      const docData = await docResponse.json();

      // Determinar si necesitamos mostrar el modal según el rol
      const rolesConModal = ['oficial', 'copista', 'contabilidad'];
      
      if (rolesConModal.includes(session.user.role)) {
        // Mostrar modal para seleccionar trámite
        setPendingDocumentId(documentId);
        setPendingDocumentNumero(docData.numero);
        setPendingDocumentNotario(docData.notario);
        setShowModal(true);
      } else if (session.user.role === 'notario') {
        // Para notario, actualizar a su despacho
        await updateDocumentLocation(documentId, session.user.despacho);
      } else if (session.user.role === 'mostrador') {
        // Para mostrador, actualizar a MOSTRADOR
        await updateDocumentLocation(documentId, 'MOSTRADOR');
      } else {
        // Para otros roles, usar su despacho
        await updateDocumentLocation(documentId, session.user.despacho);
      }
    } catch (error) {
      console.error('Error processing QR:', error);
      setMessage('⚠️ Error al procesar el QR');
    }
  };

  const updateDocumentLocation = async (documentId: string, ubicacion?: string) => {
    try {
      const response = await fetch('/api/escanear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId, ubicacion }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`⚠️ ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating location:', error);
      setMessage('⚠️ Error al actualizar la ubicación');
    }
  };

  const handleModalSelect = async (ubicacion: string) => {
    setShowModal(false);
    await updateDocumentLocation(pendingDocumentId, ubicacion);
    setPendingDocumentId('');
    setPendingDocumentNumero('');
    setPendingDocumentNotario(undefined);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setPendingDocumentId('');
    setPendingDocumentNumero('');
    setPendingDocumentNotario(undefined);
    setMessage('⚠️ Escaneo cancelado');
  };

  const runDiagnostics = async () => {
    setDiagnosticInfo('🔍 Ejecutando diagnóstico...');
    
    try {
      // Verificar permisos de cámara
      const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
      let info = `📋 Estado de permisos: ${permissions.state}\n`;
      
      // Verificar MediaDevices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        info += '❌ MediaDevices API no disponible\n';
        info += '💡 Asegúrate de estar usando HTTPS o localhost\n';
        setDiagnosticInfo(info);
        return;
      }
      
      info += '✅ MediaDevices API disponible\n';
      
      // Intentar obtener cámaras
      try {
        const devices = await Html5Qrcode.getCameras();
        info += `📷 Cámaras detectadas: ${devices.length}\n`;
        devices.forEach((device, i) => {
          info += `  ${i + 1}. ${device.label || device.id}\n`;
        });
      } catch (e: any) {
        info += `❌ Error al obtener cámaras: ${e.message}\n`;
      }
      
      // Intentar acceso directo a la cámara
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        info += '✅ Acceso directo a cámara exitoso\n';
        
        // Obtener información del track
        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        info += `📐 Resolución: ${settings.width}x${settings.height}\n`;
        info += `🎥 Dispositivo: ${videoTrack.label}\n`;
        
        // Liberar el stream
        stream.getTracks().forEach(track => track.stop());
        info += '✅ Stream liberado correctamente\n';
      } catch (e: any) {
        info += `❌ Error al acceder a cámara: ${e.name} - ${e.message}\n`;
        
        if (e.name === 'NotReadableError') {
          info += '💡 La cámara está en uso por otra aplicación\n';
        } else if (e.name === 'NotAllowedError') {
          info += '💡 Permisos denegados por el usuario\n';
        }
      }
      
      setDiagnosticInfo(info);
    } catch (e: any) {
      setDiagnosticInfo(`❌ Error en diagnóstico: ${e.message}`);
    }
  };

  const handleArchivar = async () => {
    if (!lastDocumentId) {
      setMessage('⚠️ Primero debes escanear un documento');
      return;
    }

    setIsArchiving(true);
    setMessage('');

    try {
      const response = await fetch('/api/archivar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId: lastDocumentId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        setLastDocumentId('');
      } else {
        setMessage(`⚠️ ${data.error}`);
      }
    } catch (error) {
      console.error('Error archiving document:', error);
      setMessage('⚠️ Error al archivar el documento');
    } finally {
      setIsArchiving(false);
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

              {/* Selector de cámara */}
              {cameras.length > 1 && !isScanning && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Seleccionar cámara:</label>
                  <select
                    value={selectedCamera}
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    className="w-full p-3 border border-input rounded-md bg-background text-sm"
                  >
                    {cameras.map((camera) => (
                      <option key={camera.id} value={camera.id}>
                        {camera.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Controles */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  {!isScanning ? (
                    <Button
                      onClick={startScanning}
                      className="flex-1 text-base sm:text-lg py-5 sm:py-6"
                      size="lg"
                      disabled={!selectedCamera}
                    >
                      📷 Escanear QR
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={stopScanning}
                        variant="outline"
                        className="flex-1 text-base sm:text-lg py-5 sm:py-6"
                        size="lg"
                      >
                        ⏹️ Detener
                      </Button>
                      {cameras.length > 1 && (
                        <Button
                          onClick={switchCamera}
                          variant="secondary"
                          className="text-base sm:text-lg py-5 sm:py-6"
                          size="lg"
                          title="Cambiar cámara"
                        >
                          🔄
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {/* Botón de archivar (solo para copistas) */}
                {session.user.role === 'copista' && (
                  <Button
                    onClick={handleArchivar}
                    disabled={!lastDocumentId || isArchiving}
                    variant="secondary"
                    className="w-full text-base sm:text-lg py-5 sm:py-6"
                    size="lg"
                  >
                    {isArchiving ? '⏳ Archivando...' : '📁 Archivar Documento'}
                  </Button>
                )}
              </div>

              {/* Información adicional */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">💡 Instrucciones:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Permite el acceso a la cámara cuando el navegador lo solicite</li>
                  <li>• Escanea el QR para registrar el documento</li>
                  {['oficial', 'copista', 'contabilidad'].includes(session.user.role) && (
                    <li>• Selecciona el trámite correspondiente en el modal</li>
                  )}
                  {session.user.role === 'copista' && (
                    <li>• Usa &quot;Archivar&quot; para marcar un documento como archivado</li>
                  )}
                  <li>• Mantén el QR dentro del marco de enfoque</li>
                  <li>• La ubicación se actualizará automáticamente</li>
                  {cameras.length > 1 && (
                    <li>• Usa el botón 🔄 para cambiar de cámara mientras escaneas</li>
                  )}
                </ul>
              </div>

              {/* Ayuda para problemas */}
              {message.includes('⚠️') && (
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg space-y-3">
                  <h3 className="font-medium mb-2 text-yellow-800 dark:text-yellow-200">🔧 Soluciones paso a paso:</h3>
                  <ol className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2 list-decimal list-inside">
                    <li><strong>Cierra otras pestañas</strong> que usen la cámara:
                      <ul className="ml-6 mt-1 space-y-1 list-disc list-inside">
                        <li>WhatsApp Web</li>
                        <li>Google Meet / Zoom / Teams</li>
                        <li>Otras páginas de esta app</li>
                      </ul>
                    </li>
                    <li><strong>Cierra aplicaciones de escritorio</strong> que usen la cámara:
                      <ul className="ml-6 mt-1 space-y-1 list-disc list-inside">
                        <li>Skype, Discord, OBS</li>
                        <li>Aplicaciones de videoconferencia</li>
                      </ul>
                    </li>
                    <li><strong>Recarga esta página</strong> (F5 o Ctrl+R)</li>
                    <li><strong>Verifica permisos:</strong> Haz clic en el 🔒 en la barra de direcciones → Permisos del sitio → Cámara → Permitir</li>
                    {cameras.length > 1 && (
                      <li><strong>Prueba con otra cámara</strong> usando el selector de arriba</li>
                    )}
                    <li>Si nada funciona, <strong>reinicia el navegador</strong> completamente</li>
                  </ol>
                  
                  <Button
                    onClick={runDiagnostics}
                    variant="outline"
                    className="w-full text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700"
                  >
                    🔍 Ejecutar Diagnóstico Completo
                  </Button>
                </div>
              )}

              {/* Información de diagnóstico */}
              {diagnosticInfo && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 text-blue-800 dark:text-blue-200">📊 Diagnóstico del Sistema:</h3>
                  <pre className="text-xs text-blue-700 dark:text-blue-300 whitespace-pre-wrap font-mono">
                    {diagnosticInfo}
                  </pre>
                  <Button
                    onClick={() => setDiagnosticInfo('')}
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700"
                  >
                    Cerrar
                  </Button>
                </div>
              )}

              {/* Tu despacho actual */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Tu despacho:
                </p>
                <p className="text-lg font-semibold text-primary">
                  {session.user.despacho || 'No asignado'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de selección de ubicación/trámite */}
      <UbicacionModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSelect={handleModalSelect}
        role={session.user.role}
        documentNotario={pendingDocumentNotario}
      />
    </div>
  );
}
