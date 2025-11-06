import mongoose from 'mongoose';

export interface IRegistro {
  _id?: mongoose.Types.ObjectId;
  numero: string;
  tipo: 'copia_simple' | 'presentacion_telematica';
  hecha: boolean;
  notario: 'MAPE' | 'MCVF';
  usuario: string; // nombre del copista
  fecha: Date;
  ubicacion: string;
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
  ubicacion: {
    type: String,
    default: '',
    trim: true,
  },
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

// Índices para optimizar consultas
RegistroSchema.index({ numero: 1 });
RegistroSchema.index({ notario: 1 });
RegistroSchema.index({ usuario: 1 });
RegistroSchema.index({ hecha: 1 });
RegistroSchema.index({ ubicacion: 1 });
RegistroSchema.index({ fecha: -1 });

// Check if the model already exists to prevent re-compilation errors
const Registro = mongoose.models.Registro || mongoose.model<IRegistro>('Registro', RegistroSchema);

export default Registro;
