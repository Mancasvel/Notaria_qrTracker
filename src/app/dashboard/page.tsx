'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Header } from '@/components/Header';
import { Registro, FiltrosDashboard } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosDashboard>({});

  const fetchRegistros = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.numero) params.append('numero', filtros.numero);
      if (filtros.notario) params.append('notario', filtros.notario);
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (filtros.estado !== undefined) params.append('estado', filtros.estado.toString());

      const response = await fetch(`/api/registros?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRegistros(data);
      }
    } catch (error) {
      console.error('Error fetching registros:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    if (session?.user.role === 'admin') {
      fetchRegistros();
    }
  }, [fetchRegistros, session]);

  // Redirect if not authenticated or not admin role
  if (status === 'loading') {
    return <div>Cargando...</div>;
  }

  if (!session || session.user.role !== 'admin') {
    router.push('/login');
    return null;
  }

  const handleEstadoChange = async (id: string, nuevoEstado: boolean) => {
    try {
      const response = await fetch(`/api/registros/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hecha_presentacion_telematica: nuevoEstado }),
      });

      if (response.ok) {
        // Actualizar el registro localmente
        setRegistros(prev =>
          prev.map(reg =>
            reg._id === id
              ? { ...reg, hecha_presentacion_telematica: nuevoEstado }
              : reg
          )
        );
      }
    } catch (error) {
      console.error('Error updating registro:', error);
    }
  };

  const clearFiltros = () => {
    setFiltros({});
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl">Dashboard de Registros</CardTitle>
              <CardDescription className="text-sm">
                Consulta y administra todos los registros de copias
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {/* Filtros */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Número de protocolo</label>
                    <Input
                      placeholder="Buscar por número..."
                      value={filtros.numero || ''}
                      onChange={(e) => setFiltros(prev => ({ ...prev, numero: e.target.value || undefined }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notario</label>
                    <Select
                      value={filtros.notario || ''}
                      onChange={(e) => setFiltros(prev => ({
                        ...prev,
                        notario: e.target.value as 'MAPE' | 'MCVF' || undefined
                      }))}
                    >
                      <option value="">Todos</option>
                      <option value="MAPE">MAPE</option>
                      <option value="MCVF">MCVF</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <Select
                      value={filtros.tipo || ''}
                      onChange={(e) => setFiltros(prev => ({
                        ...prev,
                        tipo: e.target.value as 'copia_simple' | 'presentacion_telematica' || undefined
                      }))}
                    >
                      <option value="">Todos</option>
                      <option value="copia_simple">Copia simple</option>
                      <option value="presentacion_telematica">Presentación telemática</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado</label>
                    <Select
                      value={filtros.estado === undefined ? '' : filtros.estado.toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFiltros(prev => ({
                          ...prev,
                          estado: value === '' ? undefined : value === 'true'
                        }));
                      }}
                    >
                      <option value="">Todos</option>
                      <option value="true">Hecha</option>
                      <option value="false">Pendiente</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ubicación</label>
                    <Input
                      placeholder="Buscar por ubicación..."
                      value={filtros.ubicacion || ''}
                      onChange={(e) => setFiltros(prev => ({ ...prev, ubicacion: e.target.value || undefined }))}
                    />
                  </div>
                </div>

              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <Button onClick={fetchRegistros} disabled={isLoading} className="w-full sm:w-auto">
                  Actualizar
                </Button>
                <Button variant="outline" onClick={clearFiltros} className="w-full sm:w-auto">
                  Limpiar filtros
                </Button>
              </div>

              {/* Tabla - Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-3 font-medium">Nº Protocolo</th>
                      <th className="text-left p-3 font-medium">Copista</th>
                      <th className="text-left p-3 font-medium">Tipo</th>
                      <th className="text-left p-3 font-medium">Estado</th>
                      <th className="text-left p-3 font-medium">Notario</th>
                      <th className="text-left p-3 font-medium">Ubicación</th>
                      <th className="text-left p-3 font-medium">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="text-center p-8">
                          Cargando...
                        </td>
                      </tr>
                    ) : registros.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center p-8 text-muted-foreground">
                          No se encontraron registros
                        </td>
                      </tr>
                    ) : (
                      registros.map((registro) => (
                        <tr key={registro._id} className="border-b border-border hover:bg-muted/50">
                          <td className="p-3 font-mono">
                            <button
                              onClick={() => router.push(`/documento/${registro._id}`)}
                              className="text-primary hover:underline"
                            >
                              {registro.numero}
                            </button>
                          </td>
                          <td className="p-3">{registro.usuario}</td>
                          <td className="p-3">
                            {registro.tipo === 'copia_simple' ? 'Copia simple' : 'Presentación telemática'}
                          </td>
                          <td className="p-3">
                            <Checkbox
                              checked={registro.hecha}
                              onChange={(e) => handleEstadoChange(registro._id, e.target.checked)}
                            />
                          </td>
                          <td className="p-3">{registro.notario}</td>
                          <td className="p-3">{registro.ubicacion || 'Sin asignar'}</td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {format(new Date(registro.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Vista de tarjetas - Móvil */}
              <div className="md:hidden space-y-3">
                {isLoading ? (
                  <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Cargando...</p>
                  </div>
                ) : registros.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    No se encontraron registros
                  </div>
                ) : (
                  registros.map((registro) => (
                    <Card key={registro._id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <button
                            onClick={() => router.push(`/documento/${registro._id}`)}
                            className="text-base font-mono font-semibold text-primary hover:underline"
                          >
                            {registro.numero}
                          </button>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            registro.hecha
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          }`}>
                            {registro.hecha ? 'Hecha' : 'Pendiente'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Copista:</span>
                            <p className="font-medium">{registro.usuario}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Notario:</span>
                            <p className="font-medium">{registro.notario}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tipo:</span>
                            <p className="font-medium">
                              {registro.tipo === 'copia_simple' ? 'Copia simple' : 'Presentación'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Ubicación:</span>
                            <p className="font-medium">{registro.ubicacion || 'Sin asignar'}</p>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          {format(new Date(registro.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {!isLoading && registros.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground text-center md:text-left">
                  {registros.length} registro{registros.length !== 1 ? 's' : ''} encontrado{registros.length !== 1 ? 's' : ''}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
