const fs = require('fs');
const path = require('path');

const backendPath = path.join(__dirname, 'backend');

if (fs.existsSync(backendPath)) {
  fs.rmSync(backendPath, { recursive: true, force: true });
  console.log('Successfully deleted backend directory');
} else {
  console.log('Backend directory does not exist');
}
