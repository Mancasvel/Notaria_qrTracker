/**
 * Script de diagnóstico para .env.local
 * Verifica el formato sin mostrar valores sensibles
 */
import fs from 'fs';
import path from 'path';

const envLocalPath = path.join(process.cwd(), '.env.local');

console.log('\n' + '═'.repeat(80));
console.log('DIAGNÓSTICO DE .env.local');
console.log('═'.repeat(80) + '\n');

if (!fs.existsSync(envLocalPath)) {
  console.log('❌ El archivo .env.local no existe');
  process.exit(1);
}

console.log('✅ Archivo .env.local encontrado\n');

// Leer el archivo
const content = fs.readFileSync(envLocalPath, 'utf-8');

// Detectar problemas de encoding
if (content.charCodeAt(0) === 0xFEFF) {
  console.log('⚠️  PROBLEMA DETECTADO: El archivo tiene BOM (Byte Order Mark)');
  console.log('   Esto puede causar que las variables no se carguen correctamente\n');
}

// Analizar líneas
const lines = content.split('\n');
const validLines: Array<{ line: number; key: string; hasValue: boolean; format: string }> = [];
const invalidLines: Array<{ line: number; content: string; issue: string }> = [];

lines.forEach((line, index) => {
  const lineNum = index + 1;
  const trimmed = line.trim();
  
  // Saltar líneas vacías y comentarios
  if (!trimmed || trimmed.startsWith('#')) {
    return;
  }
  
  // Verificar formato KEY=VALUE
  if (!trimmed.includes('=')) {
    invalidLines.push({
      line: lineNum,
      content: trimmed.substring(0, 50),
      issue: 'No contiene el signo ='
    });
    return;
  }
  
  const parts = trimmed.split('=');
  if (parts.length < 2) {
    invalidLines.push({
      line: lineNum,
      content: trimmed.substring(0, 50),
      issue: 'Formato incorrecto (falta valor después del =)'
    });
    return;
  }
  
  const key = parts[0].trim();
  const value = parts.slice(1).join('=').trim();
  
  // Verificar que la clave no esté vacía
  if (!key) {
    invalidLines.push({
      line: lineNum,
      content: trimmed.substring(0, 50),
      issue: 'La clave está vacía'
    });
    return;
  }
  
  // Verificar que no haya espacios alrededor del =
  if (trimmed.includes(' =') || trimmed.includes('= ')) {
    invalidLines.push({
      line: lineNum,
      content: trimmed.substring(0, 50),
      issue: 'Hay espacios alrededor del signo = (debe ser KEY=VALUE sin espacios)'
    });
    return;
  }
  
  validLines.push({
    line: lineNum,
    key: key,
    hasValue: !!value,
    format: value ? 'OK' : 'VACÍO'
  });
});

console.log('📋 Análisis de líneas:\n');

if (validLines.length > 0) {
  console.log('✅ Líneas válidas:');
  validLines.forEach(({ line, key, hasValue, format }) => {
    const status = hasValue ? '✅' : '⚠️';
    console.log(`   ${status} Línea ${line}: ${key} ${hasValue ? `(valor presente, ${format})` : '(SIN VALOR)'}`);
  });
  console.log('');
}

if (invalidLines.length > 0) {
  console.log('❌ Líneas con problemas:');
  invalidLines.forEach(({ line, content, issue }) => {
    console.log(`   ❌ Línea ${line}: ${issue}`);
    console.log(`      Contenido: ${content}...`);
  });
  console.log('');
}

// Verificar variables requeridas
const requiredVars = ['MONGODB_URI', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'];
const foundVars = validLines.map(l => l.key);
const missingVars = requiredVars.filter(v => !foundVars.includes(v));

console.log('🔍 Variables requeridas:');
requiredVars.forEach(varName => {
  const found = foundVars.includes(varName);
  const lineInfo = validLines.find(l => l.key === varName);
  console.log(`   ${found ? '✅' : '❌'} ${varName} ${found && lineInfo ? `(línea ${lineInfo.line}, ${lineInfo.hasValue ? 'con valor' : 'SIN VALOR'})` : '(NO ENCONTRADA)'}`);
});

if (missingVars.length > 0) {
  console.log(`\n❌ Faltan ${missingVars.length} variable(s) requerida(s): ${missingVars.join(', ')}`);
}

console.log('\n' + '═'.repeat(80));
console.log('RECOMENDACIONES:');
console.log('═'.repeat(80));

if (invalidLines.length > 0) {
  console.log('\n1. Corrige las líneas con problemas listadas arriba');
}

if (missingVars.length > 0) {
  console.log(`\n2. Agrega las variables faltantes: ${missingVars.join(', ')}`);
}

const emptyVars = validLines.filter(l => !l.hasValue);
if (emptyVars.length > 0) {
  console.log(`\n3. Las siguientes variables están definidas pero sin valor:`);
  emptyVars.forEach(({ key, line }) => {
    console.log(`   - ${key} (línea ${line})`);
  });
}

console.log('\n4. Formato correcto de cada línea debe ser:');
console.log('   KEY=value');
console.log('   Sin espacios alrededor del =');
console.log('   Sin comillas a menos que sean parte del valor');
console.log('   Cada variable en su propia línea\n');

console.log('═'.repeat(80) + '\n');



