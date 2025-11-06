export interface Usuario {
  _id: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'copias' | 'gestion' | 'oficial';
  despacho: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Registro {
  _id: string;
  numero: string;
  tipo: 'copia_simple' | 'presentacion_telematica';
  hecha: boolean;
  notario: 'MAPE' | 'MCVF';
  usuario: string;
  fecha: Date;
  ubicacion: string;
  qrCodeUrl: string;
  observaciones: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TipoRegistro = 'copia_simple' | 'presentacion_telematica';

export interface FiltrosDashboard {
  numero?: string;
  notario?: 'MAPE' | 'MCVF';
  tipo?: TipoRegistro;
  estado?: boolean;
  ubicacion?: string;
}
