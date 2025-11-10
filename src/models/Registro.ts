import mongoose from 'mongoose';

export interface IUbicacion {
  lugar: string; // nombre del despacho o "ARCHIVO"
  usuario: string; // quien movió el documento
  fecha: Date;
}

export interface IRegistro {
  _id?: mongoose.Types.ObjectId;
  numero: string;
  tipo: 'copia_simple' | 'presentacion_telematica';
  hecha: boolean;
  notario: 'MAPE' | 'MCVF';
  usuario: string; // nombre del oficial que creó el registro
  fecha: Date;
  ubicacionActual: string; // última ubicación
  historialUbicaciones: IUbicacion[]; // historial completo de movimientos
  qrCodeUrl: string;
  observaciones: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const RegistroSchema = new mongoose.Schema<IRegistro>({
  numero: {
    type: String,
    required: true,
    trim: true,
  },
  tipo: {
    type: String,
    required: true,
    enum: ['copia_simple', 'presentacion_telematica'],
  },
  hecha: {
    type: Boolean,
    default: false,
  },
  notario: {
    type: String,
    required: true,
    enum: ['MAPE', 'MCVF'],
  },
  usuario: {
    type: String,
    required: true,
    trim: true,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
  ubicacionActual: {
    type: String,
    default: '',
    trim: true,
  },
  historialUbicaciones: [{
    lugar: {
      type: String,
      required: true,
      trim: true,
    },
    usuario: {
      type: String,
      required: true,
      trim: true,
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
  }],
  qrCodeUrl: {
    type: String,
    default: '',
  },
  observaciones: {
    type: String,
    default: '',
    maxlength: 255,
  },
}, {
  timestamps: true,
});

// ===== ÍNDICES OPTIMIZADOS PARA CONSULTAS =====

// 1. Índice único para número de protocolo (previene duplicados y búsqueda O(1))
RegistroSchema.index({ numero: 1 }, { unique: true });

// 2. Índice compuesto principal para dashboard (cubre 90% de consultas)
//    Orden: hecha -> notario -> tipo -> fecha (más selectivo a menos selectivo)
//    Permite filtrar por estado, notario, tipo y ordenar por fecha sin overhead
RegistroSchema.index({ hecha: 1, notario: 1, tipo: 1, fecha: -1 });

// 3. Índice para búsqueda por ubicación actual
RegistroSchema.index({ ubicacionActual: 1 });

// 4. Índice compuesto para filtros por notario y fecha
RegistroSchema.index({ notario: 1, fecha: -1 });

// 5. Índice compuesto para filtros por tipo y fecha
RegistroSchema.index({ tipo: 1, fecha: -1 });

// 6. Índice de texto para búsquedas full-text (búsqueda global)
//    Permite buscar en múltiples campos con una sola query
RegistroSchema.index({ 
  numero: 'text', 
  observaciones: 'text', 
  usuario: 'text' 
}, {
  weights: {
    numero: 10,        // Mayor relevancia al número de protocolo
    usuario: 5,        // Relevancia media al usuario
    observaciones: 1   // Menor relevancia a observaciones
  },
  name: 'registro_text_search'
});

// Check if the model already exists to prevent re-compilation errors
const Registro = mongoose.models.Registro || mongoose.model<IRegistro>('Registro', RegistroSchema);

export default Registro;
