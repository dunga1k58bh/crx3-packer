# Examples

This directory contains example usage of the CRX3 Packer.

## Running the Examples

1. Make sure you have built the project:
   ```bash
   npm run build
   ```

2. Run the TypeScript example directly:
   ```bash
   npx ts-node examples/basic-usage.ts
   ```

3. Or compile and run:
   ```bash
   npx tsc examples/basic-usage.ts --target ES2020 --module commonjs --esModuleInterop
   node examples/basic-usage.js
   ```

## What the Example Does

The `basic-usage.ts` example demonstrates:

1. **Key Generation**: Creates a new RSA key pair
2. **Extension ID**: Derives the extension ID from the public key
3. **Sample Extension**: Creates a complete Chrome extension with:
   - `manifest.json` (Manifest V3)
   - `popup.html` and `popup.js` (extension popup)
   - `content.js` (content script)
4. **Packing**: Converts the extension directory into a `.crx3` file
5. **Verification**: Checks the generated CRX3 file structure

## Generated Files

After running the example, you'll find:

- `examples/ecdsa-keys/publisher-private.pem` - Private key of publisher
- `examples/ecdsa-keys/publisher-public.pem` - Public key of publisher
- `examples/keys/private.pem` - Private key for signing
- `examples/keys/public.pem` - Public key 
- `examples/sample-extension/` - Complete Chrome extension
- `examples/sample-extension.crx` - Packed extension file

## Installing the Example Extension

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Drag and drop the `sample-extension.crx` file onto the page
5. The extension will be installed but can not be used. The reason is the the publisher-private.pem we generated is not the Google private key :V. But it could be useful if
you have your own browser customized from Chromeium

## CLI Example

You can also use the CLI to pack the generated extension:

```bash
# Generate keys, if you don't want generate new key or already have it, ignore this step
crx3-pack generate-key -o ./examples/keys
crx3-pack generate-key -o ./examples/ecdsa-keys --publisher

# Pack the extension
crx3-pack pack -i ./examples/sample-extension -o ./examples/sample-extension.crx -k ./examples/keys/private.pem

# Pack the extension with publisher key also
crx3-pack pack -i ./examples/sample-extension -o ./examples/sample-extension-publisher.crx -k ./examples/keys/private.pem --publisher-key ./examples/ecdsa-keys/publisher-private.pem

# Get the extension ID
crx3-pack get-crx-id -k ./examples/keys/public.pem
```