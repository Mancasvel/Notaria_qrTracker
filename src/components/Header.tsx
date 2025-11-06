'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { 
  ArrowRightOnRectangleIcon, 
  QrCodeIcon,
  Bars3Icon,
  DocumentPlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel } from '@/components/ui/DropdownMenu';

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  if (!session) {
    return null;
  }

  // Definir las secciones disponibles según el rol
  const getMenuItems = () => {
    const role = session.user.role;
    const items = [];

    // Admin tiene acceso al dashboard
    if (role === 'admin') {
      items.push({
        label: 'Dashboard',
        icon: <ChartBarIcon className="h-4 w-4" />,
        path: '/dashboard',
      });
    }

    // Copistas y oficiales pueden registrar documentos
    if (role === 'copias' || role === 'oficial') {
      items.push({
        label: 'Registrar Documento',
        icon: <DocumentPlusIcon className="h-4 w-4" />,
        path: '/registrar',
      });
    }

    // Gestión tiene página de inicio
    if (role === 'gestion') {
      items.push({
        label: 'Inicio',
        icon: <ChartBarIcon className="h-4 w-4" />,
        path: '/inicio',
      });
    }

    // Todos los usuarios pueden escanear
    items.push({
      label: 'Escanear QR',
      icon: <QrCodeIcon className="h-4 w-4" />,
      path: '/escanear',
    });

    return items;
  };

  const menuItems = getMenuItems();

  // Obtener la página actual para mostrar en el título
  const getCurrentPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/registrar') return 'Registrar';
    if (pathname === '/escanear') return 'Escanear';
    if (pathname === '/inicio') return 'Inicio';
    if (pathname?.startsWith('/documento/')) return 'Documento';
    return 'Notaría';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex h-14 items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Menú desplegable */}
            <DropdownMenu
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <Bars3Icon className="h-5 w-5" />
                </Button>
              }
            >
              <DropdownMenuLabel>Navegación</DropdownMenuLabel>
              {menuItems.map((item) => (
                <DropdownMenuItem
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  icon={item.icon}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenu>

            <h1 className="text-base sm:text-lg font-semibold truncate">
              <span className="hidden md:inline">Gestión Documental — Notaría</span>
              <span className="md:hidden">{getCurrentPageTitle()}</span>
            </h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className="hidden lg:block">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {session.user.name} · {session.user.despacho}
              </span>
            </div>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-muted-foreground hover:text-foreground"
              title="Cerrar sesión"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
