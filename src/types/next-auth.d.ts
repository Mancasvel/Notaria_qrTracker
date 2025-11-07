import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    despacho: string;
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role: string;
      despacho: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    sub?: string;
    role?: string;
    despacho?: string;
  }
}

