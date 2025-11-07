# 👥 Usuarios Oficiales - Notaría

## 🔐 Credenciales

**Contraseña para todos los usuarios:** `ññ61pv`

---

## 📋 Lista de Usuarios

### Notaría del Pozo (MAPE)

| Nombre | Email | Despacho | Notario Asignado |
|--------|-------|----------|------------------|
| Angela | angela@notariadelpozo.com | DESPACHO_ANGELA | MAPE |
| Olga | olga@notariadelpozo.com | DESPACHO_OLGA | MAPE |
| Rafa | rafa@notariadelpozo.com | DESPACHO_RAFA | MAPE |
| Patricia | patricia@notariadelpozo.com | DESPACHO_PATRICIA | MAPE |
| Miguel Angel | miguelangel@notariadelpozo.com | DESPACHO_MIGUELANGEL | MAPE |
| Matilde | matilde@notariadelpozo.com | DESPACHO_MATILDE | MAPE |

### Notaría Carmen Vela (MCVF)

| Nombre | Email | Despacho | Notario Asignado |
|--------|-------|----------|------------------|
| Rocio | rocio@notariacarmenvela.com | DESPACHO_ROCIO | MCVF |
| Mar Fonseca | marfonseca@notariacarmenvela.com | DESPACHO_MARFONSECA | MCVF |
| Manuel | manuel@notariacarmenvela.com | DESPACHO_MANUEL | MCVF |

---

## 🎯 Permisos del Rol "Oficial"

Los usuarios con rol **oficial** tienen acceso a:

### ✅ Funcionalidades Disponibles

1. **Dashboard** - Ver todos los documentos registrados
2. **Registrar Documento** - Crear nuevos registros
3. **Escanear QR** - Escanear documentos y actualizar ubicaciones

### 📍 Opciones de Ubicación al Escanear

Cuando un oficial escanea un documento QR, se le presenta un modal con estas opciones:

- **📋 Matriz** - Documento en matriz para revisión
- **📝 Diligencia** - Documento en proceso de diligencia

### 🔄 Flujo de Trabajo

1. El oficial inicia sesión con su email y contraseña
2. Puede registrar nuevos documentos desde el menú "Registrar Documento"
3. Puede escanear QR de documentos existentes desde "Escanear QR"
4. Al escanear, selecciona si el documento está en "Matriz" o "Diligencia"
5. El sistema actualiza automáticamente:
   - La ubicación actual del documento
   - El historial de ubicaciones
   - Registra quién movió el documento y cuándo

---

## 🔧 Administración

### Crear/Actualizar Usuarios

Para agregar más usuarios oficiales o actualizar los existentes, ejecuta:

```bash
npm run add-oficiales
```

Este script:
- ✅ Crea nuevos usuarios si no existen
- ✅ Actualiza usuarios existentes si ya están en la base de datos
- ✅ Asigna automáticamente el notario según el dominio del email:
  - `@notariadelpozo.com` → MAPE
  - `@notariacarmenvela.com` → MCVF

### Cambiar Contraseñas

Para cambiar la contraseña de los usuarios, edita el archivo:
`src/scripts/add-oficiales.ts`

Y modifica la línea:
```typescript
const password = 'ññ61pv'; // Cambiar aquí
```

Luego ejecuta nuevamente:
```bash
npm run add-oficiales
```

---

## ⚠️ Notas Importantes

1. **Seguridad**: En producción, se recomienda que cada usuario cambie su contraseña después del primer inicio de sesión.

2. **Notario Asignado**: El campo `notarioAsignado` determina a qué despacho de notario irá el documento cuando el oficial seleccione la opción "Firma" (si se implementa en el futuro).

3. **Despachos Únicos**: Cada oficial tiene su propio despacho identificado por su nombre, lo que permite rastrear exactamente quién tiene cada documento.

4. **Historial Completo**: Cada vez que un documento es escaneado, se registra:
   - Ubicación nueva
   - Usuario que lo escaneó
   - Fecha y hora exacta

---

## 📞 Soporte

Para cualquier problema con las cuentas o permisos, contacta al administrador del sistema.

**Fecha de creación:** 7 de noviembre de 2025

