// Load environment variables FIRST, before any imports
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

envContent.split('\n').forEach(line => {
  // Skip comments and empty lines
  if (line.trim().startsWith('#') || !line.trim()) return;
  
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    const value = valueParts.join('=').trim();
    process.env[key.trim()] = value;
  }
});

console.log('✅ Environment variables loaded from .env.local');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Configured' : '✗ Missing');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? '✓ Configured' : '✗ Missing');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✓ Configured' : '✗ Missing');

// NOW import modules that depend on environment variables
import dbConnect from '../lib/mongodb';
import Usuario from '../models/Usuario';
import Registro from '../models/Registro';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Generate a secure random password
function generateSecurePassword(length: number = 16): string {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

async function seedDatabase() {
  try {
    // Pass the URI explicitly to dbConnect
    await dbConnect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Usuario.deleteMany({});
    await Registro.deleteMany({});
    console.log('Cleared existing data');

    // Store credentials for display at the end
    const credentials: Array<{ email: string; password: string; role: string; despacho: string }> = [];

    // Create admin user
    const adminPassword = generateSecurePassword();
    const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
    const adminUser = new Usuario({
      email: 'admin@notaria.com',
      nombre: 'Administrador',
      rol: 'admin',
      despacho: 'DESPACHO_ADMIN',
      passwordHash: adminPasswordHash,
    });
    await adminUser.save();
    credentials.push({ email: 'admin@notaria.com', password: adminPassword, role: 'admin', despacho: 'DESPACHO_ADMIN' });
    console.log('✓ Created admin user');

    // Create oficial user
    const oficialPassword = generateSecurePassword();
    const oficialPasswordHash = await bcrypt.hash(oficialPassword, 12);
    const oficialUser = new Usuario({
      email: 'oficial@notaria.com',
      nombre: 'Juan Pérez',
      rol: 'oficial',
      despacho: 'DESPACHO_OFICIAL',
      notarioAsignado: 'MAPE',
      passwordHash: oficialPasswordHash,
    });
    await oficialUser.save();
    credentials.push({ email: 'oficial@notaria.com', password: oficialPassword, role: 'oficial', despacho: 'DESPACHO_OFICIAL' });
    console.log('✓ Created oficial user');

    // Create notario MAPE
    const notarioMAPEPassword = generateSecurePassword();
    const notarioMAPEPasswordHash = await bcrypt.hash(notarioMAPEPassword, 12);
    const notarioMAPE = new Usuario({
      email: 'notario.mape@notaria.com',
      nombre: 'Notario MAPE',
      rol: 'notario',
      despacho: 'DESPACHO_MAPE',
      notarioAsignado: 'MAPE',
      passwordHash: notarioMAPEPasswordHash,
    });
    await notarioMAPE.save();
    credentials.push({ email: 'notario.mape@notaria.com', password: notarioMAPEPassword, role: 'notario', despacho: 'DESPACHO_MAPE' });
    console.log('✓ Created notario MAPE user');

    // Create notario MCVF
    const notarioMCVFPassword = generateSecurePassword();
    const notarioMCVFPasswordHash = await bcrypt.hash(notarioMCVFPassword, 12);
    const notarioMCVF = new Usuario({
      email: 'notario.mcvf@notaria.com',
      nombre: 'Notario MCVF',
      rol: 'notario',
      despacho: 'DESPACHO_MCVF',
      notarioAsignado: 'MCVF',
      passwordHash: notarioMCVFPasswordHash,
    });
    await notarioMCVF.save();
    credentials.push({ email: 'notario.mcvf@notaria.com', password: notarioMCVFPassword, role: 'notario', despacho: 'DESPACHO_MCVF' });
    console.log('✓ Created notario MCVF user');

    // Create copista user
    const copistaPassword = generateSecurePassword();
    const copistaPasswordHash = await bcrypt.hash(copistaPassword, 12);
    const copistaUser = new Usuario({
      email: 'copista@notaria.com',
      nombre: 'María García',
      rol: 'copista',
      despacho: 'DESPACHO_COPISTA',
      notarioAsignado: 'MAPE',
      passwordHash: copistaPasswordHash,
    });
    await copistaUser.save();
    credentials.push({ email: 'copista@notaria.com', password: copistaPassword, role: 'copista', despacho: 'DESPACHO_COPISTA' });
    console.log('✓ Created copista user');

    // Create mostrador user
    const mostradorPassword = generateSecurePassword();
    const mostradorPasswordHash = await bcrypt.hash(mostradorPassword, 12);
    const mostradorUser = new Usuario({
      email: 'mostrador@notaria.com',
      nombre: 'Carlos López',
      rol: 'mostrador',
      despacho: 'MOSTRADOR',
      passwordHash: mostradorPasswordHash,
    });
    await mostradorUser.save();
    credentials.push({ email: 'mostrador@notaria.com', password: mostradorPassword, role: 'mostrador', despacho: 'MOSTRADOR' });
    console.log('✓ Created mostrador user');

    // Create contabilidad user
    const contabilidadPassword = generateSecurePassword();
    const contabilidadPasswordHash = await bcrypt.hash(contabilidadPassword, 12);
    const contabilidadUser = new Usuario({
      email: 'contabilidad@notaria.com',
      nombre: 'Ana Martínez',
      rol: 'contabilidad',
      despacho: 'DESPACHO_CONTABILIDAD',
      notarioAsignado: 'MCVF',
      passwordHash: contabilidadPasswordHash,
    });
    await contabilidadUser.save();
    credentials.push({ email: 'contabilidad@notaria.com', password: contabilidadPassword, role: 'contabilidad', despacho: 'DESPACHO_CONTABILIDAD' });
    console.log('✓ Created contabilidad user');

    // Create gestion user
    const gestionPassword = generateSecurePassword();
    const gestionPasswordHash = await bcrypt.hash(gestionPassword, 12);
    const gestionUser = new Usuario({
      email: 'gestion@notaria.com',
      nombre: 'Laura Fernández',
      rol: 'gestion',
      despacho: 'DESPACHO_GESTION',
      passwordHash: gestionPasswordHash,
    });
    await gestionUser.save();
    credentials.push({ email: 'gestion@notaria.com', password: gestionPassword, role: 'gestion', despacho: 'DESPACHO_GESTION' });
    console.log('✓ Created gestion user');

    // Create some sample registros
    const sampleRegistros = [
      {
        numero: '2025-0001',
        tipo: 'copia_simple' as const,
        hecha: false,
        notario: 'MAPE' as const,
        usuario: 'Juan Pérez',
        fecha: new Date('2025-01-15'),
        ubicacionActual: 'MATRIZ',
        historialUbicaciones: [{
          lugar: 'MATRIZ',
          usuario: 'Juan Pérez',
          fecha: new Date('2025-01-15'),
        }],
        qrCodeUrl: '',
        observaciones: 'Documento en matriz para revisión',
      },
      {
        numero: '2025-0002',
        tipo: 'presentacion_telematica' as const,
        hecha: true,
        notario: 'MCVF' as const,
        usuario: 'María García',
        fecha: new Date('2025-01-16'),
        ubicacionActual: 'ARCHIVO',
        historialUbicaciones: [
          { lugar: 'DESPACHO_COPISTA', usuario: 'María García', fecha: new Date('2025-01-16T09:00:00') },
          { lugar: '1_PRESENTACION', usuario: 'María García', fecha: new Date('2025-01-16T10:00:00') },
          { lugar: 'DESPACHO_MCVF', usuario: 'Notario MCVF', fecha: new Date('2025-01-16T14:00:00') },
          { lugar: 'ARCHIVO', usuario: 'María García', fecha: new Date('2025-01-16T16:00:00') },
        ],
        qrCodeUrl: '',
        observaciones: 'Presentación telemática completada y archivada',
      },
      {
        numero: '2025-0003',
        tipo: 'copia_simple' as const,
        hecha: false,
        notario: 'MAPE' as const,
        usuario: 'Juan Pérez',
        fecha: new Date('2025-01-17'),
        ubicacionActual: 'MOSTRADOR',
        historialUbicaciones: [
          { lugar: 'DESPACHO_OFICIAL', usuario: 'Juan Pérez', fecha: new Date('2025-01-17T10:00:00') },
          { lugar: 'DILIGENCIA', usuario: 'Juan Pérez', fecha: new Date('2025-01-17T11:00:00') },
          { lugar: 'MOSTRADOR', usuario: 'Carlos López', fecha: new Date('2025-01-17T15:00:00') },
        ],
        qrCodeUrl: '',
        observaciones: 'Documento en mostrador para entrega',
      },
      {
        numero: '2025-0004',
        tipo: 'presentacion_telematica' as const,
        hecha: false,
        notario: 'MCVF' as const,
        usuario: 'Ana Martínez',
        fecha: new Date('2025-01-18'),
        ubicacionActual: 'FACTURA',
        historialUbicaciones: [{
          lugar: 'FACTURA',
          usuario: 'Ana Martínez',
          fecha: new Date('2025-01-18'),
        }],
        qrCodeUrl: '',
        observaciones: 'Pendiente de facturación',
      },
      {
        numero: '2025-0005',
        tipo: 'copia_simple' as const,
        hecha: false,
        notario: 'MAPE' as const,
        usuario: 'María García',
        fecha: new Date('2025-01-19'),
        ubicacionActual: 'CATASTRO',
        historialUbicaciones: [
          { lugar: 'DESPACHO_COPISTA', usuario: 'María García', fecha: new Date('2025-01-19T08:00:00') },
          { lugar: 'COPIA', usuario: 'María García', fecha: new Date('2025-01-19T09:00:00') },
          { lugar: 'CATASTRO', usuario: 'María García', fecha: new Date('2025-01-19T11:00:00') },
        ],
        qrCodeUrl: '',
        observaciones: 'Enviado a catastro para registro',
      },
    ];

    for (const registroData of sampleRegistros) {
      const registro = new Registro(registroData);
      await registro.save();
    }
    console.log('✓ Created sample registros');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n⚠️  IMPORTANT: Save these credentials securely. They will not be shown again.\n');
    console.log('═'.repeat(80));
    console.log('USER CREDENTIALS');
    console.log('═'.repeat(80));
    
    credentials.forEach(({ email, password, role, despacho }) => {
      console.log(`\n${role.toUpperCase()} (${despacho})`);
      console.log(`  Email:    ${email}`);
      console.log(`  Password: ${password}`);
    });
    
    console.log('\n' + '═'.repeat(80));
    console.log('\n⚠️  Store these credentials in a secure password manager.');
    console.log('⚠️  Change passwords after first login in production.\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
