#!/usr/bin/env node

const path = require('path');
const chalk = require('chalk');

const { red } = chalk;

const cwd = process.argv[2];
const command = process.argv[3];
const args = process.argv.slice(4);

const { spawn } = require('child_process');

const proc = spawn(path.join(cwd, 'node_modules', '.bin', command), args, {
  cwd,
  stdio: 'inherit',
});

proc.on('error', err => {
  console.error(red(`ERROR: ${err.message}`));
  console.log('Press ENTER to continue...');
  process.exit(1);
});
