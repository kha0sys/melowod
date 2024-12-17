const fs = require('fs');
const path = require('path');

// Eliminar la carpeta lib
const libPath = path.join(__dirname, 'lib');
if (fs.existsSync(libPath)) {
  fs.rmSync(libPath, { recursive: true, force: true });
  console.log('Successfully deleted lib directory');
}

// Crear la estructura de carpetas si no existe
const directories = [
  'src/domain/entities',
  'src/domain/repositories',
  'src/application/wod',
  'src/application/user',
  'src/infrastructure/firebase',
];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});
