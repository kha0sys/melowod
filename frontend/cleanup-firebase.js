const fs = require('fs');
const path = require('path');

const filesToDelete = [
  'src/lib/firebase/firebase.ts',
  'src/lib/firebase-storage.ts',
  'src/config/firebase.ts',
  'src/lib/firebase.ts'
];

filesToDelete.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted ${file}`);
  }
});

// Remove empty directories
const dirsToCheck = [
  'src/lib/firebase',
  'src/config'
];

dirsToCheck.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    if (files.length === 0) {
      fs.rmdirSync(dirPath);
      console.log(`Removed empty directory ${dir}`);
    }
  }
});
