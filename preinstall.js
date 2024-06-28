if (!process.env.CI) {
  const { execSync } = require('child_process');
  execSync('npx only-allow yarn', { stdio: 'inherit' });
}
