console.log(chalk.green('✓ Content check'));
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatBytes, humanize } from '../libs/formatters.js';
import { SUBJECTS_LIST } from '../data/subjects/index.js';
import { subjectById } from '../data/catalog.js';