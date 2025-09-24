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

- `examples/keys/private.pem` - Private key for signing
- `examples/keys/public.pem` - Public key 
- `examples/sample-extension/` - Complete Chrome extension
- `examples/sample-extension.crx3` - Packed extension file

## Installing the Example Extension

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Drag and drop the `sample-extension.crx3` file onto the page
5. The extension will be installed and ready to use!

## CLI Example

You can also use the CLI to pack the generated extension:

```bash
# Generate keys
crx3-pack generate-key -o ./examples/keys

# Pack the extension
crx3-pack pack -i ./examples/sample-extension -o ./examples/sample-extension-cli.crx3 -k ./examples/keys/private.pem

# Get the extension ID
crx3-pack get-crx-id -k ./examples/keys/public.pem
```