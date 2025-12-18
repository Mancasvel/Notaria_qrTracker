/**
 * Cargador de variables de entorno para Next.js
 * Este módulo se ejecuta al inicio y asegura que las variables se carguen
 * incluso si Next.js no las carga automáticamente
 * 
 * IMPORTANTE: Este módulo debe ejecutarse ANTES de cualquier otro módulo
 * que necesite las variables de entorno.
 */

// Solo ejecutar en el servidor
if (typeof window === 'undefined') {
  // Verificar si ya están cargadas (para evitar cargar múltiples veces)
  const alreadyLoaded = 
    process.env.NEXTAUTH_SECRET && 
    process.env.MONGODB_URI && 
    process.env.NEXTAUTH_URL;
  
  if (!alreadyLoaded) {
    try {
      // Usar dotenv que es más confiable para asignar a process.env
      const { config } = require('dotenv');
      const path = require('path');
      const fs = require('fs');
      
      // Intentar cargar .env.local
      const envLocalPath = path.join(process.cwd(), '.env.local');
      
      // Verificar que el archivo existe
      if (fs.existsSync(envLocalPath)) {
        // Solo mostrar logs en desarrollo y en servidor
        const isDev = process.env.NODE_ENV === 'development';
        
        if (isDev) {
          console.log('📄 Cargando variables de entorno...');
        }
        
        // Usar dotenv para cargar las variables
        // override: true asegura que sobrescriba variables existentes
        const result = config({ 
          path: envLocalPath,
          override: true,
          debug: false
        });
        
        if (result.error) {
          // Solo mostrar errores en desarrollo
          if (isDev) {
            console.error('❌ Error al cargar variables de entorno');
          }
          
          // Fallback a parseo manual (silencioso)
          let buffer = fs.readFileSync(envLocalPath);
          if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
            buffer = buffer.slice(3);
          }
          
          const fileContent = buffer.toString('utf-8');
          const allLines = fileContent.split('\n');
          
          for (let i = 0; i < allLines.length; i++) {
            const line = allLines[i];
            const trimmed = line.trim();
            
            if (!trimmed || trimmed.startsWith('#')) continue;
            
            const equalIndex = trimmed.indexOf('=');
            if (equalIndex > 0) {
              let key = trimmed.substring(0, equalIndex).trim();
              let value = trimmed.substring(equalIndex + 1).trim();
              
              key = key.replace(/^[\u0000-\u001F\u007F-\u009F\uFEFF\u200B-\u200D\u2060\s]+/, '');
              key = key.replace(/[\u0000-\u001F\u007F-\u009F\uFEFF\u200B-\u200D\u2060\s]+$/, '');
              key = key.trim();
              value = value.replace(/^["']|["']$/g, '').trim();
              
              if (key && value) {
                try {
                  process.env[key] = value;
                } catch (e) {
                  // Silencioso en producción
                  if (isDev) {
                    console.error(`Error al asignar variable: ${key}`);
                  }
                }
              }
            }
          }
        }
        
        // Verificación silenciosa (solo errores críticos en producción)
        const secret = process.env.NEXTAUTH_SECRET;
        const mongoUri = process.env.MONGODB_URI;
        const url = process.env.NEXTAUTH_URL;
        
        if (!secret || !mongoUri || !url) {
          // Solo mostrar error en desarrollo, en producción lanzar error silencioso
          if (isDev) {
            console.error('❌ Variables de entorno críticas no disponibles');
          }
        } else if (isDev) {
          console.log('✅ Variables de entorno cargadas correctamente');
        }
      } else {
        // Solo mostrar warning en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️  Archivo .env.local no encontrado');
        }
      }
    } catch (error) {
      console.error('❌ Error al cargar variables de entorno:', error);
    }
  } else {
    // Silencioso - las variables ya están cargadas
    // No mostrar logs en producción
  }
}
