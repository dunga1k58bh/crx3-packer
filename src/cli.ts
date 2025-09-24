#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { CRX3Packer } from './packer';

const program = new Command();

program
  .name('crx3-pack')
  .description('Pack a folder or zip file into CRX3 format for Chrome extensions')
  .version('1.0.0');

program
  .command('pack')
  .description('Pack a directory or zip file into CRX3 format')
  .requiredOption('-i, --input <path>', 'Input directory or zip file path')
  .requiredOption('-o, --output <path>', 'Output CRX3 file path')
  .requiredOption('-k, --key <path>', 'Private key file path (PEM format)')
  .option('--publisher-key <path>', 'Optional publisher private key file path (PEM format)')
  .option('--crx-id <id>', 'Optional CRX ID override (hex format)')
  .action(async (options) => {
    try {
      // Read private key
      const privateKey = fs.readFileSync(options.key, 'utf8');
      
      // Read publisher private key if provided
      let publisherPrivateKey: string | undefined;
      if (options.publisherKey) {
        publisherPrivateKey = fs.readFileSync(options.publisherKey, 'utf8');
      }
      
      // Parse CRX ID if provided
      let crxId: Buffer | undefined;
      if (options.crxId) {
        crxId = Buffer.from(options.crxId, 'hex');
      }

      const packOptions = {
        privateKey,
        publisherPrivateKey,
        output: options.output,
        crxId
      };

      const packer = new CRX3Packer();
      
      // Check if input is directory or zip file
      const inputStat = fs.statSync(options.input);
      
      if (inputStat.isDirectory()) {
        console.log(`Packing directory: ${options.input}`);
        await packer.packDirectory(options.input, packOptions);
      } else {
        console.log(`Packing zip file: ${options.input}`);
        await packer.packFromZipFile(options.input, packOptions);
      }
      
      console.log(`✓ CRX3 file created: ${options.output}`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('generate-key')
  .description('Generate a new RSA key pair for signing')
  .requiredOption('-o, --output <path>', 'Output directory for key files')
  .option('--publisher', 'Generate publisher key pair instead of developer key pair')
  .action((options) => {
    try {
      let privateKey: string;
      let publicKey: string;
      
      if (options.publisher) {
        // Generate ECDSA key pair for publisher
        const keys = CRX3Packer.generateEcdsaKeyPair();
        privateKey = keys.privateKey;
        publicKey = keys.publicKey;
      } else {
        // Generate RSA key pair for developer
        const keys = CRX3Packer.generateKeyPair();
        privateKey = keys.privateKey;
        publicKey = keys.publicKey;
      }
      
      const keyType = options.publisher ? 'publisher (ECDSA P-256)' : 'developer (RSA)';
      const privateKeyPath = path.join(options.output, options.publisher ? 'publisher-private.pem' : 'private.pem');
      const publicKeyPath = path.join(options.output, options.publisher ? 'publisher-public.pem' : 'public.pem');
      
      // Ensure output directory exists
      fs.mkdirSync(options.output, { recursive: true });
      
      fs.writeFileSync(privateKeyPath, privateKey);
      fs.writeFileSync(publicKeyPath, publicKey);
      
      console.log(`✓ ${keyType} private key saved: ${privateKeyPath}`);
      console.log(`✓ ${keyType} public key saved: ${publicKeyPath}`);
      
      if (!options.publisher) {
        // Generate and display CRX ID only for developer keys
        const crxId = CRX3Packer.getCrxIdFromPublicKey(publicKey);
        console.log(`✓ Extension ID: ${crxId}`);
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('get-crx-id')
  .description('Get CRX ID from a public key')
  .requiredOption('-k, --key <path>', 'Public key file path (PEM format)')
  .action((options) => {
    try {
      const publicKey = fs.readFileSync(options.key, 'utf8');
      const crxId = CRX3Packer.getCrxIdFromPublicKey(publicKey);
      
      console.log(`Extension ID: ${crxId}`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();