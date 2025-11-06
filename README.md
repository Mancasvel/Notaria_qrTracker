# Gestión de Copias - Notaría

Sistema web avanzado para registrar y gestionar copias de documentos en una notaría con trazabilidad mediante códigos QR y ubicación por despacho. Construido con Next.js 15, TailwindCSS, MongoDB Atlas y NextAuth.

## 🚀 Características

- **Autenticación por roles**: Admin, Copias, Gestión y Oficiales
- **Registro de copias con QR**: Generación automática de códigos QR únicos
- **Escaneo QR con cámara**: Actualización automática de ubicación por despacho
- **Vista detalle de documentos**: Información completa con observaciones editables
- **Dashboard administrativo**: Consulta y filtros avanzados
- **PWA (Progressive Web App)**: Funciona offline, instalación en móviles
- **Tema claro/oscuro**: Interfaz moderna y minimalista
- **Responsive**: Funciona en móvil y desktop
- **Deploy en Vercel**: Optimizado para la plataforma

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS con tema personalizado
- **Base de datos**: MongoDB Atlas con Mongoose
- **Autenticación**: NextAuth.js con credenciales
- **Despliegue**: Vercel

## 📋 Requisitos Previos

- Node.js 18+
- MongoDB Atlas account
- Cuenta de Vercel (opcional para deploy)

## 🏁 Instalación y Configuración

1. **Clona el repositorio**
   ```bash
   git clone <url-del-repo>
   cd gestion_copias
   ```

2. **Instala dependencias**
   ```bash
   npm install
   ```

3. **Configura variables de entorno**
   Crea un archivo `.env.local` en la raíz del proyecto (usa `.env.example` como plantilla):
   ```env
   # Base de datos MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notaria?retryWrites=true&w=majority

   # NextAuth configuración
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=tu-secreto-super-seguro-aqui-de-al-menos-32-caracteres

   # Para producción en Vercel
   # NEXTAUTH_URL=https://tu-app.vercel.app
   ```

4. **Inicializa la base de datos** (opcional - incluye datos de prueba)
   ```bash
   npm run seed
   ```

5. **Ejecuta el servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Abre [http://localhost:3000](http://localhost:3000)**

## 👥 Cuentas de Prueba

Después de ejecutar `npm run seed`, se generarán automáticamente usuarios con contraseñas seguras aleatorias. Las credenciales se mostrarán **una sola vez** en la terminal.

**⚠️ IMPORTANTE**: 
- Guarda las credenciales en un gestor de contraseñas seguro
- Cambia las contraseñas después del primer login en producción
- Nunca compartas las credenciales en repositorios públicos

Los usuarios creados son:
- **Admin** (DESPACHO_ADMIN)
- **Copias** (DESPACHO1)
- **Copias 2** (DESPACHO2)
- **Gestión** (DESPACHO_GESTION)
- **Oficial** (DESPACHO_OFICIAL)

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # NextAuth configuración
│   │   └── registros/     # API de registros
│   ├── dashboard/         # Página de admin
│   ├── login/            # Página de login
│   ├── registrar/        # Página de copias
│   └── layout.tsx        # Layout principal
├── components/            # Componentes React
│   ├── ui/               # Componentes base (Button, Input, etc.)
│   ├── Header.tsx        # Header con navegación
│   ├── Providers.tsx     # Providers de contexto
│   └── ThemeToggle.tsx   # Toggle de tema
├── lib/                  # Utilidades
│   ├── mongodb.ts        # Conexión a MongoDB
│   ├── utils.ts          # Funciones helper
│   └── types.ts          # Tipos TypeScript
├── models/               # Modelos de MongoDB
│   ├── Usuario.ts        # Modelo de usuario
│   └── Registro.ts       # Modelo de registro
└── scripts/              # Scripts de utilidad
    └── seed.ts           # Inicialización de BD
```

## 🚀 Despliegue en Vercel

1. **Conecta tu repositorio a Vercel**

2. **Configura variables de entorno en Vercel**:
   - `MONGODB_URI`
   - `NEXTAUTH_URL` (URL de tu app en Vercel)
   - `NEXTAUTH_SECRET`

3. **Deploy automático** - Vercel detectará automáticamente Next.js

## 📊 Modelo de Datos

### Usuario
```typescript
{
  email: string;
  nombre: string;
  rol: 'admin' | 'copias' | 'gestion' | 'oficial';
  despacho: string;            // ej. 'DESPACHO1', 'DESPACHO_MARTA'
  passwordHash: string;
}
```

### Registro
```typescript
{
  numero: string;              // Número de protocolo
  tipo: 'copia_simple' | 'presentacion_telematica';
  hecha: boolean;              // Estado del documento
  notario: 'MAPE' | 'MCVF';
  usuario: string;             // Nombre del copista
  fecha: Date;
  ubicacion: string;           // Despacho actual del documento
  qrCodeUrl: string;           // URL del QR generado
  observaciones: string;       // Notas (máximo 255 caracteres)
}
```

## 📱 Funcionalidades QR y PWA

### 🏷️ Sistema de Códigos QR
- **Generación automática**: QR único por documento con enlace directo
- **Impresión**: Diseño optimizado para impresión en hojas A4
- **Escaneo**: Lectura con cámara del dispositivo móvil
- **Actualización automática**: Ubicación se actualiza al despacho del usuario

### 📱 Progressive Web App (PWA)
- **Instalación**: Se puede instalar en móviles como app nativa
- **Offline**: Funciona sin conexión a internet
- **Camera API**: Acceso directo a la cámara para escanear QR
- **Responsive**: Optimizado para uso táctil

### 🔄 Flujo de Trazabilidad
1. **Registro**: Copista crea documento → QR generado automáticamente
2. **Impresión**: QR se imprime y pega en el documento físico
3. **Movimiento**: Cualquier usuario escanea QR → ubicación actualizada
4. **Consulta**: Dashboard muestra ubicación en tiempo real
5. **Observaciones**: Notas editables por cualquier usuario autorizado

## 🎨 Tema y UI

- **Tipografía**: Inter
- **Colores**: Sistema de colores consistente
- **Componentes**: Minimalistas y funcionales
- **Responsive**: Mobile-first approach

## 🔒 Seguridad

Esta aplicación implementa múltiples capas de seguridad:

### Autenticación y Autorización
- **NextAuth.js**: Autenticación basada en JWT con sesiones seguras
- **Protección de rutas**: Middleware que valida autenticación y roles
- **Control de acceso basado en roles**: Admin, Copias, Gestión, Oficial
- **Hashing de contraseñas**: bcrypt con 12 rondas de salt

### Validación y Sanitización
- **Validación de entrada**: Todos los datos de usuario son validados
- **Sanitización de strings**: Eliminación de caracteres peligrosos (XSS)
- **Validación de ObjectId**: Prevención de inyección NoSQL
- **Límites de longitud**: Protección contra ataques de buffer

### Headers de Seguridad
- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY (protección contra clickjacking)
- **X-XSS-Protection**: Activado
- **Content-Security-Policy**: Política estricta de contenido
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Permisos limitados de cámara/micrófono

### Base de Datos
- **MongoDB Atlas**: Conexión cifrada con TLS
- **Validación de esquemas**: Mongoose con validadores
- **Índices optimizados**: Mejora de rendimiento y seguridad
- **Nombre de BD**: `notaria` (no usar `test` en producción)

### Mejores Prácticas
- Variables de entorno para secretos
- Contraseñas aleatorias generadas criptográficamente
- Logs sin información sensible
- Rate limiting básico implementado
- Sin claves hardcodeadas en el código

### Recomendaciones para Producción
1. **Cambia todas las contraseñas** después del primer login
2. **Usa HTTPS** siempre (Vercel lo proporciona automáticamente)
3. **Configura MongoDB Atlas** con IP whitelisting
4. **Habilita 2FA** en cuentas administrativas
5. **Monitorea logs** regularmente
6. **Actualiza dependencias** periódicamente con `npm audit`
7. **Backups regulares** de la base de datos

## 📝 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linting
- `npm run seed` - Inicializar base de datos con datos de prueba

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
