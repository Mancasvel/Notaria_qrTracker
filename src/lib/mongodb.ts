// Cargar variables de entorno al inicio (fallback si Next.js no las carga)
import './env-loader';

// Next.js carga automáticamente las variables de entorno desde .env.local, .env, etc.
// No es necesario cargarlas manualmente aquí.
import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface GlobalWithMongoose {
  mongoose: {
    conn: typeof import('mongoose') | null;
    promise: Promise<typeof import('mongoose')> | null;
  };
}

// Declaración del global para TypeScript
const globalWithMongoose = global as typeof global & GlobalWithMongoose;

let cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

// ---------------------------------------------------------
// CORRECCIÓN: Definimos la función antes de usar await/return
// ---------------------------------------------------------
async function dbConnect() {
  // Acceder a process.env (Next.js carga automáticamente desde .env.local)
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    // Solo mostrar detalles en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ MONGODB_URI no está definido');
      console.error('   Verifica que .env.local existe y contiene MONGODB_URI');
    }
    throw new Error(
      'MONGODB_URI no está definido. ' +
      'Crea un archivo .env.local en la raíz del proyecto con tu URI de MongoDB Atlas.'
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;