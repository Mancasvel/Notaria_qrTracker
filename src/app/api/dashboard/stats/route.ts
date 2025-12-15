import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Registro from '@/models/Registro';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await dbConnect();

    // 1. KPIs
    const totalRegistros = await Registro.countDocuments();
    const registrosHechos = await Registro.countDocuments({ hecha: true });
    const registrosPendientes = await Registro.countDocuments({ hecha: false });

    // 2. Actividad semanal real (últimos 7 días)
    const today = new Date();
    const weeklyData = [];

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const count = await Registro.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd }
      });

      // Nombres de días en español
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const dayName = dayNames[date.getDay()];

      weeklyData.push({
        name: dayName,
        expedientes: count,
        fullDate: date.toISOString().split('T')[0]
      });
    }

    // 3. Últimos 5 registros
    const ultimosRegistros = await Registro.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('numero tipo hecha ubicacionActual')
      .lean();

    const stats = {
      kpis: [
        {
          title: 'Expedientes Totales',
          value: totalRegistros.toString(),
          change: '+0%',
          changeType: 'positive' as const
        },
        {
          title: 'Pendientes de Firma',
          value: registrosPendientes.toString(),
          change: '0',
          changeType: 'neutral' as const
        },
        {
          title: 'Copias Entregadas',
          value: registrosHechos.toString(),
          change: '+0%',
          changeType: 'positive' as const
        }
      ],
      weeklyActivity: weeklyData,
      recentQRs: ultimosRegistros.map(reg => ({
        id: reg.numero,
        tipo: reg.tipo,
        fecha: reg.createdAt ? new Date(reg.createdAt).toISOString().split('T')[0] : 'N/A',
        estado: reg.ubicacionActual === 'ARCHIVO' ? 'Archivado' :
                reg.ubicacionActual === 'MOSTRADOR' ? 'Entregado' :
                reg.hecha ? 'Completado' : 'Pendiente'
      }))
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
