#!/usr/bin/env node
const fs = require('fs');
const vm = require('vm');
const snapshotScriptPath = process.argv[2];
const snapshotScript = fs.readFileSync(snapshotScriptPath, 'utf8');
vm.runInNewContext(snapshotScript, undefined, {
  filename: snapshotScriptPath,
  displayErrors: true
});
