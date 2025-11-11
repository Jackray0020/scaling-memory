#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Testing MCP Time Schedule Server...\n');

const serverPath = join(__dirname, 'dist', 'index.js');
const server = spawn('node', [serverPath], {
  env: {
    ...process.env,
    RTRVR_API_URL: process.env.RTRVR_API_URL || 'https://api.rtrvr.ai',
    RTRVR_API_KEY: process.env.RTRVR_API_KEY || 'test_key'
  }
});

server.stdout.on('data', (data) => {
  console.log('Server output:', data.toString());
});

server.stderr.on('data', (data) => {
  console.error('Server stderr:', data.toString());
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

console.log('Server started. Press Ctrl+C to stop.\n');
console.log('To test with an MCP client, configure it to run: node dist/index.js\n');

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.kill();
  process.exit(0);
});
