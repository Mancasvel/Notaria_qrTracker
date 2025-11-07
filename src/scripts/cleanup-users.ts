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

async function cleanupUsers() {
  try {
    // Pass the URI explicitly to dbConnect
    await dbConnect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Emails de usuarios a eliminar (usuarios de prueba con notarioAsignado incorrecto)
    const emailsToDelete = [
      'oficial@notaria.com',
      'notario.mape@notaria.com',
      'notario.mcvf@notaria.com',
      'copista@notaria.com',
      'mostrador@notaria.com',
      'contabilidad@notaria.com',
      'gestion@notaria.com',
    ];

    console.log('\n🗑️  Deleting test users with incorrect schema...\n');

    for (const email of emailsToDelete) {
      const user = await Usuario.findOne({ email });
      
      if (user) {
        await Usuario.deleteOne({ email });
        console.log(`✓ Deleted: ${user.nombre} (${email})`);
      } else {
        console.log(`⚠️  User not found: ${email}`);
      }
    }

    // También eliminar cualquier usuario que tenga el campo notarioAsignado
    // (esto limpiará cualquier usuario antiguo con el esquema incorrecto)
    const usersWithNotarioAsignado = await Usuario.find({ notarioAsignado: { $exists: true } });
    
    if (usersWithNotarioAsignado.length > 0) {
      console.log('\n🧹 Cleaning users with old schema (notarioAsignado field)...\n');
      
      for (const user of usersWithNotarioAsignado) {
        // Eliminar el campo notarioAsignado
        await Usuario.updateOne(
          { _id: user._id },
          { $unset: { notarioAsignado: '' } }
        );
        console.log(`✓ Removed notarioAsignado field from: ${user.nombre} (${user.email})`);
      }
    }

    console.log('\n✅ Cleanup completed successfully!');
    console.log('\n═'.repeat(80));
    console.log('SUMMARY');
    console.log('═'.repeat(80));
    console.log(`\nDeleted ${emailsToDelete.length} test users`);
    console.log(`Cleaned ${usersWithNotarioAsignado.length} users with old schema`);
    console.log('\n' + '═'.repeat(80));

    // Mostrar usuarios restantes
    const remainingUsers = await Usuario.find({}).select('nombre email rol despacho');
    console.log('\n📋 Remaining users in database:\n');
    
    remainingUsers.forEach((user) => {
      console.log(`  • ${user.nombre.padEnd(20)} - ${user.email.padEnd(45)} [${user.rol}]`);
    });
    
    console.log('\n' + '═'.repeat(80));

    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupUsers();

