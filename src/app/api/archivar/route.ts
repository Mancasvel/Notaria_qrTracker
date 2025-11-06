import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Registro from '@/models/Registro';
import Usuario from '@/models/Usuario';
import mongoose from 'mongoose';

// POST /api/archivar - Archivar documento (solo copias)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo copias pueden archivar
    if (session.user.role !== 'copias') {
      return NextResponse.json({ error: 'Solo el personal de copias puede archivar documentos' }, { status: 403 });
    }

    await dbConnect();

    const body = await request.json();
    const { documentId } = body;

    // Validar que documentId esté presente
    if (!documentId) {
      return NextResponse.json({ error: 'ID de documento requerido' }, { status: 400 });
    }

    // Validar que sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return NextResponse.json({ error: 'ID de documento inválido' }, { status: 400 });
    }

    // Obtener el usuario
    const usuario = await Usuario.findById(session.user.id);
    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Buscar el registro
    const registro = await Registro.findById(documentId);
    if (!registro) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    // Agregar "ARCHIVO" al historial
    registro.historialUbicaciones.push({
      lugar: 'ARCHIVO',
      usuario: usuario.nombre,
      fecha: new Date(),
    });
    registro.ubicacionActual = 'ARCHIVO';

    await registro.save();

    return NextResponse.json({
      message: `Documento ${registro.numero} archivado correctamente`,
      registro: {
        numero: registro.numero,
        ubicacionActual: registro.ubicacionActual,
        historialUbicaciones: registro.historialUbicaciones,
      }
    });
  } catch (error) {
    console.error('Error archiving document:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

