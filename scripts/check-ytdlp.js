const { execSync } = require('child_process');
console.log('--- Checking for yt-dlp ---');
try {
  execSync(process.platform === 'win32' ? 'where yt-dlp' : 'which yt-dlp', { stdio: 'ignore' });
  console.log('✅ yt-dlp found.');
} catch {
  console.log('\n❌ yt-dlp NOT found!\n');
  console.log('Windows:  winget install --id=yt-dlp.yt-dlp -e');
  console.log('macOS:    brew install yt-dlp');
  console.log('Linux:    sudo apt install yt-dlp\n');
  console.log('Or download from: https://github.com/yt-dlp/yt-dlp/releases\n');
}
