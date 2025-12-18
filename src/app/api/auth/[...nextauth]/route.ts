// Cargar variables de entorno al inicio
import '@/lib/env-loader';

import NextAuth from 'next-auth';
import { getAuthOptions } from '@/lib/auth';

// Crear el handler de NextAuth
// Las variables ya deberían estar cargadas por env-loader
const handler = NextAuth(getAuthOptions());

// Exportar los métodos GET y POST directamente
export { handler as GET, handler as POST };
