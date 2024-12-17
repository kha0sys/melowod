const fs = require('fs');
const path = require('path');

const filesToDelete = [
  'src/services/auth/auth.service.ts',
  'src/config/firebase.ts'
];

const rootDir = path.join(__dirname);

filesToDelete.forEach(file => {
  const fullPath = path.join(rootDir, file);
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted: ${file}`);
      
      // Try to remove parent directory if empty
      const parentDir = path.dirname(fullPath);
      const parentContents = fs.readdirSync(parentDir);
      if (parentContents.length === 0) {
        fs.rmdirSync(parentDir);
        console.log(`Removed empty directory: ${path.relative(rootDir, parentDir)}`);
        
        // Try to remove grandparent directory if empty
        const grandParentDir = path.dirname(parentDir);
        const grandParentContents = fs.readdirSync(grandParentDir);
        if (grandParentContents.length === 0) {
          fs.rmdirSync(grandParentDir);
          console.log(`Removed empty directory: ${path.relative(rootDir, grandParentDir)}`);
        }
      }
    }
  } catch (error) {
    console.log(`Error with ${file}:`, error.message);
  }
});
