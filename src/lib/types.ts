export interface Usuario {
  _id: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'oficial' | 'notario' | 'copista' | 'mostrador' | 'contabilidad' | 'gestion' | 'polizas' | 'indices' | 'recepcion';
  despacho: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ubicacion {
  lugar: string;
  usuario: string;
  fecha: Date;
}

export interface Registro {
  _id: string;
  numero: string;
  tipo: 'copia_simple' | 'presentacion_telematica';
  hecha: boolean;
  notario: 'MAPE' | 'MCVF';
  usuario: string;
  fecha: Date;
  ubicacionActual: string;
  historialUbicaciones: Ubicacion[];
  qrCodeUrl: string;
  observaciones: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TipoRegistro = 'Inmuebles' | 'Sucesiones y Familia' | 'Mercantil/Empresas' | 'Poderes y Actas';

export interface FiltrosDashboard {
  numero?: string;
  notario?: 'MAPE' | 'MCVF';
  tipo?: TipoRegistro;
  estado?: boolean;
  ubicacion?: string;
}
