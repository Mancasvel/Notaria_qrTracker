/**
 * Script para verificar y crear .env.local si no existe
 * Ejecutar con: npm run verify-env
 */
import fs from 'fs';
import path from 'path';

const envLocalPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'env.example');

console.log('\n' + '═'.repeat(80));
console.log('VERIFICACIÓN DE ARCHIVO .env.local');
console.log('═'.repeat(80) + '\n');

if (fs.existsSync(envLocalPath)) {
  console.log('✅ El archivo .env.local existe');
  console.log(`   Ubicación: ${envLocalPath}\n`);
  
  // Leer y mostrar las variables (sin mostrar valores sensibles)
  const content = fs.readFileSync(envLocalPath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
  
  console.log('📋 Variables encontradas:');
  lines.forEach(line => {
    const [key] = line.split('=');
    if (key) {
      console.log(`   ✓ ${key.trim()}`);
    }
  });
  console.log('');
} else {
  console.log('❌ El archivo .env.local NO existe');
  console.log(`   Ubicación esperada: ${envLocalPath}\n`);
  
  if (fs.existsSync(envExamplePath)) {
    console.log('📝 Creando .env.local desde env.example...\n');
    
    const exampleContent = fs.readFileSync(envExamplePath, 'utf-8');
    fs.writeFileSync(envLocalPath, exampleContent, 'utf-8');
    
    console.log('✅ Archivo .env.local creado exitosamente');
    console.log('⚠️  IMPORTANTE: Edita .env.local y completa los valores reales');
    console.log('   - MONGODB_URI: Tu URI de MongoDB Atlas');
    console.log('   - NEXTAUTH_SECRET: Genera uno con: openssl rand -base64 32');
    console.log('   - NEXTAUTH_URL: http://localhost:3000 (desarrollo)\n');
  } else {
    console.log('❌ No se encontró env.example para crear .env.local');
    console.log('   Crea manualmente .env.local con las siguientes variables:');
    console.log('   MONGODB_URI=tu_uri_aqui');
    console.log('   NEXTAUTH_URL=http://localhost:3000');
    console.log('   NEXTAUTH_SECRET=tu_secreto_aqui\n');
  }
}

console.log('═'.repeat(80) + '\n');



