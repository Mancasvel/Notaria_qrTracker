import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Registro from '@/models/Registro';
import Usuario from '@/models/Usuario';
import { generateQRCode } from '@/lib/qr';

// GET /api/registros - Obtener registros con filtros (solo admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const numero = searchParams.get('numero');
    const notario = searchParams.get('notario') as 'MAPE' | 'MCVF' | null;
    const tipo = searchParams.get('tipo') as 'copia_simple' | 'presentacion_telematica' | null;
    const estado = searchParams.get('estado');
    const ubicacion = searchParams.get('ubicacion');

    const filtros: Record<string, unknown> = {};

    if (numero) {
      filtros.numero = { $regex: numero, $options: 'i' };
    }

    if (notario) {
      filtros.notario = notario;
    }

    if (tipo) {
      if (tipo === 'copia_simple') {
        filtros.necesita_presentacion = false;
      } else if (tipo === 'presentacion_telematica') {
        filtros.necesita_presentacion = true;
      }
    }

    if (estado !== null) {
      filtros.hecha = estado === 'true';
    }

    if (ubicacion) {
      filtros.ubicacionActual = { $regex: ubicacion, $options: 'i' };
    }

    const registros = await Registro.find(filtros).sort({ fecha: -1 });

    return NextResponse.json(registros);
  } catch (error) {
    console.error('Error fetching registros:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/registros - Crear nuevo registro (admin y copias)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { numero, tipo, notario } = body;

    // Validación de datos de entrada
    if (!numero || !tipo || !notario) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Sanitizar y validar número de protocolo
    const numeroSanitizado = String(numero).trim();
    if (numeroSanitizado.length === 0 || numeroSanitizado.length > 50) {
      return NextResponse.json({ error: 'Número de protocolo inválido' }, { status: 400 });
    }

    // Validar tipo
    if (!['copia_simple', 'presentacion_telematica'].includes(tipo)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    }

    // Validar notario
    if (!['MAPE', 'MCVF'].includes(notario)) {
      return NextResponse.json({ error: 'Notario inválido' }, { status: 400 });
    }

    // Verificar si el número ya existe
    const existingRegistro = await Registro.findOne({ numero: numeroSanitizado });
    if (existingRegistro) {
      return NextResponse.json({ error: 'El número de protocolo ya existe' }, { status: 409 });
    }

    // Obtener el nombre del usuario
    const usuario = await Usuario.findById(session.user.id);
    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const nuevoRegistro = new Registro({
      numero: numeroSanitizado,
      tipo,
      hecha: false,
      notario,
      usuario: usuario.nombre,
      fecha: new Date(),
      ubicacionActual: usuario.despacho,
      historialUbicaciones: [{
        lugar: usuario.despacho,
        usuario: usuario.nombre,
        fecha: new Date(),
      }],
      qrCodeUrl: '',
      observaciones: '',
    });

    await nuevoRegistro.save();

    // Generar QR code después de guardar
    try {
      const qrCodeUrl = await generateQRCode(nuevoRegistro._id.toString());
      nuevoRegistro.qrCodeUrl = qrCodeUrl;
      await nuevoRegistro.save();
    } catch (error) {
      console.error('Error generating QR code:', error);
      // No fallar la creación si el QR falla
    }

    return NextResponse.json({
      message: 'Registro creado exitosamente',
      registro: nuevoRegistro
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating registro:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
