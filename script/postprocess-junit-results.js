#!/usr/bin/env node

const yargs = require('yargs');

const argv = yargs
  .usage('Usage: $0 [options]')
  .help('help')
  .option('search-folder', {
    string: true,
    demandOption: true,
    requiresArg: true,
    describe: 'Directory to search for JUnit XML results'
  })
  .option('test-results-files', {
    string: true,
    demandOption: true,
    requiresArg: true,
    describe: 'Glob that matches JUnit XML files within searchFolder'
  })
  .wrap(yargs.terminalWidth()).argv;

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

function discoverTestFiles() {
  return new Promise((resolve, reject) => {
    glob(argv.testResultsFiles, { cwd: argv.searchFolder }, (err, paths) => {
      if (err) {
        reject(err);
      } else {
        resolve(paths);
      }
    });
  });
}

async function postProcessJUnitXML(junitXmlPath) {
  const fullPath = path.resolve(argv.searchFolder, junitXmlPath);
  const friendlyName = path.basename(junitXmlPath, '.xml').replace(/-+/g, ' ');

  console.log(`${fullPath}: loading`);

  const original = await new Promise((resolve, reject) => {
    fs.readFile(fullPath, { encoding: 'utf8' }, (err, content) => {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    });
  });

  const $ = cheerio.load(original, { xmlMode: true });
  $('testcase').attr('name', (i, oldName) => `[${friendlyName}] ${oldName}`);
  const modified = $.xml();

  await new Promise((resolve, reject) => {
    fs.writeFile(fullPath, modified, { encoding: 'utf8' }, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
  console.log(`${fullPath}: complete`);
}

(async function() {
  const testResultFiles = await discoverTestFiles();
  console.log(`Post-processing ${testResultFiles.length} JUnit XML files`);

  await Promise.all(testResultFiles.map(postProcessJUnitXML));

  console.log(`${testResultFiles.length} JUnit XML files complete`);
})().then(
  () => process.exit(0),
  err => {
    console.error(err.stack || err);
    process.exit(1);
  }
);
