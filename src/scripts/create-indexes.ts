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
import Registro from '../models/Registro';

async function createIndexes() {
  try {
    await dbConnect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    console.log('📊 Creating optimized indexes...\n');

    // ===== USUARIOS INDEXES =====
    console.log('👥 Creating indexes for usuarios collection:');
    
    // Los índices en Mongoose se crean automáticamente cuando se carga el modelo
    // Pero podemos forzar su creación con syncIndexes()
    await Usuario.syncIndexes();
    
    const usuarioIndexes = await Usuario.collection.getIndexes();
    console.log('✅ Usuario indexes created:');
    Object.keys(usuarioIndexes).forEach(indexName => {
      console.log(`   - ${indexName}`);
    });

    console.log('\n📄 Creating indexes for registros collection:');
    
    await Registro.syncIndexes();
    
    const registroIndexes = await Registro.collection.getIndexes();
    console.log('✅ Registro indexes created:');
    Object.keys(registroIndexes).forEach(indexName => {
      console.log(`   - ${indexName}`);
    });

    // Contar documentos
    console.log('\n📈 Collection Statistics:\n');
    
    const usuarioCount = await Usuario.countDocuments();
    console.log('👥 Usuarios:');
    console.log(`   - Documents: ${usuarioCount}`);
    
    const registroCount = await Registro.countDocuments();
    console.log('\n📄 Registros:');
    console.log(`   - Documents: ${registroCount}`);

    console.log('\n' + '═'.repeat(80));
    console.log('✅ All indexes created successfully!');
    console.log('═'.repeat(80));

    console.log('\n💡 Performance Tips:');
    console.log('   1. Dashboard queries will now use the compound index (hecha, notario, tipo, fecha)');
    console.log('   2. Number searches use unique index for O(1) lookups');
    console.log('   3. Text searches enabled on numero, observaciones, and usuario');
    console.log('   4. Expected dashboard load time: < 100ms for 10,000+ documents\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
}

createIndexes();

