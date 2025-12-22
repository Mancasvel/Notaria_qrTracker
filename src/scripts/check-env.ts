/**
 * Script para verificar que las variables de entorno están configuradas correctamente
 * Ejecutar con: npm run check-env
 */
import { loadEnv } from '../lib/loadEnv';

// Cargar variables de entorno
loadEnv();

console.log('\n' + '═'.repeat(80));
console.log('VERIFICACIÓN DE VARIABLES DE ENTORNO');
console.log('═'.repeat(80) + '\n');

const requiredVars = [
  { name: 'MONGODB_URI', description: 'URI de conexión a MongoDB Atlas' },
  { name: 'NEXTAUTH_SECRET', description: 'Secreto para NextAuth (mínimo 32 caracteres)' },
  { name: 'NEXTAUTH_URL', description: 'URL base de la aplicación' },
];

let allValid = true;

requiredVars.forEach(({ name, description }) => {
  const value = process.env[name];
  const isSet = !!value;
  
  if (isSet) {
    // Validaciones específicas
    if (name === 'NEXTAUTH_SECRET' && value.length < 32) {
      console.log(`❌ ${name}:`);
      console.log(`   Valor: ${value.substring(0, 10)}... (${value.length} caracteres)`);
      console.log(`   Error: Debe tener al menos 32 caracteres`);
      allValid = false;
    } else if (name === 'MONGODB_URI' && !value.includes('mongodb+srv://')) {
      console.log(`⚠️  ${name}:`);
      console.log(`   Valor: ${value.substring(0, 30)}...`);
      console.log(`   Advertencia: No parece ser una URI de MongoDB Atlas`);
    } else {
      console.log(`✅ ${name}:`);
      console.log(`   ${description}`);
      if (name === 'MONGODB_URI') {
        console.log(`   Valor: ${value.substring(0, 30)}...`);
      } else if (name === 'NEXTAUTH_SECRET') {
        console.log(`   Longitud: ${value.length} caracteres`);
      } else {
        console.log(`   Valor: ${value}`);
      }
    }
  } else {
    console.log(`❌ ${name}:`);
    console.log(`   ${description}`);
    console.log(`   Error: Variable no definida`);
    allValid = false;
  }
  console.log('');
});

console.log('═'.repeat(80));

if (allValid) {
  console.log('✅ Todas las variables de entorno están configuradas correctamente');
  console.log('═'.repeat(80) + '\n');
  process.exit(0);
} else {
  console.log('❌ Algunas variables de entorno faltan o son inválidas');
  console.log('\n📝 Instrucciones:');
  console.log('   1. Crea un archivo .env.local en la raíz del proyecto');
  console.log('   2. Copia el contenido de env.example y completa los valores');
  console.log('   3. Para generar NEXTAUTH_SECRET, ejecuta:');
  console.log('      openssl rand -base64 32');
  console.log('   4. Reinicia el servidor de desarrollo después de crear/modificar .env.local');
  console.log('═'.repeat(80) + '\n');
  process.exit(1);
}




