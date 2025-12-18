/**
 * Script para corregir el formato de .env.local
 * Elimina BOM, espacios extra y corrige el formato
 */
import fs from 'fs';
import path from 'path';

const envLocalPath = path.join(process.cwd(), '.env.local');

console.log('\n' + '═'.repeat(80));
console.log('CORRECCIÓN DE FORMATO DE .env.local');
console.log('═'.repeat(80) + '\n');

if (!fs.existsSync(envLocalPath)) {
  console.log('❌ El archivo .env.local no existe');
  process.exit(1);
}

// Leer el archivo como buffer primero para eliminar BOM
let buffer = fs.readFileSync(envLocalPath);
let content: string;

// Eliminar BOM UTF-8 (EF BB BF) o UTF-16
if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
  buffer = buffer.slice(3);
  console.log('✅ BOM UTF-8 eliminado');
} else if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
  buffer = buffer.slice(2);
  console.log('✅ BOM UTF-16 LE eliminado');
} else if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
  buffer = buffer.slice(2);
  console.log('✅ BOM UTF-16 BE eliminado');
}

// Convertir a string
content = buffer.toString('utf-8');

console.log('📄 Archivo original leído\n');

// 2. Procesar líneas
const lines = content.split('\n');
const cleanedLines: string[] = [];

lines.forEach((line, index) => {
  const trimmed = line.trim();
  
  // Saltar líneas vacías
  if (!trimmed) {
    return;
  }
  
  // Mantener comentarios
  if (trimmed.startsWith('#')) {
    cleanedLines.push(trimmed);
    return;
  }
  
    // Procesar líneas KEY=VALUE
    if (trimmed.includes('=')) {
      // Eliminar espacios alrededor del =
      let cleaned = trimmed.replace(/\s*=\s*/g, '=');
      
      // Eliminar TODOS los caracteres no imprimibles y de control
      // Esto incluye BOM, espacios no separables, caracteres de control Unicode, etc.
      cleaned = cleaned.replace(/^[\u0000-\u001F\u007F-\u009F\uFEFF\u200B-\u200D\u2060\u00A0]+/, '');
      cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F\uFEFF\u200B-\u200D\u2060\u00A0]+/g, '');
      
      const parts = cleaned.split('=');
      if (parts.length >= 2) {
        // Limpiar la clave de forma más agresiva
        let key = parts[0];
        // Eliminar TODOS los caracteres no ASCII al inicio (excepto letras, números y guiones bajos)
        key = key.replace(/^[^A-Za-z0-9_]+/, '');
        // Eliminar espacios y caracteres de control
        key = key.replace(/[\s\u0000-\u001F\u007F-\u009F\uFEFF\u200B-\u200D\u2060]+/g, '');
        key = key.trim();
        
        const value = parts.slice(1).join('=').trim();
        
        if (key && key.length > 0 && /^[A-Za-z0-9_]+$/.test(key)) {
          cleanedLines.push(`${key}=${value}`);
          console.log(`✅ Línea ${index + 1} corregida: ${key}`);
        } else {
          console.log(`⚠️  Línea ${index + 1} ignorada (clave inválida: "${parts[0].substring(0, 20)}...")`);
        }
      } else {
        console.log(`⚠️  Línea ${index + 1} ignorada (formato incorrecto)`);
      }
    } else {
      console.log(`⚠️  Línea ${index + 1} ignorada (no contiene =)`);
    }
});

// Crear backup
const backupPath = envLocalPath + '.backup';
if (fs.existsSync(backupPath)) {
  fs.unlinkSync(backupPath);
}
fs.copyFileSync(envLocalPath, backupPath);
console.log(`\n💾 Backup creado: ${backupPath}`);

// Escribir archivo corregido
const cleanedContent = cleanedLines.join('\n') + '\n';
fs.writeFileSync(envLocalPath, cleanedContent, 'utf-8');

console.log('\n✅ Archivo .env.local corregido');
console.log(`   ${cleanedLines.length} líneas válidas escritas\n`);

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

