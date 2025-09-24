import { CRX3Packer } from '../src';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('CRX3 Packer Example\n');

  // 1. Generate a key pair
  console.log('1. Generating key pair...');
  const { privateKey, publicKey } = CRX3Packer.generateKeyPair();
  
  // Save keys to files
  const keysDir = path.join(__dirname, 'keys');
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
  }
  
  const privateKeyPath = path.join(keysDir, 'private.pem');
  const publicKeyPath = path.join(keysDir, 'public.pem');
  
  fs.writeFileSync(privateKeyPath, privateKey);
  fs.writeFileSync(publicKeyPath, publicKey);
  
  console.log(`   ✓ Private key saved: ${privateKeyPath}`);
  console.log(`   ✓ Public key saved: ${publicKeyPath}`);

  // 2. Get extension ID
  console.log('\n2. Getting extension ID...');
  const extensionId = CRX3Packer.getCrxIdFromPublicKey(publicKey);
  console.log(`   ✓ Extension ID: ${extensionId}`);

  // 3. Create a sample extension
  console.log('\n3. Creating sample extension...');
  const extensionDir = path.join(__dirname, 'sample-extension');
  if (!fs.existsSync(extensionDir)) {
    fs.mkdirSync(extensionDir, { recursive: true });
  }

  // Create manifest.json
  const manifest = {
    manifest_version: 3,
    name: 'Sample Extension',
    version: '1.0.0',
    description: 'A sample Chrome extension created with CRX3 Packer',
    permissions: ['activeTab'],
    action: {
      default_popup: 'popup.html'
    },
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['content.js']
      }
    ]
  };

  fs.writeFileSync(
    path.join(extensionDir, 'manifest.json'), 
    JSON.stringify(manifest, null, 2)
  );

  // Create popup.html
  const popupHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { width: 200px; padding: 10px; }
    button { width: 100%; padding: 10px; }
  </style>
</head>
<body>
  <h3>Sample Extension</h3>
  <button id="action-btn">Click me!</button>
  <script src="popup.js"></script>
</body>
</html>`.trim();

  fs.writeFileSync(path.join(extensionDir, 'popup.html'), popupHtml);

  // Create popup.js
  const popupJs = `
document.getElementById('action-btn').addEventListener('click', () => {
  alert('Hello from CRX3 Packer sample extension!');
});`.trim();

  fs.writeFileSync(path.join(extensionDir, 'popup.js'), popupJs);

  // Create content.js
  const contentJs = `
console.log('Sample extension content script loaded!');
console.log('Extension ID: ${extensionId}');`.trim();

  fs.writeFileSync(path.join(extensionDir, 'content.js'), contentJs);

  console.log(`   ✓ Sample extension created: ${extensionDir}`);

  // 4. Pack the extension
  console.log('\n4. Packing extension...');
  const packer = new CRX3Packer();
  const outputPath = path.join(__dirname, 'sample-extension.crx3');

  await packer.packDirectory(extensionDir, {
    privateKey,
    output: outputPath
  });

  console.log(`   ✓ Extension packed: ${outputPath}`);

  // 5. Verify the packed file
  console.log('\n5. Verifying packed file...');
  const fileStats = fs.statSync(outputPath);
  console.log(`   ✓ File size: ${fileStats.size} bytes`);

  // Check magic number and version
  const fileBuffer = fs.readFileSync(outputPath);
  const magic = fileBuffer.subarray(0, 4).toString('ascii');
  const version = fileBuffer.readUInt32LE(4);
  
  console.log(`   ✓ Magic number: ${magic}`);
  console.log(`   ✓ Version: ${version}`);

  console.log('\n✅ Example completed successfully!');
  console.log('\nTo install the extension:');
  console.log('1. Open Chrome and go to chrome://extensions/');
  console.log('2. Enable "Developer mode"');
  console.log(`3. Drag and drop the file: ${outputPath}`);
  console.log('4. The extension will be installed with ID:', extensionId);
}

if (require.main === module) {
  main().catch(console.error);
}

export { main };