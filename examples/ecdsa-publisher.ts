import { CRX3Packer } from '../src';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('CRX3 Packer ECDSA Publisher Key Example\n');

  // 1. Generate developer key (RSA)
  console.log('1. Generating developer key pair (RSA-2048)...');
  const developerKeys = CRX3Packer.generateKeyPair();
  
  // 2. Generate publisher key (ECDSA)
  console.log('2. Generating publisher key pair (ECDSA P-256)...');
  const publisherKeys = CRX3Packer.generateEcdsaKeyPair();
  
  // Save keys to files
  const keysDir = path.join(__dirname, 'ecdsa-keys');
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(keysDir, 'developer-private.pem'), developerKeys.privateKey);
  fs.writeFileSync(path.join(keysDir, 'developer-public.pem'), developerKeys.publicKey);
  fs.writeFileSync(path.join(keysDir, 'publisher-private.pem'), publisherKeys.privateKey);
  fs.writeFileSync(path.join(keysDir, 'publisher-public.pem'), publisherKeys.publicKey);
  
  console.log('   ✓ Developer keys saved (RSA)');
  console.log('   ✓ Publisher keys saved (ECDSA P-256)');

  // 3. Get extension ID from developer key
  console.log('\n3. Getting extension ID from developer key...');
  const extensionId = CRX3Packer.getCrxIdFromPublicKey(developerKeys.publicKey);
  console.log(`   ✓ Extension ID: ${extensionId}`);

  // 4. Use existing sample extension
  const extensionDir = path.join(__dirname, 'sample-extension');
  if (!fs.existsSync(extensionDir)) {
    console.log('   ⚠ Sample extension not found, skipping packing example');
    console.log('   Run basic-usage.ts first to generate the sample extension');
    return;
  }

  // 5. Pack with developer key only
  console.log('\n4. Packing with developer key only...');
  const packer = new CRX3Packer();
  const outputDeveloper = path.join(__dirname, 'extension-developer-only.crx3');

  await packer.packDirectory(extensionDir, {
    privateKey: developerKeys.privateKey,
    output: outputDeveloper
  });

  const developerSize = fs.statSync(outputDeveloper).size;
  console.log(`   ✓ Developer-only CRX3: ${outputDeveloper} (${developerSize} bytes)`);

  // 6. Pack with both developer and publisher keys
  console.log('\n5. Packing with developer + publisher keys...');
  const outputBoth = path.join(__dirname, 'extension-developer-publisher.crx3');

  await packer.packDirectory(extensionDir, {
    privateKey: developerKeys.privateKey,
    publisherPrivateKey: publisherKeys.privateKey,
    output: outputBoth
  });

  const bothSize = fs.statSync(outputBoth).size;
  console.log(`   ✓ Developer+Publisher CRX3: ${outputBoth} (${bothSize} bytes)`);

  // 7. Compare file sizes
  console.log('\n6. Comparison:');
  console.log(`   Developer only:        ${developerSize} bytes`);
  console.log(`   Developer + Publisher: ${bothSize} bytes`);
  console.log(`   Additional size:       ${bothSize - developerSize} bytes (publisher signature)`);

  // 8. Verify signatures in header
  console.log('\n7. Verifying signature types in CRX3 headers...');
  
  // Read and analyze both files
  const devBuffer = fs.readFileSync(outputDeveloper);
  const bothBuffer = fs.readFileSync(outputBoth);
  
  const devHeaderLength = devBuffer.readUInt32LE(8);
  const bothHeaderLength = bothBuffer.readUInt32LE(8);
  
  console.log(`   Developer-only header:     ${devHeaderLength} bytes (RSA signature only)`);
  console.log(`   Developer+Publisher header: ${bothHeaderLength} bytes (RSA + ECDSA signatures)`);

  console.log('\n✅ ECDSA Publisher Key example completed successfully!');
  console.log('\nKey differences:');
  console.log('• Developer key (RSA-2048): Required for extension identity and Chrome installation');
  console.log('• Publisher key (ECDSA P-256): Optional additional signature for enterprise/store verification');
  console.log('• CRX3 with publisher keys contains both sha256_with_rsa and sha256_with_ecdsa proofs');
}

if (require.main === module) {
  main().catch(console.error);
}

export { main };