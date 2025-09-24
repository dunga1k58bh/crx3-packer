import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as yauzl from 'yauzl';
import * as yazl from 'yazl';
import { promisify } from 'util';
import { crx_file } from './crx3.proto';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

export interface PackOptions {
  /** Private key for signing (PEM format) */
  privateKey: string | Buffer;
  /** Output path for the .crx3 file */
  output: string;
  /** Optional CRX ID override (will be derived from public key if not provided) */
  crxId?: Buffer;
  /** Optional publisher private key for publisher signatures (ECDSA P-256) */
  publisherPrivateKey?: string | Buffer;
}

export class CRX3Packer {
  private static readonly CRX3_MAGIC = Buffer.from('Cr24', 'ascii');
  private static readonly CRX3_VERSION = 3;

  /**
   * Pack a directory into a CRX3 file
   */
  async packDirectory(inputDir: string, options: PackOptions): Promise<void> {
    // Create a temporary zip file
    const tempZip = Buffer.from(await this.createZipFromDirectory(inputDir));
    await this.packZip(tempZip, options);
  }

  /**
   * Pack a zip file into a CRX3 file
   */
  async packZip(zipData: Buffer, options: PackOptions): Promise<void> {
    // Parse private keys
    const privateKey = typeof options.privateKey === 'string' 
      ? Buffer.from(options.privateKey) 
      : options.privateKey;

    let publisherPrivateKey: Buffer | undefined;
    if (options.publisherPrivateKey) {
      publisherPrivateKey = typeof options.publisherPrivateKey === 'string'
        ? Buffer.from(options.publisherPrivateKey)
        : options.publisherPrivateKey;
    }

    // Generate public keys from private keys
    const publicKey = this.getPublicKeyFromPrivate(privateKey);
    
    // Generate or use provided CRX ID
    const crxId = options.crxId || this.generateCrxId(publicKey);

    // Create signed data
    const signedData = crx_file.SignedData.create({
      crxId: crxId
    });
    const signedDataBytes = crx_file.SignedData.encode(signedData).finish();

    // Prepare asymmetric key proofs
    const rsaProofs: any[] = [];
    const ecdsaProofs: any[] = [];

    // Create developer key proof (always RSA)
    const developerSignature = this.createCrx3Signature(signedDataBytes, zipData, privateKey);
    const developerKeyProof = crx_file.AsymmetricKeyProof.create({
      publicKey: publicKey,
      signature: developerSignature
    });
    rsaProofs.push(developerKeyProof);

    // Create publisher key proof if provided (ECDSA)
    if (publisherPrivateKey) {
      const publisherPublicKey = this.getEcdsaPublicKeyFromPrivate(publisherPrivateKey);
      const publisherSignature = this.createCrx3EcdsaSignature(signedDataBytes, zipData, publisherPrivateKey);
      const publisherKeyProof = crx_file.AsymmetricKeyProof.create({
        publicKey: publisherPublicKey,
        signature: publisherSignature
      });
      ecdsaProofs.push(publisherKeyProof);
    }

    // Create CRX file header
    const header = crx_file.CrxFileHeader.create({
      sha256WithRsa: rsaProofs,
      sha256WithEcdsa: ecdsaProofs.length > 0 ? ecdsaProofs : undefined,
      signedHeaderData: signedDataBytes
    });

    // Encode header
    const headerBytes = crx_file.CrxFileHeader.encode(header).finish();
    const headerLength = headerBytes.length;

    // Create final CRX3 file
    const crx3File = Buffer.concat([
      CRX3Packer.CRX3_MAGIC,                           // Magic number 'Cr24'
      Buffer.from([CRX3Packer.CRX3_VERSION, 0, 0, 0]), // Version (4 bytes, little-endian)
      Buffer.from([
        headerLength & 0xff,
        (headerLength >> 8) & 0xff,
        (headerLength >> 16) & 0xff,
        (headerLength >> 24) & 0xff
      ]),                                        // Header length (4 bytes, little-endian)
      headerBytes,                               // Protobuf header
      zipData                                    // ZIP content
    ]);

    // Write to output file
    await writeFile(options.output, crx3File);
  }

  /**
   * Pack from a zip file path
   */
  async packFromZipFile(zipPath: string, options: PackOptions): Promise<void> {
    const zipData = await readFile(zipPath);
    await this.packZip(zipData, options);
  }

  private async createZipFromDirectory(inputDir: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const zipFile = new yazl.ZipFile();
      const chunks: Buffer[] = [];

      zipFile.outputStream.on('data', (chunk) => chunks.push(chunk));
      zipFile.outputStream.on('end', () => resolve(Buffer.concat(chunks)));
      zipFile.outputStream.on('error', reject);

      this.addDirectoryToZip(zipFile, inputDir, '')
        .then(() => zipFile.end())
        .catch(reject);
    });
  }

  private async addDirectoryToZip(zipFile: yazl.ZipFile, dirPath: string, zipPath: string): Promise<void> {
    const items = await readdir(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const zipItemPath = zipPath ? `${zipPath}/${item}` : item;
      const itemStat = await stat(itemPath);

      if (itemStat.isDirectory()) {
        await this.addDirectoryToZip(zipFile, itemPath, zipItemPath);
      } else {
        zipFile.addFile(itemPath, zipItemPath);
      }
    }
  }

  private getPublicKeyFromPrivate(privateKey: Buffer): Buffer {
    const keyObject = crypto.createPrivateKey({
      key: privateKey,
      format: 'pem'
    });

    const publicKey = crypto.createPublicKey(keyObject);
    
    return publicKey.export({
      type: 'spki',
      format: 'der'
    }) as Buffer;
  }

  private generateCrxId(publicKey: Buffer): Buffer {
    const hash = crypto.createHash('sha256');
    hash.update(publicKey);
    const fullHash = hash.digest();
    
    // Take first 16 bytes (128 bits) of the hash
    return fullHash.subarray(0, 16);
  }

  private createSignature(data: Buffer, privateKey: Buffer): Buffer {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(data);
    sign.end();
    
    return sign.sign({
      key: privateKey,
      format: 'pem'
    });
  }

  /**
   * Create a CRX3-compliant signature according to the specification:
   * Signature is over "CRX3 SignedData\x00" + signed_header_size + signed_header_data + archive
   */
  private createCrx3Signature(signedDataBytes: Uint8Array, zipData: Buffer, privateKey: Buffer): Buffer {
    // Convert to Buffer for consistent handling
    const signedDataBuffer = Buffer.from(signedDataBytes);
    
    // Create the data to sign according to CRX3 spec
    const prefix = Buffer.from('CRX3 SignedData\x00', 'utf8');
    const signedHeaderSize = Buffer.alloc(4);
    signedHeaderSize.writeUInt32LE(signedDataBuffer.length, 0);
    
    const dataToSign = Buffer.concat([
      prefix,           // "CRX3 SignedData\x00"
      signedHeaderSize, // signed_header_size (4 bytes, little-endian)
      signedDataBuffer, // signed_header_data
      zipData          // archive
    ]);

    // Create PKCS#1 v1.5 signature with RSA-SHA256 (to match Chrome's implementation)
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(dataToSign);
    sign.end();

    return sign.sign({
      key: privateKey,
      format: 'pem',
      padding: crypto.constants.RSA_PKCS1_PADDING
    });
  }

  /**
   * Create a CRX3-compliant ECDSA signature for publisher keys
   * Uses NIST P-256 curve as specified in the proto file
   */
  private createCrx3EcdsaSignature(signedDataBytes: Uint8Array, zipData: Buffer, privateKey: Buffer): Buffer {
    // Convert to Buffer for consistent handling
    const signedDataBuffer = Buffer.from(signedDataBytes);
    
    // Create the data to sign according to CRX3 spec
    const prefix = Buffer.from('CRX3 SignedData\x00', 'utf8');
    const signedHeaderSize = Buffer.alloc(4);
    signedHeaderSize.writeUInt32LE(signedDataBuffer.length, 0);
    
    const dataToSign = Buffer.concat([
      prefix,           // "CRX3 SignedData\x00"
      signedHeaderSize, // signed_header_size (4 bytes, little-endian)
      signedDataBuffer, // signed_header_data
      zipData          // archive
    ]);

    // Create ECDSA signature with P-256 curve
    const sign = crypto.createSign('SHA256');
    sign.update(dataToSign);
    sign.end();

    return sign.sign({
      key: privateKey,
      format: 'pem'
    });
  }

  private getEcdsaPublicKeyFromPrivate(privateKey: Buffer): Buffer {
    const keyObject = crypto.createPrivateKey({
      key: privateKey,
      format: 'pem'
    });

    const publicKey = crypto.createPublicKey(keyObject);
    
    // For ECDSA, we need the public key in uncompressed format (x and y coordinates)
    return publicKey.export({
      type: 'spki',
      format: 'der'
    }) as Buffer;
  }

  /**
   * Generate a new RSA key pair for extension signing
   */
  static generateKeyPair(): { privateKey: string; publicKey: string } {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return { privateKey, publicKey };
  }

  /**
   * Generate a new ECDSA key pair for publisher signing (P-256 curve)
   */
  static generateEcdsaKeyPair(): { privateKey: string; publicKey: string } {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'prime256v1', // NIST P-256
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return { privateKey, publicKey };
  }

  /**
   * Get CRX ID from a public key
   */
  static getCrxIdFromPublicKey(publicKey: string | Buffer): string {
    let keyBuffer: Buffer;
    
    if (typeof publicKey === 'string') {
      const keyObject = crypto.createPublicKey(publicKey);
      keyBuffer = keyObject.export({ type: 'spki', format: 'der' }) as Buffer;
    } else {
      keyBuffer = publicKey;
    }

    const hash = crypto.createHash('sha256');
    hash.update(keyBuffer);
    const fullHash = hash.digest();
    
    // Convert first 16 bytes to extension ID format (base32)
    const crxIdBytes = fullHash.subarray(0, 16);
    let result = '';
    
    for (const byte of crxIdBytes) {
      result += String.fromCharCode(97 + (byte & 15)) + String.fromCharCode(97 + ((byte >> 4) & 15));
    }
    
    return result;
  }
}