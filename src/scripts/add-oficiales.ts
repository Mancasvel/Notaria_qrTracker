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

// NOW import modules that depend on environment variables
import dbConnect from '../lib/mongodb';
import Usuario from '../models/Usuario';
import bcrypt from 'bcryptjs';

async function addOficiales() {
  try {
    // Pass the URI explicitly to dbConnect
    await dbConnect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const password = 'ññ61pv';
    const passwordHash = await bcrypt.hash(password, 12);

    const oficiales = [
      {
        email: 'angela@notariadelpozo.com',
        nombre: 'Angela',
        rol: 'oficial',
        despacho: 'DESPACHO_ANGELA',
        passwordHash,
      },
      {
        email: 'olga@notariadelpozo.com',
        nombre: 'Olga',
        rol: 'oficial',
        despacho: 'DESPACHO_OLGA',
        passwordHash,
      },
      {
        email: 'rocio@notariacarmenvela.com',
        nombre: 'Rocio',
        rol: 'oficial',
        despacho: 'DESPACHO_ROCIO',
        passwordHash,
      },
      {
        email: 'rafa@notariadelpozo.com',
        nombre: 'Rafa',
        rol: 'oficial',
        despacho: 'DESPACHO_RAFA',
        passwordHash,
      },
      {
        email: 'patricia@notariadelpozo.com',
        nombre: 'Patricia',
        rol: 'oficial',
        despacho: 'DESPACHO_PATRICIA',
        passwordHash,
      },
      {
        email: 'miguelangel@notariadelpozo.com',
        nombre: 'Miguel Angel',
        rol: 'oficial',
        despacho: 'DESPACHO_MIGUELANGEL',
        passwordHash,
      },
      {
        email: 'marfonseca@notariacarmenvela.com',
        nombre: 'Mar Fonseca',
        rol: 'oficial',
        despacho: 'DESPACHO_MARFONSECA',
        passwordHash,
      },
      {
        email: 'matilde@notariadelpozo.com',
        nombre: 'Matilde',
        rol: 'oficial',
        despacho: 'DESPACHO_MATILDE',
        passwordHash,
      },
      {
        email: 'manuel@notariacarmenvela.com',
        nombre: 'Manuel',
        rol: 'oficial',
        despacho: 'DESPACHO_MANUEL',
        passwordHash,
      },
      {
        email: 'fvela@despacho.notariado.org',
        nombre: 'F. Vela',
        rol: 'oficial',
        despacho: 'DESPACHO_FVELA',
        passwordHash,
      },
    ];

    console.log('\n📝 Creating oficial users...\n');

    for (const oficialData of oficiales) {
      // Check if user already exists
      const existingUser = await Usuario.findOne({ email: oficialData.email });
      
      if (existingUser) {
        console.log(`⚠️  User ${oficialData.email} already exists. Updating...`);
        existingUser.nombre = oficialData.nombre;
        existingUser.rol = oficialData.rol as any;
        existingUser.despacho = oficialData.despacho;
        existingUser.passwordHash = oficialData.passwordHash;
        await existingUser.save();
        console.log(`✓ Updated: ${oficialData.nombre} (${oficialData.email})`);
      } else {
        const usuario = new Usuario(oficialData);
        await usuario.save();
        console.log(`✓ Created: ${oficialData.nombre} (${oficialData.email})`);
      }
    }

    console.log('\n✅ All oficial users created/updated successfully!');
    console.log('\n═'.repeat(80));
    console.log('CREDENTIALS FOR ALL USERS');
    console.log('═'.repeat(80));
    console.log(`\nPassword for all users: ${password}`);
    console.log('\nUsers:');
    oficiales.forEach(({ email, nombre }) => {
      console.log(`  • ${nombre.padEnd(20)} - ${email.padEnd(45)}`);
    });
    console.log('\n' + '═'.repeat(80));

    process.exit(0);
  } catch (error) {
    console.error('Error adding oficiales:', error);
    process.exit(1);
  }
}

addOficiales();

