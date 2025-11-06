import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      despacho: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: string;
    despacho: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    despacho: string;
  }
}
