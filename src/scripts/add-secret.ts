/**
 * Script para agregar NEXTAUTH_SECRET al archivo .env.local
 * Ejecutar con: npm run add-secret
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const envLocalPath = path.join(process.cwd(), '.env.local');

console.log('\n' + '═'.repeat(80));
console.log('AGREGAR NEXTAUTH_SECRET A .env.local');
console.log('═'.repeat(80) + '\n');

if (!fs.existsSync(envLocalPath)) {
  console.log('❌ El archivo .env.local no existe');
  console.log('   Ejecuta primero: npm run verify-env\n');
  process.exit(1);
}

// Leer el archivo actual
let content = fs.readFileSync(envLocalPath, 'utf-8');

// Verificar si ya existe NEXTAUTH_SECRET
if (content.includes('NEXTAUTH_SECRET=')) {
  console.log('⚠️  NEXTAUTH_SECRET ya existe en .env.local');
  console.log('   Si quieres regenerarlo, elimina la línea manualmente y vuelve a ejecutar este script\n');
  
  // Mostrar si tiene valor o está vacío
  const lines = content.split('\n');
  const secretLine = lines.find(line => line.trim().startsWith('NEXTAUTH_SECRET='));
  if (secretLine) {
    const value = secretLine.split('=')[1]?.trim();
    if (value) {
      console.log('   El secreto actual tiene un valor configurado.');
    } else {
      console.log('   El secreto está vacío. Generando uno nuevo...\n');
      
      // Generar nuevo secreto
      const secret = crypto.randomBytes(32).toString('base64');
      
      // Reemplazar la línea vacía con el nuevo secreto
      const newContent = content.replace(
        /NEXTAUTH_SECRET=.*/,
        `NEXTAUTH_SECRET=${secret}`
      );
      
      fs.writeFileSync(envLocalPath, newContent, 'utf-8');
      console.log('✅ NEXTAUTH_SECRET generado y agregado exitosamente');
      console.log(`   Longitud: ${secret.length} caracteres\n`);
    }
  }
} else {
  // Generar nuevo secreto
  const secret = crypto.randomBytes(32).toString('base64');
  
  // Agregar al final del archivo
  const newLine = content.trim().endsWith('\n') ? '' : '\n';
  const newContent = content + newLine + `NEXTAUTH_SECRET=${secret}\n`;
  
  fs.writeFileSync(envLocalPath, newContent, 'utf-8');
  console.log('✅ NEXTAUTH_SECRET generado y agregado exitosamente');
  console.log(`   Longitud: ${secret.length} caracteres\n`);
}

console.log('═'.repeat(80));
console.log('✅ Proceso completado');
console.log('⚠️  IMPORTANTE: Reinicia el servidor de desarrollo después de este cambio');
console.log('   Ejecuta: npm run dev\n');
console.log('═'.repeat(80) + '\n');


