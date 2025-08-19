const { exec } = require('child_process');

console.log('Initializing Expo server...');

const command = 'npx expo start --host lan --port 8081 --clear';

const child = exec(command, {
  cwd: 'C:\\Validador\\validacionApp',
  windowsHide: true
});

child.stdout.on('data', (data) => {
  console.log(data.toString());
});

child.stderr.on('data', (data) => {
  console.error(data.toString());
});

child.on('close', (code) => {
  console.log(`Process finished with code: ${code}`);
});

child.on('error', (error) => {
  console.error(`Error: ${error.message}`);
});

// Keep the process alive
process.on('SIGINT', () => {
  child.kill();
  process.exit();
});
