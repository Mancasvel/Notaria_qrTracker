'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import VolumeChart from '@/components/VolumeChart';
import {
  QrCodeIcon,
  DocumentIcon,
  ChartBarIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  kpis: Array<{
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative';
  }>;
  weeklyActivity: Array<{
    name: string;
    expedientes: number;
    fullDate: string;
  }>;
  recentQRs: Array<{
    id: string;
    tipo: string;
    fecha: string;
    estado: string;
  }>;
}

export default function DashboardExtraPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchDashboardStats();
    }
  }, [session]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl">Dashboard Analytics</CardTitle>
              <CardDescription className="text-sm">
                Gestión y seguimiento de expedientes con códigos QR
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {/* KPI Cards */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
                  {stats.kpis.map((kpi, index) => (
                    <Card key={index}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {kpi.title}
                        </CardTitle>
                        <div className={`p-2 rounded-md ${
                          index === 0 ? 'bg-blue-100 text-blue-600' :
                          index === 1 ? 'bg-orange-100 text-orange-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {index === 0 ? <QrCodeIcon className="h-4 w-4" /> :
                           index === 1 ? <DocumentIcon className="h-4 w-4" /> :
                           <ChartBarIcon className="h-4 w-4" />}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{kpi.value}</div>
                        <p className={`text-xs ${
                          kpi.changeType === 'positive'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {kpi.change} desde ayer
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Chart and Recent QRs */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Volume Chart */}
                <div className="lg:col-span-2">
                  <Card>
              <CardHeader>
                <CardTitle>Actividad Semanal</CardTitle>
                <CardDescription>
                  Expedientes registrados por día en los últimos 7 días
                </CardDescription>
              </CardHeader>
                    <CardContent>
                      {stats && (
                        <div className="h-80">
                          <VolumeChart data={stats.weeklyActivity} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent QRs */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Últimos QRs Generados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {stats?.recentQRs.map((qr) => (
                          <div key={qr.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {qr.id}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {qr.tipo} • {qr.fecha}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                qr.estado === 'Activo'
                                  ? 'bg-green-100 text-green-800'
                                  : qr.estado === 'Archivado'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {qr.estado}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-2"
                                title="Imprimir QR"
                              >
                                <PrinterIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <Button variant="outline" className="w-full">
                          Ver todos los QRs
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
