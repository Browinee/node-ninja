#!/usr/bin/env node
import create from '@justinlin/create';
import { Command } from 'commander';
import fse from 'fs-extra';
import path from 'node:path';
import url from 'node:url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkgJson = fse.readJSONSync(path.join(__dirname, '../package.json'));

const program = new Command();

program
  .name('justinlin-cli')
  .description('justinlin cli')
  .version(pkgJson.version);

program.command('create')
  .description('create project')
  .action(async () => {
    create();
  });

program.parse();
