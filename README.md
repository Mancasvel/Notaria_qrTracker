[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com//Mancasvel/Notaria_qrTracker)   
![Last Commit](https://img.shields.io/github/last-commit/Mancasvel/Notaria_qrTracker)  
![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)   
![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?logo=next.js)  
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?logo=mongodb)
# Gestión Documental - Notaría

Sistema web avanzado para registrar y gestionar documentos en una notaría con trazabilidad completa mediante códigos QR, historial de ubicaciones y gestión por despacho. Construido con Next.js 15, TailwindCSS, MongoDB Atlas y NextAuth.

## 🚀 Características Principales

- **Autenticación por roles**: Admin, Copias, Gestión y Oficiales con permisos específicos
- **Registro de documentos con QR**: Generación automática de códigos QR únicos por documento
- **Escaneo QR con cámara**: Actualización automática de ubicación por despacho usando PWA
- **Historial completo de ubicaciones**: Trazabilidad total del recorrido de cada documento
- **Vista detalle enriquecida**: Información completa con observaciones editables y recorrido visual
- **Dashboard administrativo**: Consulta, filtros avanzados y función de archivo
- **Función de archivar**: Copias pueden marcar documentos como archivados
- **PWA (Progressive Web App)**: Funciona offline, instalación en móviles, acceso a cámara
- **Tema claro/oscuro**: Interfaz moderna y minimalista tipo Linear/Notion
- **Totalmente responsive**: Optimizado para móvil, tablet y desktop con vistas adaptativas
- **Deploy en Vercel**: Optimizado para producción

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS con tema personalizado y sistema de diseño consistente
- **Base de datos**: MongoDB Atlas con Mongoose (base de datos: `notaria`)
- **Autenticación**: NextAuth.js con JWT y credenciales seguras
- **QR Codes**: `qrcode` para generación, `html5-qrcode` para escaneo
- **PWA**: Manifest, Service Workers, Camera API
- **Despliegue**: Vercel con optimizaciones de producción

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
│   │   ├── registros/     # API de registros CRUD
│   │   ├── escanear/      # API de escaneo QR
│   │   └── archivar/      # API de archivado
│   ├── dashboard/         # Página de admin con filtros y tabla
│   ├── documento/[id]/    # Vista detalle con historial completo
│   ├── escanear/          # Página de escaneo QR con cámara
│   ├── inicio/            # Página de inicio para gestión/oficiales
│   ├── login/             # Página de login
│   ├── registrar/         # Página de registro de documentos
│   └── layout.tsx         # Layout principal con metadata PWA
├── components/            # Componentes React
│   ├── ui/                # Componentes base reutilizables
│   │   ├── Button.tsx     # Botón con variantes
│   │   ├── Card.tsx       # Tarjetas de contenido
│   │   ├── Input.tsx      # Input de texto
│   │   ├── Select.tsx     # Selector dropdown
│   │   ├── Checkbox.tsx   # Checkbox personalizado
│   │   └── DropdownMenu.tsx # Menú desplegable
│   ├── Header.tsx         # Header con menú responsive
│   ├── Providers.tsx      # Providers de contexto (NextAuth, Theme)
│   └── ThemeToggle.tsx    # Toggle de tema claro/oscuro
├── lib/                   # Utilidades y configuración
│   ├── mongodb.ts         # Conexión a MongoDB con cache
│   ├── qr.ts              # Generación de códigos QR
│   ├── auth-types.ts      # Tipos extendidos de NextAuth
│   ├── security.ts        # Utilidades de seguridad
│   ├── utils.ts           # Funciones helper
│   └── types.ts           # Tipos TypeScript globales
├── models/                # Modelos de MongoDB (Mongoose)
│   ├── Usuario.ts         # Modelo de usuario con roles
│   └── Registro.ts        # Modelo de registro con historial
└── scripts/               # Scripts de utilidad
    └── seed.ts            # Inicialización de BD con datos de prueba
middleware.ts              # Middleware de autenticación y seguridad
public/
├── manifest.json          # Manifest PWA
└── icon-*.png             # Iconos de la aplicación
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
  createdAt: Date;
  updatedAt: Date;
}
```

### Registro
```typescript
{
  numero: string;              // Número de protocolo (formato: YYYY-NNNNN)
  tipo: 'copia_simple' | 'presentacion_telematica';
  hecha: boolean;              // Estado del documento
  notario: 'MAPE' | 'MCVF';
  usuario: string;             // Nombre del copista que creó el registro
  fecha: Date;                 // Fecha de creación
  ubicacionActual: string;     // Despacho actual del documento
  historialUbicaciones: [      // Historial completo de movimientos
    {
      lugar: string;           // Nombre del despacho
      usuario: string;         // Usuario que realizó el movimiento
      fecha: Date;             // Fecha y hora del movimiento
    }
  ];
  qrCodeUrl: string;           // Data URL del QR generado (base64)
  observaciones: string;       // Notas editables (máximo 255 caracteres)
  createdAt: Date;
  updatedAt: Date;
}
```

### Índices de Base de Datos
Para optimizar las consultas, se han creado índices en:
- `registros.numero` (único)
- `registros.notario`
- `registros.usuario`
- `registros.hecha`
- `registros.ubicacionActual`
- `registros.fecha` (descendente)

## 📱 Funcionalidades Avanzadas

### 🏷️ Sistema de Códigos QR
- **Generación automática**: QR único por documento con enlace directo a `/documento/[id]`
- **Formato**: Data URL (base64) almacenado en la base de datos
- **Impresión**: Botón de impresión con diseño optimizado para hojas A4
- **Escaneo**: Lectura con cámara del dispositivo móvil usando `html5-qrcode`
- **Actualización automática**: Al escanear, la ubicación se actualiza al despacho del usuario
- **Validación**: Verificación de QR válidos y documentos existentes

### 📱 Progressive Web App (PWA)
- **Instalación**: Se puede instalar en móviles como app nativa
- **Manifest**: Configuración completa con iconos y colores de tema
- **Offline**: Funciona sin conexión a internet (rutas cacheadas)
- **Camera API**: Acceso directo a la cámara para escanear QR
- **Responsive**: Optimizado para uso táctil con botones grandes
- **Permisos**: Gestión de permisos de cámara con mensajes claros

### 🔄 Flujo de Trazabilidad Completo
1. **Registro**: Copista u Oficial crea documento → QR generado automáticamente
   - El número de protocolo se inicializa con el año actual (ej: `2025-`)
   - Se crea la primera entrada en el historial de ubicaciones
2. **Impresión**: QR se imprime y pega en el documento físico
   - Botón de impresión disponible inmediatamente después del registro
3. **Movimiento**: Cualquier usuario escanea QR → ubicación actualizada
   - Se registra: lugar, usuario y fecha/hora exacta del movimiento
   - El historial mantiene todas las ubicaciones previas
4. **Consulta**: Dashboard muestra ubicación actual en tiempo real
   - Filtros por ubicación, notario, tipo, estado, usuario
   - Vista de tabla en desktop, tarjetas en móvil
5. **Detalle**: Vista completa con historial visual de recorrido
   - Línea de tiempo con todos los movimientos
   - Indicador de ubicación actual
   - Observaciones editables por cualquier usuario autorizado
6. **Archivo**: Copias pueden archivar documentos completados
   - Marca como "hecha" y mueve a "ARCHIVO"
   - Registra el movimiento en el historial

### 👥 Permisos por Rol

| Funcionalidad | Admin | Copias | Oficial | Gestión |
|--------------|-------|--------|---------|---------|
| Ver Dashboard | ✅ | ❌ | ❌ | ❌ |
| Registrar documentos | ❌ | ✅ | ✅ | ❌ |
| Escanear QR | ✅ | ✅ | ✅ | ✅ |
| Ver detalles | ✅ | ✅ | ✅ | ✅ |
| Editar observaciones | ✅ | ✅ | ✅ | ✅ |
| Archivar documentos | ❌ | ✅ | ❌ | ❌ |
| Página de inicio | ❌ | ❌ | ✅ | ✅ |

## 🎨 Diseño y UX

### Estilo Visual
- **Tipografía**: Inter (variable font) para máxima legibilidad
- **Paleta de colores**: 
  - Primario: Azul (#3b82f6)
  - Secundario: Gris claro
  - Tema oscuro: Soporte completo con transiciones suaves
- **Componentes**: Minimalistas tipo Linear/Notion
  - Bordes redondeados (8px)
  - Sombras suaves y sutiles
  - Espaciado consistente (sistema de 4px)
- **Iconos**: Heroicons v2 (outline)

### Responsive Design
- **Mobile-first approach**: Diseñado primero para móvil
- **Breakpoints**:
  - `sm`: 640px (tablets pequeñas)
  - `md`: 768px (tablets)
  - `lg`: 1024px (laptops)
  - `xl`: 1280px (desktops)
- **Adaptaciones específicas**:
  - Header: Menú desplegable en móvil, navegación completa en desktop
  - Dashboard: Tarjetas en móvil, tabla en desktop
  - Formularios: Inputs y botones de tamaño táctil (mínimo 44px)
  - Espaciado: Márgenes reducidos en móvil, amplios en desktop

### Componentes UI Reutilizables
- **Button**: Variantes (default, ghost, outline) y tamaños (sm, md, lg)
- **Card**: Contenedor con header, content y description
- **Input**: Campo de texto con estados (focus, disabled, error)
- **Select**: Dropdown nativo estilizado
- **Checkbox**: Checkbox personalizado con animaciones
- **DropdownMenu**: Menú desplegable con posicionamiento inteligente

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

- `npm run dev` - Servidor de desarrollo (puerto 3000)
- `npm run build` - Build de producción con optimizaciones
- `npm run start` - Servidor de producción
- `npm run lint` - Linting con ESLint
- `npm run seed` - Inicializar base de datos con datos de prueba y usuarios

## 🆕 Novedades y Mejoras Recientes

### v2.0 - Trazabilidad Completa (Enero 2025)
- ✅ **Historial de ubicaciones**: Cada documento mantiene un registro completo de todos sus movimientos
- ✅ **Vista de recorrido**: Visualización cronológica del historial en la página de detalle
- ✅ **Función de archivar**: Los copistas pueden marcar documentos como archivados
- ✅ **Año automático en protocolo**: El campo de número se inicializa con el año actual (ej: `2025-`)
- ✅ **Permisos extendidos**: Oficiales ahora pueden crear registros
- ✅ **Menú responsive**: Navegación mejorada con dropdown adaptativo
- ✅ **Dashboard mejorado**: Vista de tarjetas en móvil, tabla en desktop
- ✅ **Página de inicio**: Nueva página para roles de gestión y oficiales
- ✅ **Nombre actualizado**: "Gestión Documental" en lugar de "Registro de Copias"

### v1.0 - Lanzamiento Inicial
- ✅ Sistema de autenticación con NextAuth
- ✅ Generación y escaneo de códigos QR
- ✅ PWA con soporte offline
- ✅ Dashboard administrativo
- ✅ Tema claro/oscuro
- ✅ Diseño responsive

## 🐛 Solución de Problemas

### La cámara no funciona
- Verifica que hayas dado permisos de cámara al navegador
- En iOS, asegúrate de usar Safari (Chrome no soporta Camera API en iOS)
- La aplicación debe estar en HTTPS (o localhost) para acceder a la cámara

### Error de conexión a MongoDB
- Verifica que `MONGODB_URI` esté correctamente configurado en `.env.local`
- Asegúrate de que tu IP esté en la whitelist de MongoDB Atlas
- Verifica que el nombre de la base de datos sea `notaria`

### El QR no se escanea
- Asegúrate de que el QR esté bien iluminado
- Mantén el QR dentro del recuadro de enfoque
- Verifica que el QR haya sido generado correctamente (debe apuntar a `/documento/[id]`)

### Error al hacer build
- Ejecuta `npm install` para asegurarte de que todas las dependencias estén instaladas
- Verifica que las variables de entorno estén configuradas
- Revisa que no haya errores de TypeScript con `npm run lint`

## 🔮 Roadmap

Funcionalidades planificadas para futuras versiones:

- [ ] **Notificaciones**: Sistema de notificaciones push para movimientos importantes
- [ ] **Búsqueda avanzada**: Búsqueda full-text en observaciones y números
- [ ] **Exportación**: Exportar registros a PDF/Excel
- [ ] **Estadísticas**: Dashboard con gráficos y métricas
- [ ] **Firma digital**: Integración con firma electrónica
- [ ] **API REST**: API pública para integraciones
- [ ] **Webhooks**: Notificaciones automáticas a sistemas externos
- [ ] **Auditoría**: Log completo de todas las acciones de usuarios
- [ ] **Multi-notaría**: Soporte para múltiples notarías en una sola instancia

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia y Derechos de Autor

### ⚖️ Licencia Propietaria

**© 2025 Manuel Castillejo. Todos los derechos reservados.**

Este software es **código propietario y confidencial**. El uso, copia, modificación, distribución o cualquier otra forma de explotación de este código está **estrictamente prohibido** sin la autorización expresa y por escrito del autor.

### 🔒 Restricciones de Uso

- ❌ **Prohibida la reproducción** total o parcial del código
- ❌ **Prohibida la distribución** sin licencia comercial
- ❌ **Prohibido el uso comercial** sin autorización
- ❌ **Prohibida la ingeniería inversa**
- ❌ **Prohibida la creación de trabajos derivados** sin permiso

### 💼 Licencia Comercial

Para obtener una **licencia comercial** que permita el uso de este software, contacta con:

**Manuel Castillejo**
- 📧 Email: [Tu email de contacto]
- 🌐 Web: [Tu sitio web]

### ⚠️ Aviso Legal

El uso no autorizado de este software constituye una **violación de los derechos de autor** y puede resultar en acciones legales civiles y penales según las leyes de propiedad intelectual aplicables.

---

**Desarrollado con ❤️ por Manuel Castillejo para modernizar la gestión documental notarial**



