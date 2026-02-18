const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../uploads/test-file.txt');

console.log('Testing write to:', file);

try {
    fs.writeFileSync(file, 'test content');
    console.log('Write success');
    fs.unlinkSync(file);
    console.log('Cleanup success');
} catch (e) {
    console.log('Write failed');
    console.error(e);
}
