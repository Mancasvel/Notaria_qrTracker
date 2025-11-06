'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Header } from '@/components/Header';

export default function RegistrarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [numero, setNumero] = useState('');
  const [tipo, setTipo] = useState<'copia_simple' | 'presentacion_telematica'>('copia_simple');
  const [notario, setNotario] = useState<'MAPE' | 'MCVF'>('MAPE');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [generatedQR, setGeneratedQR] = useState<string>('');

  // Redirect if not authenticated or not copias role
  if (status === 'loading') {
    return <div>Cargando...</div>;
  }

  if (!session || session.user.role !== 'copias') {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/registros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numero: numero.trim(),
          tipo,
          notario,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Registrado correctamente');
        setGeneratedQR(data.registro.qrCodeUrl);
        // Limpiar formulario
        setNumero('');
        setTipo('copia_simple');
        setNotario('MAPE');
      } else {
        alert(data.error || 'Error al registrar');
      }
    } catch {
      setMessage('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl">Registrar Copia</CardTitle>
              <CardDescription className="text-sm">
                Ingresa los datos del documento a registrar
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="numero" className="text-sm font-medium">
                    Número de protocolo
                  </label>
                  <Input
                    id="numero"
                    type="text"
                    placeholder="Ej: 2024-001234"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="tipo" className="text-sm font-medium">
                    Tipo de documento
                  </label>
                  <Select
                    id="tipo"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as 'copia_simple' | 'presentacion_telematica')}
                    disabled={isLoading}
                  >
                    <option value="copia_simple">Copia simple</option>
                    <option value="presentacion_telematica">Presentación telemática</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="notario" className="text-sm font-medium">
                    Notario
                  </label>
                  <Select
                    id="notario"
                    value={notario}
                    onChange={(e) => setNotario(e.target.value as 'MAPE' | 'MCVF')}
                    disabled={isLoading}
                  >
                    <option value="MAPE">MAPE</option>
                    <option value="MCVF">MCVF</option>
                  </Select>
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

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !numero.trim()}
                >
                  {isLoading ? 'Registrando...' : 'Registrar'}
                </Button>
              </form>

              {/* QR Code generado */}
              {generatedQR && (
                <div className="mt-6 pt-6 border-t space-y-4">
                  <h3 className="text-lg font-medium text-center">🎉 Documento registrado</h3>
                  <div className="flex flex-col items-center space-y-4">
                    <Image
                      src={generatedQR}
                      alt="Código QR generado"
                      width={192}
                      height={192}
                      className="border rounded-lg shadow-sm"
                      unoptimized
                    />
                    <p className="text-sm text-muted-foreground text-center">
                      Imprime este QR y pégalo en el documento físico
                    </p>
                    <Button
                      onClick={() => window.print()}
                      variant="outline"
                      className="w-full"
                    >
                      🖨️ Imprimir QR
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
