import { CRX3Packer } from '../src/packer';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('CRX3Packer', () => {
  let tempDir: string;
  let privateKey: string;
  let publicKey: string;

  beforeAll(() => {
    // Generate test keys
    const keyPair = CRX3Packer.generateKeyPair();
    privateKey = keyPair.privateKey;
    publicKey = keyPair.publicKey;

    // Create temp directory for tests
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crx3-test-'));
  });

  afterAll(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('generateKeyPair', () => {
    it('should generate valid RSA key pair', () => {
      const keyPair = CRX3Packer.generateKeyPair();
      
      expect(keyPair.privateKey).toContain('-----BEGIN PRIVATE KEY-----');
      expect(keyPair.privateKey).toContain('-----END PRIVATE KEY-----');
      expect(keyPair.publicKey).toContain('-----BEGIN PUBLIC KEY-----');
      expect(keyPair.publicKey).toContain('-----END PUBLIC KEY-----');
    });

    it('should generate valid ECDSA key pair', () => {
      const keyPair = CRX3Packer.generateEcdsaKeyPair();
      
      expect(keyPair.privateKey).toContain('-----BEGIN PRIVATE KEY-----');
      expect(keyPair.privateKey).toContain('-----END PRIVATE KEY-----');
      expect(keyPair.publicKey).toContain('-----BEGIN PUBLIC KEY-----');
      expect(keyPair.publicKey).toContain('-----END PUBLIC KEY-----');
    });
  });

  describe('getCrxIdFromPublicKey', () => {
    it('should generate consistent CRX ID from public key', () => {
      const crxId1 = CRX3Packer.getCrxIdFromPublicKey(publicKey);
      const crxId2 = CRX3Packer.getCrxIdFromPublicKey(publicKey);
      
      expect(crxId1).toBe(crxId2);
      expect(crxId1).toHaveLength(32); // 16 bytes * 2 chars per byte
      expect(crxId1).toMatch(/^[a-p]+$/); // Should only contain letters a-p
    });
  });

  describe('packDirectory', () => {
    let extensionDir: string;
    let outputPath: string;

    beforeEach(() => {
      // Create test extension directory
      extensionDir = path.join(tempDir, 'test-extension');
      fs.mkdirSync(extensionDir, { recursive: true });
      
      // Create manifest.json
      const manifest = {
        manifest_version: 3,
        name: 'Test Extension',
        version: '1.0.0',
        description: 'A test extension'
      };
      fs.writeFileSync(path.join(extensionDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
      
      // Create content script
      fs.writeFileSync(path.join(extensionDir, 'content.js'), 'console.log("Hello from extension!");');
      
      outputPath = path.join(tempDir, 'test-extension.crx3');
    });

    it('should pack directory into CRX3 file', async () => {
      const packer = new CRX3Packer();
      
      await packer.packDirectory(extensionDir, {
        privateKey,
        output: outputPath
      });

      // Check if CRX3 file was created
      expect(fs.existsSync(outputPath)).toBe(true);
      
      // Verify file starts with CRX3 magic number
      const fileBuffer = fs.readFileSync(outputPath);
      const magic = fileBuffer.subarray(0, 4).toString('ascii');
      expect(magic).toBe('Cr24');
      
      // Verify version
      const version = fileBuffer.readUInt32LE(4);
      expect(version).toBe(3);
    });

    it('should create valid file with correct structure', async () => {
      const packer = new CRX3Packer();
      
      await packer.packDirectory(extensionDir, {
        privateKey,
        output: outputPath
      });

      const fileBuffer = fs.readFileSync(outputPath);
      
      // Check magic number (4 bytes)
      expect(fileBuffer.subarray(0, 4).toString('ascii')).toBe('Cr24');
      
      // Check version (4 bytes)
      expect(fileBuffer.readUInt32LE(4)).toBe(3);
      
      // Check header length (4 bytes)
      const headerLength = fileBuffer.readUInt32LE(8);
      expect(headerLength).toBeGreaterThan(0);
      
      // Verify file is large enough to contain header + ZIP data
      expect(fileBuffer.length).toBeGreaterThan(12 + headerLength);
    });

    it('should pack with both developer and publisher keys', async () => {
      const packer = new CRX3Packer();
      const publisherKeys = CRX3Packer.generateEcdsaKeyPair();
      const outputWithPublisher = path.join(tempDir, 'test-with-publisher.crx3');
      
      await packer.packDirectory(extensionDir, {
        privateKey,
        publisherPrivateKey: publisherKeys.privateKey,
        output: outputWithPublisher
      });

      // Check if CRX3 file was created
      expect(fs.existsSync(outputWithPublisher)).toBe(true);
      
      // Verify file starts with CRX3 magic number
      const fileBuffer = fs.readFileSync(outputWithPublisher);
      const magic = fileBuffer.subarray(0, 4).toString('ascii');
      expect(magic).toBe('Cr24');
      
      // File with publisher signature should be larger than without
      const originalSize = fs.statSync(outputPath).size;
      const publisherSize = fs.statSync(outputWithPublisher).size;
      expect(publisherSize).toBeGreaterThan(originalSize);
    });
  });

  describe('packFromZipFile', () => {
    let zipPath: string;
    let outputPath: string;

    beforeEach(() => {
      // Create a simple zip file for testing
      zipPath = path.join(tempDir, 'test.zip');
      outputPath = path.join(tempDir, 'test-from-zip.crx3');
      
      // Create minimal zip content (this is a simplified approach for testing)
      const yazl = require('yazl');
      const zipFile = new yazl.ZipFile();
      zipFile.addBuffer(Buffer.from('{"manifest_version": 3, "name": "Test", "version": "1.0.0"}'), 'manifest.json');
      zipFile.end();
      
      // Write zip to file
      const writeStream = fs.createWriteStream(zipPath);
      zipFile.outputStream.pipe(writeStream);
      
      return new Promise<void>((resolve) => {
        writeStream.on('close', () => resolve());
      });
    });

    it('should pack zip file into CRX3 file', async () => {
      const packer = new CRX3Packer();
      
      await packer.packFromZipFile(zipPath, {
        privateKey,
        output: outputPath
      });

      // Check if CRX3 file was created
      expect(fs.existsSync(outputPath)).toBe(true);
      
      // Verify file starts with CRX3 magic number
      const fileBuffer = fs.readFileSync(outputPath);
      const magic = fileBuffer.subarray(0, 4).toString('ascii');
      expect(magic).toBe('Cr24');
    });
  });

  describe('error handling', () => {
    it('should throw error for non-existent directory', async () => {
      const packer = new CRX3Packer();
      
      await expect(packer.packDirectory('/non/existent/path', {
        privateKey,
        output: path.join(tempDir, 'should-not-exist.crx3')
      })).rejects.toThrow();
    });

    it('should throw error for invalid private key', async () => {
      const packer = new CRX3Packer();
      
      // Create test directory
      const testDir = path.join(tempDir, 'test-invalid-key');
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, 'manifest.json'), '{}');
      
      await expect(packer.packDirectory(testDir, {
        privateKey: 'invalid-key',
        output: path.join(tempDir, 'should-fail.crx3')
      })).rejects.toThrow();
    });
  });
});