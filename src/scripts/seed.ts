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

    // Create copias user
    const copiasPassword = generateSecurePassword();
    const copiasPasswordHash = await bcrypt.hash(copiasPassword, 12);
    const copiasUser = new Usuario({
      email: 'copias@notaria.com',
      nombre: 'Juan Pérez',
      rol: 'copias',
      despacho: 'DESPACHO1',
      passwordHash: copiasPasswordHash,
    });
    await copiasUser.save();
    credentials.push({ email: 'copias@notaria.com', password: copiasPassword, role: 'copias', despacho: 'DESPACHO1' });
    console.log('✓ Created copias user');

    // Create another copias user
    const copiasPassword2 = generateSecurePassword();
    const copiasPassword2Hash = await bcrypt.hash(copiasPassword2, 12);
    const copiasUser2 = new Usuario({
      email: 'copias2@notaria.com',
      nombre: 'María García',
      rol: 'copias',
      despacho: 'DESPACHO2',
      passwordHash: copiasPassword2Hash,
    });
    await copiasUser2.save();
    credentials.push({ email: 'copias2@notaria.com', password: copiasPassword2, role: 'copias', despacho: 'DESPACHO2' });
    console.log('✓ Created copias user 2');

    // Create gestion user
    const gestionPassword = generateSecurePassword();
    const gestionPasswordHash = await bcrypt.hash(gestionPassword, 12);
    const gestionUser = new Usuario({
      email: 'gestion@notaria.com',
      nombre: 'Carlos López',
      rol: 'gestion',
      despacho: 'DESPACHO_GESTION',
      passwordHash: gestionPasswordHash,
    });
    await gestionUser.save();
    credentials.push({ email: 'gestion@notaria.com', password: gestionPassword, role: 'gestion', despacho: 'DESPACHO_GESTION' });
    console.log('✓ Created gestion user');

    // Create oficial user
    const oficialPassword = generateSecurePassword();
    const oficialPasswordHash = await bcrypt.hash(oficialPassword, 12);
    const oficialUser = new Usuario({
      email: 'oficial@notaria.com',
      nombre: 'Ana Rodríguez',
      rol: 'oficial',
      despacho: 'DESPACHO_OFICIAL',
      passwordHash: oficialPasswordHash,
    });
    await oficialUser.save();
    credentials.push({ email: 'oficial@notaria.com', password: oficialPassword, role: 'oficial', despacho: 'DESPACHO_OFICIAL' });
    console.log('✓ Created oficial user');

    // Create some sample registros
    const sampleRegistros = [
      {
        numero: '2025-0001',
        tipo: 'copia_simple' as const,
        hecha: false,
        notario: 'MAPE' as const,
        usuario: 'Juan Pérez',
        fecha: new Date('2025-01-15'),
        ubicacionActual: 'DESPACHO1',
        historialUbicaciones: [{
          lugar: 'DESPACHO1',
          usuario: 'Juan Pérez',
          fecha: new Date('2025-01-15'),
        }],
        qrCodeUrl: '',
        observaciones: 'Documento registrado correctamente',
      },
      {
        numero: '2025-0002',
        tipo: 'presentacion_telematica' as const,
        hecha: true,
        notario: 'MCVF' as const,
        usuario: 'Ana Rodríguez',
        fecha: new Date('2025-01-16'),
        ubicacionActual: 'ARCHIVO',
        historialUbicaciones: [
          { lugar: 'DESPACHO_OFICIAL', usuario: 'Ana Rodríguez', fecha: new Date('2025-01-16T09:00:00') },
          { lugar: 'DESPACHO_GESTION', usuario: 'Carlos López', fecha: new Date('2025-01-16T14:00:00') },
          { lugar: 'ARCHIVO', usuario: 'Juan Pérez', fecha: new Date('2025-01-16T16:00:00') },
        ],
        qrCodeUrl: '',
        observaciones: 'Presentación telemática completada y archivada',
      },
      {
        numero: '2025-0003',
        tipo: 'presentacion_telematica' as const,
        hecha: false,
        notario: 'MAPE' as const,
        usuario: 'Ana Rodríguez',
        fecha: new Date('2025-01-17'),
        ubicacionActual: 'DESPACHO2',
        historialUbicaciones: [
          { lugar: 'DESPACHO_OFICIAL', usuario: 'Ana Rodríguez', fecha: new Date('2025-01-17T10:00:00') },
          { lugar: 'DESPACHO2', usuario: 'María García', fecha: new Date('2025-01-17T15:00:00') },
        ],
        qrCodeUrl: '',
        observaciones: 'Pendiente de presentación telemática',
      },
      {
        numero: '2025-0004',
        tipo: 'copia_simple' as const,
        hecha: false,
        notario: 'MCVF' as const,
        usuario: 'Ana Rodríguez',
        fecha: new Date('2025-01-18'),
        ubicacionActual: 'DESPACHO_OFICIAL',
        historialUbicaciones: [{
          lugar: 'DESPACHO_OFICIAL',
          usuario: 'Ana Rodríguez',
          fecha: new Date('2025-01-18'),
        }],
        qrCodeUrl: '',
        observaciones: '',
      },
      {
        numero: '2025-0005',
        tipo: 'presentacion_telematica' as const,
        hecha: true,
        notario: 'MAPE' as const,
        usuario: 'Ana Rodríguez',
        fecha: new Date('2025-01-19'),
        ubicacionActual: 'DESPACHO_ADMIN',
        historialUbicaciones: [
          { lugar: 'DESPACHO_OFICIAL', usuario: 'Ana Rodríguez', fecha: new Date('2025-01-19T08:00:00') },
          { lugar: 'DESPACHO1', usuario: 'Juan Pérez', fecha: new Date('2025-01-19T11:00:00') },
          { lugar: 'DESPACHO_ADMIN', usuario: 'Administrador', fecha: new Date('2025-01-19T14:00:00') },
        ],
        qrCodeUrl: '',
        observaciones: 'Revisado y aprobado por administración',
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
