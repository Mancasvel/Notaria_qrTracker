import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Registro from '@/models/Registro';
import Usuario from '@/models/Usuario';
import mongoose from 'mongoose';

// POST /api/escanear - Escanear QR y actualizar ubicación
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
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

    // Obtener el usuario para saber su despacho
    const usuario = await Usuario.findById(session.user.id);
    if (!usuario || !usuario.despacho) {
      return NextResponse.json({ error: 'Usuario o despacho no encontrado' }, { status: 404 });
    }

    // Buscar y actualizar el registro
    const registro = await Registro.findByIdAndUpdate(
      documentId,
      { ubicacion: usuario.despacho },
      { new: true, runValidators: true }
    );

    if (!registro) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      message: `Documento ${registro.numero} ahora está en ${usuario.despacho}`,
      registro: {
        numero: registro.numero,
        ubicacion: registro.ubicacion,
        despacho: usuario.despacho,
      }
    });
  } catch (error) {
    console.error('Error scanning QR:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
