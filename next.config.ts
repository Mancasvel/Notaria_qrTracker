import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Esto permite que Mongoose funcione bien con el nuevo compilador
  serverExternalPackages: ['mongoose'],

  // 2. Next.js carga automáticamente .env.local, .env, .env.development, etc.
  // No necesitamos configurar nada aquí, Next.js lo hace automáticamente.
  // Las variables estarán disponibles en process.env en el servidor.

  // 3. Nota: El warning de workspace root es solo informativo y no afecta el build
  
  // 4. Cargar variables de entorno manualmente si Next.js no las carga
  env: (() => {
    try {
      const fs = require('fs');
      const path = require('path');
      const envLocalPath = path.join(process.cwd(), '.env.local');
      
      if (fs.existsSync(envLocalPath)) {
        const content = fs.readFileSync(envLocalPath, 'utf-8');
        const lines = content.split('\n');
        const env: Record<string, string> = {};
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          
          const equalIndex = trimmed.indexOf('=');
          if (equalIndex > 0) {
            let key = trimmed.substring(0, equalIndex).trim();
            let value = trimmed.substring(equalIndex + 1).trim();
            
            // Limpiar caracteres de control
            key = key.replace(/^[\u0000-\u001F\u007F-\u009F\uFEFF\u200B-\u200D\u2060\s]+/, '');
            key = key.replace(/[\u0000-\u001F\u007F-\u009F\uFEFF\u200B-\u200D\u2060\s]+$/, '');
            key = key.trim();
            value = value.replace(/^["']|["']$/g, '').trim();
            
            if (key && value) {
              env[key] = value;
            }
          }
        }
        
        // Solo mostrar en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Variables de entorno cargadas`);
        }
        return env;
      }
    } catch (error) {
      // Silencioso en producción
      if (process.env.NODE_ENV === 'development') {
        console.error('Error al cargar variables de entorno');
      }
    }
    return {};
  })(),
};

export default nextConfig;