import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Registro from '@/models/Registro';
import Usuario from '@/models/Usuario';
import mongoose from 'mongoose';

// POST /api/escanear - Escanear QR y actualizar ubicación
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { documentId, ubicacion } = body;

    // Validar que documentId esté presente
    if (!documentId) {
      return NextResponse.json({ error: 'ID de documento requerido' }, { status: 400 });
    }

    // Validar que sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return NextResponse.json({ error: 'ID de documento inválido' }, { status: 400 });
    }

    // Obtener el usuario para saber su despacho y rol
    const usuario = await Usuario.findById(session.user.id);
    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Buscar el registro
    const registro = await Registro.findById(documentId);
    if (!registro) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    // Determinar la ubicación final
    // Si se proporciona ubicacion desde el modal, usarla
    // Si no, usar el despacho del usuario
    const ubicacionFinal = ubicacion || usuario.despacho;

    // Agregar nueva ubicación al historial
    const historialEntry = {
      lugar: ubicacionFinal,
      usuario: usuario.nombre,
      fecha: new Date(),
    };

    registro.historialUbicaciones.push(historialEntry);
    registro.ubicacionActual = ubicacionFinal;

    await registro.save();

    // Crear mensaje descriptivo según la ubicación
    let mensajeDescriptivo = '';
    switch (ubicacionFinal) {
      case 'MATRIZ':
        mensajeDescriptivo = 'en Matriz';
        break;
      case 'DILIGENCIA':
        mensajeDescriptivo = 'en Diligencia';
        break;
      case '1_PRESENTACION':
        mensajeDescriptivo = 'en 1ª Presentación';
        break;
      case 'COPIA':
        mensajeDescriptivo = 'en Copia';
        break;
      case 'CATASTRO':
        mensajeDescriptivo = 'en Catastro';
        break;
      case '2_PRESENTACION':
        mensajeDescriptivo = 'en 2ª Presentación';
        break;
      case 'ARCHIVO':
        mensajeDescriptivo = 'en Archivo';
        break;
      case 'FACTURA':
        mensajeDescriptivo = 'en Factura';
        break;
      case 'PENDIENTE_COPIA':
        mensajeDescriptivo = 'Pendiente en Copia';
        break;
      case 'DEVUELTO_A_NOTARIO':
        mensajeDescriptivo = 'Devuelto a Notario';
        break;
      case 'RE-IMPRESO':
        mensajeDescriptivo = 'Re-impreso (QR duplicado)';
        break;
      case 'MOSTRADOR':
        mensajeDescriptivo = 'en Mostrador';
        break;
      case 'DESPACHO_MAPE':
      case 'DESPACHO_MCVF':
        mensajeDescriptivo = `para firma en ${ubicacionFinal.replace('DESPACHO_', '')}`;
        break;
      default:
        mensajeDescriptivo = `en ${ubicacionFinal}`;
    }

    return NextResponse.json({
      message: `📍 Documento ${registro.numero} ahora está ${mensajeDescriptivo}`,
      registro: {
        numero: registro.numero,
        ubicacionActual: registro.ubicacionActual,
        historialUbicaciones: registro.historialUbicaciones,
      }
    });
  } catch (error) {
    console.error('Error scanning QR:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
