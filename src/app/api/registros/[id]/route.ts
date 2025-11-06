import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Registro from '@/models/Registro';
import mongoose from 'mongoose';

// GET /api/registros/[id] - Obtener detalle de documento (todos los usuarios autenticados)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await dbConnect();

    const resolvedParams = await params;
    
    // Validar que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json({ error: 'ID de documento inválido' }, { status: 400 });
    }

    const registro = await Registro.findById(resolvedParams.id);

    if (!registro) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    return NextResponse.json(registro);
  } catch (error) {
    console.error('Error fetching registro:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT /api/registros/[id] - Actualizar observaciones (todos los usuarios autenticados)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { observaciones } = body;
    const resolvedParams = await params;

    // Validar que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json({ error: 'ID de documento inválido' }, { status: 400 });
    }

    // Validar observaciones
    if (typeof observaciones !== 'string' || observaciones.length > 255) {
      return NextResponse.json({ error: 'Observaciones inválidas (máximo 255 caracteres)' }, { status: 400 });
    }

    // Sanitizar observaciones (eliminar caracteres peligrosos)
    const observacionesSanitizadas = observaciones.trim().replace(/[<>]/g, '');

    const registro = await Registro.findByIdAndUpdate(
      resolvedParams.id,
      { observaciones: observacionesSanitizadas },
      { new: true, runValidators: true }
    );

    if (!registro) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Observaciones actualizadas exitosamente',
      registro
    });
  } catch (error) {
    console.error('Error updating observaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PATCH /api/registros/[id] - Actualizar estado de presentación telemática (solo admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { hecha } = body;
    const resolvedParams = await params;

    // Validar que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json({ error: 'ID de documento inválido' }, { status: 400 });
    }

    // Validar estado
    if (typeof hecha !== 'boolean') {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    const registro = await Registro.findByIdAndUpdate(
      resolvedParams.id,
      { hecha },
      { new: true, runValidators: true }
    );

    if (!registro) {
      return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Registro actualizado exitosamente',
      registro
    });
  } catch (error) {
    console.error('Error updating registro:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
