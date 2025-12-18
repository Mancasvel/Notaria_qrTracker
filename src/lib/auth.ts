// Cargar variables de entorno al inicio (fallback si Next.js no las carga)
import './env-loader';

// Next.js carga automáticamente las variables de entorno desde .env.local, .env, etc.
// Accedemos a las variables en tiempo de ejecución para asegurar que estén cargadas.
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import Usuario from '@/models/Usuario';

// Función factory para crear authOptions con acceso lazy a las variables
// Esto asegura que las variables se accedan solo cuando NextAuth las necesite
function createAuthOptions(): NextAuthOptions {
  // Forzar recarga de variables si no están disponibles
  // Esto es un fallback en caso de que el env-loader no haya funcionado
  if (!process.env.NEXTAUTH_SECRET || !process.env.MONGODB_URI || !process.env.NEXTAUTH_URL) {
    try {
      const path = require('path');
      const fs = require('fs');
      const envLocalPath = path.join(process.cwd(), '.env.local');
      
      if (fs.existsSync(envLocalPath)) {
        let buffer = fs.readFileSync(envLocalPath);
        if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
          buffer = buffer.slice(3);
        }
        
        const fileContent = buffer.toString('utf-8');
        const lines = fileContent.split('\n');
        
        for (const line of lines) {
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
              process.env[key] = value;
            }
          }
        }
      }
    } catch (error) {
      // Solo mostrar errores en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.error('Error al recargar variables de entorno');
      }
    }
  }
  
  // Acceder a las variables directamente desde process.env
  // Next.js carga automáticamente .env.local al iniciar el servidor
  const secret = process.env.NEXTAUTH_SECRET;
  const url = process.env.NEXTAUTH_URL;
  
  // Validar secret (sin mostrar información sensible)
  if (!secret) {
    // Solo mostrar detalles en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ NEXTAUTH_SECRET no está disponible');
      console.error('   Verifica que .env.local existe y contiene NEXTAUTH_SECRET');
    }
    throw new Error('NEXTAUTH_SECRET is required but not defined in environment variables');
  }
  
  // Validar que el secreto tenga al menos 32 caracteres (solo warning en desarrollo)
  if (secret.length < 32 && process.env.NODE_ENV === 'development') {
    console.warn('⚠️  NEXTAUTH_SECRET tiene menos de 32 caracteres');
  }
  
  // No mostrar logs de configuración en producción
  // En desarrollo, solo confirmar sin mostrar valores
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ NextAuth configurado correctamente');
  }

  return {
    providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await dbConnect();

          const user = await Usuario.findOne({ email: credentials.email.toLowerCase() });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.nombre,
            role: user.rol,
            despacho: user.despacho,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.despacho = user.despacho;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
        session.user.despacho = token.despacho as string;
      }
      return session;
    },
  },
    pages: {
      signIn: '/login',
    },
    // Usar la variable que ya validamos arriba
    secret: secret,
    // Configuración de cookies para desarrollo local
    // En producción (HTTPS) usa __Secure- prefix, en desarrollo (HTTP) no
    cookies: {
      sessionToken: {
        name: `next-auth.session-token`,
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          // CLAVE: Solo marcar como secure en producción (HTTPS)
          // En localhost (HTTP) debe ser false para que el navegador acepte la cookie
          secure: process.env.NODE_ENV === 'production',
        },
      },
    },
  };
}

// Exportar la factory function
// La ruta de NextAuth debe llamar a esta función en tiempo de ejecución
// Esto asegura que las variables de entorno se accedan solo cuando NextAuth las necesite
export function getAuthOptions(): NextAuthOptions {
  return createAuthOptions();
}

// Exportar también como authOptions para compatibilidad con getServerSession
// Usa un getter lazy para evitar ejecución durante evaluación del módulo
let _authOptionsCache: NextAuthOptions | null = null;

function getAuthOptionsCached(): NextAuthOptions {
  if (!_authOptionsCache) {
    _authOptionsCache = createAuthOptions();
  }
  return _authOptionsCache;
}

// Crear un objeto Proxy que delega todas las propiedades al objeto real
// Esto permite que authOptions se use como un objeto normal pero se crea solo cuando se accede
export const authOptions = new Proxy({} as NextAuthOptions, {
  get(_target, prop) {
    const options = getAuthOptionsCached();
    const value = (options as unknown as Record<string, unknown>)[prop as string];
    if (typeof value === 'function') {
      return value.bind(options);
    }
    return value;
  },
  ownKeys() {
    return Reflect.ownKeys(getAuthOptionsCached());
  },
  has(_target, prop) {
    return prop in getAuthOptionsCached();
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Reflect.getOwnPropertyDescriptor(getAuthOptionsCached(), prop);
  },
}) as NextAuthOptions;

