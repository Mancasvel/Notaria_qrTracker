import mongoose from 'mongoose';

export interface IUsuario {
  _id?: mongoose.Types.ObjectId;
  email: string;
  nombre: string;
  rol: 'admin' | 'oficial' | 'notario' | 'copista' | 'mostrador' | 'contabilidad' | 'gestion';
  despacho: string;
  passwordHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UsuarioSchema = new mongoose.Schema<IUsuario>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  rol: {
    type: String,
    required: true,
    enum: ['admin', 'oficial', 'notario', 'copista', 'mostrador', 'contabilidad', 'gestion'],
  },
  despacho: {
    type: String,
    required: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Check if the model already exists to prevent re-compilation errors
const Usuario = mongoose.models.Usuario || mongoose.model<IUsuario>('Usuario', UsuarioSchema);

export default Usuario;
