#!/usr/bin/env node

'use strict';

require('colors');

const lintCoffeeScriptPaths = require('./lib/lint-coffee-script-paths');
const lintJavaScriptPaths = require('./lib/lint-java-script-paths');
const lintLessPaths = require('./lib/lint-less-paths');
const path = require('path');

const CONFIG = require('./config');

process.on('unhandledRejection', function(e) {
  console.error(e.stack || e);
  process.exit(1);
});

Promise.all([
  lintCoffeeScriptPaths(),
  lintJavaScriptPaths(),
  lintLessPaths()
]).then(lintResults => {
  let hasLintErrors = false;
  for (let errors of lintResults) {
    for (let error of errors) {
      hasLintErrors = true;
      const relativePath = path.relative(CONFIG.repositoryRootPath, error.path);
      console.log(
        `${relativePath}:${error.lineNumber}`.yellow +
          ` ${error.message} (${error.rule})`.red
      );
    }
  }
  if (hasLintErrors) {
    process.exit(1);
  } else {
    console.log('No lint errors!'.green);
    process.exit(0);
  }
});
