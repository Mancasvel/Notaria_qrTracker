/**
 * Script para corregir el encoding de .env.local
 * Reescribe el archivo con UTF-8 sin BOM
 */
import fs from 'fs';
import path from 'path';

const envLocalPath = path.join(process.cwd(), '.env.local');

console.log('\n' + '═'.repeat(80));
console.log('CORRECCIÓN DE ENCODING DE .env.local');
console.log('═'.repeat(80) + '\n');

if (!fs.existsSync(envLocalPath)) {
  console.log('❌ El archivo .env.local no existe');
  process.exit(1);
}

// Leer el archivo como buffer
let buffer = fs.readFileSync(envLocalPath);

console.log('📄 Archivo leído\n');

// Eliminar BOM si existe
if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
  buffer = buffer.slice(3);
  console.log('✅ BOM UTF-8 eliminado');
}

// Convertir a string y limpiar TODOS los caracteres nulos primero
let content = buffer.toString('utf-8');

// ELIMINAR TODOS los caracteres nulos (\x00) del contenido completo
// Esto es crítico porque pueden estar entre caracteres normales
content = content.replace(/\x00/g, '');

// Procesar líneas para limpiar caracteres no imprimibles
const lines = content.split('\n');
const cleanedLines: string[] = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  const originalLine = line;
  
  // Eliminar caracteres de control y no imprimibles (incluyendo nulos)
  line = line.replace(/[\u0000-\u001F\u007F-\u009F\uFEFF\u200B-\u200D\u2060]+/g, '');
  
  // Si la línea tiene contenido después de limpiar
  if (line.trim()) {
    // Si es un comentario, mantenerlo
    if (line.trim().startsWith('#')) {
      cleanedLines.push(line.trim());
      continue;
    }
    
    // Si tiene =, procesar como KEY=VALUE
    if (line.includes('=')) {
      const equalIndex = line.indexOf('=');
      let key = line.substring(0, equalIndex).trim();
      let value = line.substring(equalIndex + 1).trim();
      
            // Limpiar la clave: eliminar SOLO caracteres de control y espacios
            // Mantener letras, números, guiones bajos y guiones
            key = key.replace(/[^\w-]/g, '').trim();
            
            // Si la clave está vacía después de limpiar, intentar extraerla de otra forma
            if (!key) {
              // Intentar extraer cualquier palabra antes del =
              const keyMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/);
              if (keyMatch) {
                key = keyMatch[1];
              }
            }
      
      // Limpiar el valor: eliminar comillas, caracteres nulos y otros caracteres de control
      value = value.replace(/[\u0000-\u001F\u007F-\u009F]+/g, ''); // Eliminar todos los caracteres de control
      value = value.replace(/^["']|["']$/g, ''); // Eliminar comillas al inicio/final
      value = value.trim();
      
      if (key && key.length > 0 && value && value.length > 0) {
        // Asegurar que no haya espacios alrededor del =
        cleanedLines.push(`${key.trim()}=${value.trim()}`);
        console.log(`✅ Línea ${i + 1} procesada: ${key.trim()}`);
      } else {
        console.log(`⚠️  Línea ${i + 1} ignorada (clave o valor inválido)`);
      }
    } else {
      // Línea sin =, mantenerla si no está vacía
      if (line.trim()) {
        cleanedLines.push(line.trim());
      }
    }
  }
}

// Crear backup
const backupPath = envLocalPath + '.backup.' + Date.now();
if (fs.existsSync(backupPath)) {
  fs.unlinkSync(backupPath);
}
fs.copyFileSync(envLocalPath, backupPath);
console.log(`\n💾 Backup creado: ${backupPath}`);

// Escribir archivo corregido con UTF-8 sin BOM
const cleanedContent = cleanedLines.join('\n') + '\n';
fs.writeFileSync(envLocalPath, cleanedContent, { encoding: 'utf8' });

console.log('\n✅ Archivo .env.local reescrito con encoding UTF-8 (sin BOM)');
console.log(`   ${cleanedLines.length} líneas escritas\n`);

// Verificar variables requeridas
const requiredVars = ['MONGODB_URI', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'];
const foundVars = cleanedLines
  .filter(line => line.includes('=') && !line.startsWith('#'))
  .map(line => line.split('=')[0].trim());

const missingVars = requiredVars.filter(v => !foundVars.includes(v));

if (missingVars.length === 0) {
  console.log('✅ Todas las variables requeridas están presentes\n');
} else {
  console.log(`⚠️  Variables faltantes: ${missingVars.join(', ')}\n`);
}

console.log('═'.repeat(80));
console.log('✅ Proceso completado');
console.log('⚠️  IMPORTANTE: Reinicia el servidor después de este cambio');
console.log('   Ejecuta: npm run dev\n');
console.log('═'.repeat(80) + '\n');

