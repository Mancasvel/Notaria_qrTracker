'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QrCodeIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function InicioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Bienvenida */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold">Bienvenido, {session.user.name}</h1>
            <p className="text-muted-foreground">
              {session.user.despacho} · {session.user.role === 'gestion' ? 'Gestión' : session.user.role === 'oficial' ? 'Oficial' : session.user.role}
            </p>
          </div>

          {/* Tarjetas de acceso rápido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Escanear QR */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/escanear')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <QrCodeIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Escanear QR</CardTitle>
                    <CardDescription>Actualizar ubicación de documentos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Usa la cámara para escanear códigos QR y actualizar automáticamente la ubicación de los documentos a tu despacho.
                </p>
              </CardContent>
            </Card>

            {/* Información del usuario */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <UserCircleIcon className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <CardTitle>Tu Información</CardTitle>
                    <CardDescription>Datos de tu cuenta</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{session.user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rol</p>
                  <p className="text-sm capitalize">
                    {session.user.role === 'gestion' ? 'Gestión' : session.user.role === 'oficial' ? 'Oficial' : session.user.role}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Despacho</p>
                  <p className="text-sm">{session.user.despacho}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instrucciones */}
          <Card>
            <CardHeader>
              <CardTitle>¿Cómo usar el sistema?</CardTitle>
              <CardDescription>Guía rápida de uso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium">Escanea el código QR</p>
                  <p className="text-sm text-muted-foreground">
                    Usa el menú de navegación (☰) para acceder a &quot;Escanear QR&quot; y activa la cámara de tu dispositivo.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium">Apunta al código QR del documento</p>
                  <p className="text-sm text-muted-foreground">
                    Centra el código QR en el recuadro de la cámara para escanearlo automáticamente.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium">Ubicación actualizada</p>
                  <p className="text-sm text-muted-foreground">
                    El sistema actualizará automáticamente la ubicación del documento a tu despacho ({session.user.despacho}).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acceso rápido */}
          <div className="flex justify-center">
            <Button
              onClick={() => router.push('/escanear')}
              size="lg"
              className="text-lg px-8"
            >
              <QrCodeIcon className="h-5 w-5 mr-2" />
              Comenzar a escanear
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

