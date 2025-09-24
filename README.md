# CRX3 Packer

A Node.js package for packing Chrome extensions into the CRX3 format. This package allows you to create signed `.crx3` files from directories or zip files, which can then be distributed as Chrome extensions.

## Features

- ✅ Pack directories into CRX3 format
- ✅ Pack zip files into CRX3 format  
- ✅ Generate RSA key pairs for signing
- ✅ Command-line interface
- ✅ TypeScript support
- ✅ Follows Chrome Extension CRX3 specification

## Installation

```bash
npm install crx3-packer
```

Or install globally for CLI usage:

```bash
npm install -g crx3-packer
```

## Quick Start

### Programmatic Usage

```typescript
import { CRX3Packer } from 'crx3-packer';
import * as fs from 'fs';

// Generate a key pair (do this once)
const { privateKey, publicKey } = CRX3Packer.generateKeyPair();
fs.writeFileSync('private.pem', privateKey);
fs.writeFileSync('public.pem', publicKey);

// Pack a directory
const packer = new CRX3Packer();
await packer.packDirectory('./my-extension', {
  privateKey: fs.readFileSync('private.pem', 'utf8'),
  output: './my-extension.crx3'
});

console.log('Extension packed successfully!');
```

### CLI Usage

```bash
# Generate a developer key pair
crx3-pack generate-key -o ./keys

# Generate a publisher key pair
crx3-pack generate-key -o ./keys --publisher

# Pack a directory with developer key only
crx3-pack pack -i ./my-extension -o ./my-extension.crx3 -k ./keys/private.pem

# Pack with both developer and publisher keys
crx3-pack pack -i ./my-extension -o ./my-extension.crx3 -k ./keys/private.pem --publisher-key ./keys/publisher-private.pem

# Pack a zip file
crx3-pack pack -i ./my-extension.zip -o ./my-extension.crx3 -k ./keys/private.pem

# Get extension ID from public key
crx3-pack get-crx-id -k ./keys/public.pem
```

## API Reference

### CRX3Packer Class

#### Methods

##### `packDirectory(inputDir: string, options: PackOptions): Promise<void>`

Packs a directory into a CRX3 file.

**Parameters:**
- `inputDir` - Path to the directory to pack
- `options` - Packing options (see PackOptions interface)

**Example:**
```typescript
await packer.packDirectory('./extension-folder', {
  privateKey: privateKeyString,
  output: './extension.crx3'
});
```

##### `packZip(zipData: Buffer, options: PackOptions): Promise<void>`

Packs zip data into a CRX3 file.

**Parameters:**
- `zipData` - Buffer containing zip file data
- `options` - Packing options (see PackOptions interface)

##### `packFromZipFile(zipPath: string, options: PackOptions): Promise<void>`

Packs a zip file into a CRX3 file.

**Parameters:**
- `zipPath` - Path to the zip file
- `options` - Packing options (see PackOptions interface)

#### Static Methods

##### `generateKeyPair(): { privateKey: string; publicKey: string }`

Generates a new RSA key pair for signing extensions (developer keys).

**Returns:**
- Object with `privateKey` and `publicKey` in PEM format (RSA-2048)

**Example:**
```typescript
const { privateKey, publicKey } = CRX3Packer.generateKeyPair();
```

##### `generateEcdsaKeyPair(): { privateKey: string; publicKey: string }`

Generates a new ECDSA key pair for publisher signing (P-256 curve).

**Returns:**
- Object with `privateKey` and `publicKey` in PEM format (ECDSA P-256)

**Example:**
```typescript
const { privateKey, publicKey } = CRX3Packer.generateEcdsaKeyPair();
```

##### `getCrxIdFromPublicKey(publicKey: string | Buffer): string`

Generates a CRX ID (extension ID) from a public key.

**Parameters:**
- `publicKey` - Public key in PEM format or as Buffer

**Returns:**
- Extension ID as string

### PackOptions Interface

```typescript
interface PackOptions {
  /** Private key for signing (PEM format) */
  privateKey: string | Buffer;
  /** Output path for the .crx3 file */
  output: string;
  /** Optional CRX ID override (will be derived from public key if not provided) */
  crxId?: Buffer;
  /** Optional publisher private key for publisher signatures (ECDSA P-256) */
  publisherPrivateKey?: string | Buffer;
}
```

## CLI Commands

### `pack`

Pack a directory or zip file into CRX3 format.

```bash
crx3-pack pack -i <input> -o <output> -k <key> [--publisher-key <publisher-key>] [--crx-id <id>]
```

**Options:**
- `-i, --input <path>` - Input directory or zip file path (required)
- `-o, --output <path>` - Output CRX3 file path (required)  
- `-k, --key <path>` - Developer private key file path in PEM format (required)
- `--publisher-key <path>` - Optional publisher private key file path in PEM format
- `--crx-id <id>` - Optional CRX ID override in hex format

### `generate-key`

Generate a new RSA key pair for signing.

```bash
crx3-pack generate-key -o <output> [--publisher]
```

**Options:**
- `-o, --output <path>` - Output directory for key files (required)
- `--publisher` - Generate publisher key pair instead of developer key pair

Creates (for developer keys):
- `private.pem` - Private key for signing
- `public.pem` - Public key for verification
- Displays the extension ID in console

Creates (for publisher keys):
- `publisher-private.pem` - Publisher private key for signing (ECDSA P-256)
- `publisher-public.pem` - Publisher public key for verification (ECDSA P-256)

### `get-crx-id`

Get CRX ID (extension ID) from a public key.

```bash
crx3-pack get-crx-id -k <key>
```

**Options:**
- `-k, --key <path>` - Public key file path in PEM format (required)

## CRX3 Format

The CRX3 format is the current Chrome extension packaging format that replaced CRX2. It uses:

- **Magic Number**: `Cr24` (4 bytes)
- **Version**: `3` (4 bytes, little-endian)
- **Header Length**: Length of protobuf header (4 bytes, little-endian)
- **Protobuf Header**: Contains signatures and metadata
- **ZIP Content**: The actual extension files

The protobuf schema includes:
- RSA-SHA256 signatures with PKCS#1 PSS padding
- Public keys in X.509 SubjectPublicKeyInfo format
- CRX ID derived from the first 128 bits of the SHA-256 hash of the public key

### Publisher Keys

CRX3 supports both developer keys and publisher keys:

- **Developer Key**: Required for all extensions. Uses RSA-2048 keys. Used to generate the extension ID.
- **Publisher Key**: Optional. Uses ECDSA P-256 keys. Used by Chrome Web Store and enterprise deployments for additional verification.

The signature format follows the CRX3 specification:
```
"CRX3 SignedData\x00" + signed_header_size + signed_header_data + archive
```

Where:
- `signed_header_size` is the length of the SignedData protobuf message (4 bytes, little-endian)
- `signed_header_data` is the encoded SignedData message containing the CRX ID
- `archive` is the ZIP file content

## Security Notes

- Keep your private key secure and never commit it to version control
- The extension ID is deterministically derived from your public key
- CRX3 files are signed to ensure integrity and authenticity
- Chrome will only install properly signed CRX3 files

## Examples

### Basic Extension Packing

```typescript
import { CRX3Packer } from 'crx3-packer';

async function packExtension() {
  const packer = new CRX3Packer();
  
  await packer.packDirectory('./my-chrome-extension', {
    privateKey: '-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----',
    output: './extension.crx3'
  });
}
```

### Generate Keys and Pack

```typescript
import { CRX3Packer } from 'crx3-packer';
import * as fs from 'fs';

// Generate developer keys (RSA)
const developerKeys = CRX3Packer.generateKeyPair();
fs.writeFileSync('./developer-private.pem', developerKeys.privateKey);
fs.writeFileSync('./developer-public.pem', developerKeys.publicKey);

// Generate publisher keys (ECDSA P-256)
const publisherKeys = CRX3Packer.generateEcdsaKeyPair();
fs.writeFileSync('./publisher-private.pem', publisherKeys.privateKey);
fs.writeFileSync('./publisher-public.pem', publisherKeys.publicKey);

// Get extension ID (from developer key)
const extensionId = CRX3Packer.getCrxIdFromPublicKey(developerKeys.publicKey);
console.log('Extension ID:', extensionId);

// Pack extension with both developer and publisher signatures
const packer = new CRX3Packer();
await packer.packDirectory('./extension-source', {
  privateKey: developerKeys.privateKey,
  publisherPrivateKey: publisherKeys.privateKey, // Optional
  output: './extension.crx3'
});
```

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Changelog

### 1.0.0
- Initial release
- Support for packing directories and zip files to CRX3
- CLI interface
- Key generation utilities
- TypeScript support