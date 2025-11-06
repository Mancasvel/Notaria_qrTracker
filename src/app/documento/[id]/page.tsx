'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Header } from '@/components/Header';
import { Registro } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DocumentoDetailPage({ params }: PageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [registro, setRegistro] = useState<Registro | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [id, setId] = useState<string>('');

  useEffect(() => {
    params.then((resolved) => setId(resolved.id));
  }, [params]);

  const fetchRegistro = useCallback(async () => {
    if (!id) return;

    try {
      const response = await fetch(`/api/registros/${id}`);
      if (response.ok) {
        const data = await response.json();
        setRegistro(data);
        setObservaciones(data.observaciones || '');
      } else {
        setMessage('Documento no encontrado');
      }
    } catch {
      setMessage('Error al cargar el documento');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const handleSaveObservaciones = async () => {
    if (!registro) return;

    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch(`/api/registros/${registro._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ observaciones }),
      });

      if (response.ok) {
        setMessage('✅ Observaciones guardadas correctamente');
        // Actualizar el registro local
        setRegistro(prev => prev ? { ...prev, observaciones } : null);
      } else {
        const error = await response.json();
        setMessage(error.error || 'Error al guardar observaciones');
      }
    } catch {
      setMessage('Error de conexión');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRegistro();
    }
  }, [fetchRegistro]);

  // Redirect if not authenticated
  if (status === 'loading') {
    return <div>Cargando...</div>;
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!registro) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Documento no encontrado</h1>
            <Button onClick={() => router.back()}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="self-start">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Documento {registro.numero}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Información del documento */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Documento</CardTitle>
                <CardDescription>
                  Detalles completos del registro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Número</label>
                    <p className="text-lg font-mono">{registro.numero}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                    <p className="text-lg">
                      {registro.tipo === 'copia_simple' ? 'Copia simple' : 'Presentación telemática'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Estado</label>
                    <p className={`text-lg ${registro.hecha ? 'text-green-600' : 'text-orange-600'}`}>
                      {registro.hecha ? 'Hecha' : 'Pendiente'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notario</label>
                    <p className="text-lg">{registro.notario}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Copista</label>
                    <p className="text-lg">{registro.usuario}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fecha</label>
                    <p className="text-lg">
                      {format(new Date(registro.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-muted-foreground">Ubicación actual</label>
                  <p className="text-xl font-semibold text-primary">{registro.ubicacionActual || 'Sin asignar'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Historial de ubicaciones */}
            {registro.historialUbicaciones && registro.historialUbicaciones.length > 0 && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recorrido del Documento</CardTitle>
                  <CardDescription>
                    Historial completo de ubicaciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {registro.historialUbicaciones.map((ubicacion, index) => (
                      <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                          {registro.historialUbicaciones.length - index}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">{ubicacion.lugar}</p>
                            {index === 0 && (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                                Actual
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">Por: {ubicacion.usuario}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(ubicacion.fecha), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                          </p>
                        </div>
                      </div>
                    )).reverse()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* QR Code */}
            <Card>
              <CardHeader>
                <CardTitle>Código QR</CardTitle>
                <CardDescription>
                  Código único del documento
                </CardDescription>
              </CardHeader>
              <CardContent>
                {registro.qrCodeUrl ? (
                  <div className="flex flex-col items-center space-y-4">
                    <Image
                      src={registro.qrCodeUrl}
                      alt={`QR Code para ${registro.numero}`}
                      width={192}
                      height={192}
                      className="border rounded-lg"
                      unoptimized
                    />
                    <Button
                      onClick={() => window.print()}
                      className="w-full"
                    >
                      🖨️ Imprimir QR
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-muted-foreground">
                    QR no disponible
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Observaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Observaciones</CardTitle>
              <CardDescription>
                Notas adicionales sobre el documento (máximo 255 caracteres)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="w-full min-h-[120px] p-3 border border-input rounded-md bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Añade observaciones sobre este documento..."
                maxLength={255}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {observaciones.length}/255 caracteres
                </span>
                <Button
                  onClick={handleSaveObservaciones}
                  disabled={isSaving || observaciones.length > 255}
                >
                  {isSaving ? 'Guardando...' : '💾 Guardar cambios'}
                </Button>
              </div>

              {message && (
                <div className={`text-sm text-center p-2 rounded ${
                  message.startsWith('✅')
                    ? 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400'
                    : 'text-destructive bg-destructive/10'
                }`}>
                  {message}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Hidden QR container for printing */}
        {registro.qrCodeUrl && (
          <div className="qr-print-container" style={{ display: 'none' }}>
            <Image
              src={registro.qrCodeUrl}
              alt={`QR Code para documento ${registro.numero}`}
              width={400}
              height={400}
              unoptimized
            />
            <div className="protocol-number">
              Protocolo: {registro.numero}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
