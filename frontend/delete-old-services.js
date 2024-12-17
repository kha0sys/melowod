const fs = require('fs');
const path = require('path');

const oldServicesPath = path.join(__dirname, 'src', 'services');

if (fs.existsSync(oldServicesPath)) {
  fs.rmSync(oldServicesPath, { recursive: true, force: true });
  console.log('Successfully deleted old services directory');
} else {
  console.log('Old services directory does not exist');
}
