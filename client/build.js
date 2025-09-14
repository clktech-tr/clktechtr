const { execSync } = require('child_process');

console.log('Starting client build...');

try {
  // Run Vite build directly using npx
  console.log('Running Vite build...');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Client build completed successfully.');
} catch (error) {
  console.error('Client build error:', error);
  process.exit(1);
}