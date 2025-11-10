# 📊 Esquema de Base de Datos - Gestión Documental Notaría

**Fecha de última actualización:** 10 de noviembre de 2025  
**Base de datos:** MongoDB Atlas  
**Nombre de la base de datos:** `notaria`

---

## 📑 Índice

1. [Colecciones](#colecciones)
2. [Modelo: usuarios](#modelo-usuarios)
3. [Modelo: registros](#modelo-registros)
4. [Índices](#índices)
5. [Relaciones](#relaciones)
6. [Valores Enumerados](#valores-enumerados)

---

## Colecciones

La base de datos contiene **2 colecciones principales**:

- `usuarios` - Gestión de usuarios del sistema
- `registros` - Gestión de documentos y su trazabilidad

---

## Modelo: usuarios

Almacena la información de los usuarios del sistema con autenticación basada en roles.

### Estructura

```typescript
interface IUsuario {
  _id: ObjectId;              // ID único generado por MongoDB
  email: string;              // Email único del usuario
  nombre: string;             // Nombre completo del usuario
  rol: string;                // Rol del usuario (ver roles disponibles)
  despacho: string;           // Ubicación/despacho asignado
  passwordHash: string;       // Contraseña hasheada con bcrypt
  createdAt: Date;            // Fecha de creación (automático)
  updatedAt: Date;            // Fecha de última actualización (automático)
}
```

### Campos Detallados

| Campo | Tipo | Requerido | Único | Descripción |
|-------|------|-----------|-------|-------------|
| `_id` | ObjectId | Sí (auto) | Sí | Identificador único de MongoDB |
| `email` | String | Sí | Sí | Email del usuario (lowercase, trimmed) |
| `nombre` | String | Sí | No | Nombre completo del usuario |
| `rol` | Enum | Sí | No | Rol del usuario en el sistema |
| `despacho` | String | Sí | No | Identificador del despacho/ubicación |
| `passwordHash` | String | Sí | No | Hash BCrypt de la contraseña (12 rounds) |
| `createdAt` | Date | Sí (auto) | No | Timestamp de creación |
| `updatedAt` | Date | Sí (auto) | No | Timestamp de última actualización |

### Roles Disponibles

```typescript
type Rol = 'admin' | 'oficial' | 'notario' | 'copista' | 'mostrador' | 'contabilidad' | 'gestion';
```

| Rol | Descripción | Permisos Principales |
|-----|-------------|---------------------|
| `admin` | Administrador del sistema | Acceso completo, gestión de usuarios |
| `oficial` | Personal oficial de notaría | Registrar documentos, escanear QR (modal: Matriz, Diligencia) |
| `notario` | Notario (MAPE o MCVF) | Escanear QR (actualización directa a su despacho) |
| `copista` | Personal de copias | Registrar documentos, escanear QR (modal: 1ª/2ª Presentación, Copia, Catastro, Archivo, Firma) |
| `mostrador` | Personal de mostrador | Escanear QR (actualización directa a MOSTRADOR) |
| `contabilidad` | Personal de contabilidad | Escanear QR (modal: Factura, Archivo, Firma) |
| `gestion` | Personal de gestión | Solo visualización de dashboard |

### Validaciones

- **email**: 
  - Formato válido de email
  - Convertido a minúsculas automáticamente
  - Sin espacios (trimmed)
  - Debe ser único en la colección

- **nombre**:
  - Sin espacios al inicio/final (trimmed)
  - Mínimo 1 carácter

- **rol**:
  - Debe ser uno de los valores enumerados
  - No puede ser modificado por el usuario

- **despacho**:
  - Sin espacios al inicio/final (trimmed)
  - Formato recomendado: `DESPACHO_NOMBRE`

- **passwordHash**:
  - Generado con bcrypt (12 rounds)
  - Nunca se expone en APIs

### Ejemplo de Documento

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "angela@notariadelpozo.com",
  "nombre": "Angela",
  "rol": "oficial",
  "despacho": "DESPACHO_ANGELA",
  "passwordHash": "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7BlNBdZaFy",
  "createdAt": "2025-11-10T08:30:00.000Z",
  "updatedAt": "2025-11-10T08:30:00.000Z"
}
```

---

## Modelo: registros

Almacena los documentos notariales con su historial completo de trazabilidad.

### Estructura

```typescript
interface IRegistro {
  _id: ObjectId;                    // ID único generado por MongoDB
  numero: string;                   // Número de protocolo (ej: "2025-0001")
  tipo: string;                     // Tipo de documento
  hecha: boolean;                   // Estado de finalización
  notario: string;                  // Notario asignado al documento
  usuario: string;                  // Nombre del usuario que creó el registro
  fecha: Date;                      // Fecha de creación del registro
  ubicacionActual: string;          // Ubicación actual del documento
  historialUbicaciones: Array<{     // Historial completo de movimientos
    lugar: string;                  // Ubicación del movimiento
    usuario: string;                // Usuario que realizó el movimiento
    fecha: Date;                    // Fecha y hora del movimiento
  }>;
  qrCodeUrl: string;                // URL del código QR generado
  observaciones: string;            // Notas adicionales (máx 255 caracteres)
  createdAt: Date;                  // Fecha de creación (automático)
  updatedAt: Date;                  // Fecha de última actualización (automático)
}
```

### Campos Detallados

| Campo | Tipo | Requerido | Índice | Descripción |
|-------|------|-----------|--------|-------------|
| `_id` | ObjectId | Sí (auto) | Primario | Identificador único de MongoDB |
| `numero` | String | Sí | Sí | Número de protocolo del documento |
| `tipo` | Enum | Sí | Sí | Tipo de documento notarial |
| `hecha` | Boolean | Sí | No | Indica si el documento está finalizado |
| `notario` | Enum | Sí | Sí | Notario responsable del documento |
| `usuario` | String | Sí | No | Nombre del oficial/copista que registró |
| `fecha` | Date | Sí | No | Fecha de registro del documento |
| `ubicacionActual` | String | No | Sí | Ubicación física actual del documento |
| `historialUbicaciones` | Array | Sí | No | Array con todos los movimientos |
| `qrCodeUrl` | String | No | No | URL de la imagen del código QR |
| `observaciones` | String | No | No | Notas adicionales sobre el documento |
| `createdAt` | Date | Sí (auto) | No | Timestamp de creación |
| `updatedAt` | Date | Sí (auto) | No | Timestamp de última actualización |

### Tipos de Documento

```typescript
type TipoRegistro = 'copia_simple' | 'presentacion_telematica';
```

| Tipo | Descripción |
|------|-------------|
| `copia_simple` | Copia simple de documento notarial |
| `presentacion_telematica` | Presentación telemática de documento |

### Notarios Disponibles

```typescript
type Notario = 'MAPE' | 'MCVF';
```

| Código | Nombre |
|--------|--------|
| `MAPE` | Notario MAPE (Notaría del Pozo) |
| `MCVF` | Notario MCVF (Notaría Carmen Vela) |

### Ubicaciones Comunes

Las ubicaciones no están limitadas, pero estas son las más comunes:

| Ubicación | Descripción | Usado por Rol |
|-----------|-------------|---------------|
| `MATRIZ` | Documento en matriz | Oficial |
| `DILIGENCIA` | Documento en proceso de diligencia | Oficial |
| `1_PRESENTACION` | Primera presentación | Copista |
| `COPIA` | En proceso de copia | Copista |
| `CATASTRO` | Enviado a catastro | Copista |
| `2_PRESENTACION` | Segunda presentación | Copista |
| `ARCHIVO` | Documento archivado (hecha: true) | Copista, Contabilidad |
| `FACTURA` | En proceso de facturación | Contabilidad |
| `MOSTRADOR` | En mostrador para entrega | Mostrador |
| `DESPACHO_MAPE` | En despacho del notario MAPE | Copista, Contabilidad (firma) |
| `DESPACHO_MCVF` | En despacho del notario MCVF | Copista, Contabilidad (firma) |
| `DESPACHO_[NOMBRE]` | Despacho personal del usuario | Variable |

### Estructura del Historial de Ubicaciones

```typescript
interface HistorialUbicacion {
  lugar: string;      // Ubicación del documento en ese momento
  usuario: string;    // Nombre del usuario que movió el documento
  fecha: Date;        // Fecha y hora exacta del movimiento
}
```

**Características:**
- Se añade una nueva entrada cada vez que se escanea el QR
- El orden es cronológico (más reciente = última posición del array)
- La primera entrada corresponde al registro inicial del documento
- No se pueden eliminar entradas (trazabilidad completa)

### Validaciones

- **numero**: 
  - Requerido, sin espacios (trimmed)
  - Formato recomendado: `YYYY-XXXX` (ej: `2025-0001`)

- **tipo**:
  - Debe ser `copia_simple` o `presentacion_telematica`

- **hecha**:
  - Por defecto: `false`
  - Se marca como `true` cuando el documento se archiva

- **notario**:
  - Debe ser `MAPE` o `MCVF`
  - Define el despacho de notario para firmas

- **ubicacionActual**:
  - Sin espacios (trimmed)
  - Por defecto: cadena vacía
  - Se actualiza automáticamente al escanear QR

- **historialUbicaciones**:
  - Array que siempre debe tener al menos 1 entrada
  - Cada entrada requiere: `lugar`, `usuario`, `fecha`
  - `fecha` se genera automáticamente si no se proporciona

- **observaciones**:
  - Máximo 255 caracteres
  - Sin espacios al inicio/final (trimmed)

### Ejemplo de Documento

```json
{
  "_id": "507f191e810c19729de860ea",
  "numero": "2025-0001",
  "tipo": "copia_simple",
  "hecha": false,
  "notario": "MAPE",
  "usuario": "Angela",
  "fecha": "2025-11-10T08:00:00.000Z",
  "ubicacionActual": "COPIA",
  "historialUbicaciones": [
    {
      "lugar": "MATRIZ",
      "usuario": "Angela",
      "fecha": "2025-11-10T08:00:00.000Z"
    },
    {
      "lugar": "DILIGENCIA",
      "usuario": "Angela",
      "fecha": "2025-11-10T08:30:00.000Z"
    },
    {
      "lugar": "COPIA",
      "usuario": "María García",
      "fecha": "2025-11-10T09:50:00.000Z"
    }
  ],
  "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "observaciones": "Documento urgente para entrega mañana",
  "createdAt": "2025-11-10T08:00:00.000Z",
  "updatedAt": "2025-11-10T09:50:00.000Z"
}
```

---

## Índices

Los índices mejoran el rendimiento de las consultas más frecuentes.

### Colección: usuarios

```javascript
// Índice único en email (automático)
{ email: 1 }  // UNIQUE

// Índice compuesto para búsquedas por rol
{ rol: 1, nombre: 1 }
```

### Colección: registros

```javascript
// Índice compuesto para búsquedas frecuentes
{ numero: 1, notario: 1 }

// Índice para filtros en dashboard
{ tipo: 1 }
{ hecha: 1 }
{ ubicacionActual: 1 }
{ fecha: -1 }  // Descendente para ordenar por más reciente

// Índice de texto para búsquedas
{ numero: 'text', observaciones: 'text' }
```

**Beneficios:**
- Búsquedas por número de protocolo: ~O(log n)
- Filtros en dashboard: altamente optimizados
- Ordenación por fecha: sin overhead adicional

---

## Relaciones

### usuarios → registros

**Tipo:** Referencia suave (no hay foreign key estricta)

- El campo `registro.usuario` almacena el **nombre** del usuario (string)
- No hay relación directa con `usuario._id`
- Esto permite mantener el historial incluso si se elimina un usuario

**Ventaja:** Trazabilidad permanente  
**Desventaja:** No hay validación automática de existencia del usuario

### registros → notarios

**Tipo:** Enumeración

- El campo `registro.notario` solo puede ser `MAPE` o `MCVF`
- Define qué notario es responsable del documento
- Determina el despacho de destino para firmas

---

## Valores Enumerados

### Roles de Usuario

```typescript
enum Rol {
  ADMIN = 'admin',
  OFICIAL = 'oficial',
  NOTARIO = 'notario',
  COPISTA = 'copista',
  MOSTRADOR = 'mostrador',
  CONTABILIDAD = 'contabilidad',
  GESTION = 'gestion'
}
```

### Tipos de Registro

```typescript
enum TipoRegistro {
  COPIA_SIMPLE = 'copia_simple',
  PRESENTACION_TELEMATICA = 'presentacion_telematica'
}
```

### Notarios

```typescript
enum Notario {
  MAPE = 'MAPE',
  MCVF = 'MCVF'
}
```

---

## Estadísticas de Uso

### Operaciones Comunes

| Operación | Frecuencia | Índice Usado |
|-----------|------------|--------------|
| Login de usuario | Alta | `{ email: 1 }` |
| Listar registros en dashboard | Muy Alta | `{ fecha: -1 }` |
| Buscar por número de protocolo | Alta | `{ numero: 1 }` |
| Filtrar por notario | Media | `{ notario: 1 }` |
| Filtrar por ubicación | Media | `{ ubicacionActual: 1 }` |
| Actualizar ubicación (escaneo QR) | Muy Alta | `{ _id: 1 }` |
| Agregar observaciones | Media | `{ _id: 1 }` |

---

## Migraciones y Cambios Históricos

### Versión 2.0 (Actual)

**Cambios respecto a v1.0:**

1. **usuarios:**
   - ❌ Eliminado: `notarioAsignado` (campo movido a registros)
   - ✅ Añadidos roles: `oficial`, `notario`, `mostrador`, `contabilidad`
   - ✅ Campo `despacho` ahora obligatorio

2. **registros:**
   - ✅ Añadido: `ubicacionActual` (reemplaza `ubicacion`)
   - ✅ Añadido: `historialUbicaciones` (array de objetos)
   - ✅ Añadido: `qrCodeUrl` (almacena imagen del QR)
   - ✅ Añadido: `observaciones` (max 255 caracteres)
   - ❌ Eliminado: `ubicacion` (reemplazado por `ubicacionActual`)

---

## Consideraciones de Seguridad

### Contraseñas

- **Algoritmo:** BCrypt
- **Rounds:** 12 (balance entre seguridad y rendimiento)
- **Nunca se exponen:** El campo `passwordHash` nunca se devuelve en APIs

### Validación de Datos

- **Email:** Validado con regex, convertido a minúsculas
- **Roles:** Estrictamente validados contra enum
- **Observaciones:** Limitadas a 255 caracteres para prevenir abusos

### Auditoría

- **Timestamps:** Todos los documentos tienen `createdAt` y `updatedAt`
- **Historial:** El campo `historialUbicaciones` proporciona auditoría completa
- **Trazabilidad:** Cada movimiento registra quién, cuándo y dónde

---

## Backup y Recuperación

### Recomendaciones

1. **Backup diario** de la base de datos completa
2. **Retención:** Mínimo 30 días de backups
3. **Punto de restauración:** Cada cambio importante de esquema
4. **Exportación:** Scripts disponibles para exportar a CSV/JSON

### Scripts de Mantenimiento

```bash
# Seed inicial de la base de datos
npm run seed

# Agregar usuarios oficiales
npm run add-oficiales

# Limpiar usuarios incorrectos
npm run cleanup-users
```

---

## Contacto y Soporte

Para modificaciones del esquema o consultas técnicas, contactar al administrador del sistema.

**Última revisión:** 10 de noviembre de 2025  
**Versión del esquema:** 2.0  
**Mantenido por:** Manuel Castillejo

