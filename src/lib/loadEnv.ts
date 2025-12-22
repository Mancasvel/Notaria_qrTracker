/**
 * Helper para cargar variables de entorno en scripts de Node.js
 * que se ejecutan fuera del contexto de Next.js.
 * 
 * Next.js carga automáticamente las variables de entorno, pero los scripts
 * que se ejecutan directamente con tsx/node necesitan cargarlas manualmente.
 */
import { config } from 'dotenv';
import path from 'path';

export function loadEnv(): void {
  // Intentar cargar .env.local primero (tiene prioridad)
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envPath = path.join(process.cwd(), '.env');

  // dotenv carga automáticamente .env, pero queremos priorizar .env.local
  const result = config({ path: envLocalPath });
  
  if (result.error) {
    // Si .env.local no existe, intentar con .env
    const fallbackResult = config({ path: envPath });
    
    if (fallbackResult.error) {
      console.warn('⚠️  No se encontró archivo .env.local ni .env');
      console.warn('   Asegúrate de crear .env.local basado en env.example');
    } else {
      console.log('✅ Variables de entorno cargadas desde .env');
    }
  } else {
    console.log('✅ Variables de entorno cargadas desde .env.local');
  }

  // Validar variables críticas
  const requiredVars = ['MONGODB_URI', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Variables de entorno faltantes:', missingVars.join(', '));
    console.error('   Asegúrate de configurarlas en .env.local');
    process.exit(1);
  }
}




