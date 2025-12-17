#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const envPath = path.join(process.cwd(), '.env.local');

const fields = [
  {
    key: 'MISTRAL_API_KEY',
    label: 'Mistral API key (required for Ask LeChat and AI suggestions)',
    required: true,
  },
  {
    key: 'NEXT_PUBLIC_BASE_URL',
    label: 'Public base URL (used for OG tags, defaults to dev server)',
    defaultValue: 'http://localhost:3000',
  },
  {
    key: 'COOKBOOKS_DIR',
    label: 'Path to cookbook assets (leave blank to use static/cookbooks)',
  },
];

const rl = createInterface({ input, output });

function parseEnvFile(content) {
  return content.split(/\r?\n/).reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return acc;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return acc;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    acc[key] = value;
    return acc;
  }, {});
}

function formatEnvLine(key, value) {
  if (value === undefined || value === null) return '';
  const needsQuotes = /\s/.test(value);
  return `${key}=${needsQuotes ? JSON.stringify(value) : value}`;
}

async function askField(field, existingValue) {
  while (true) {
    const suffix = existingValue
      ? ` (current: ${existingValue})`
      : field.defaultValue
        ? ` (default: ${field.defaultValue})`
        : '';
    const answer = (await rl.question(`${field.label}${suffix}: `)).trim();
    if (answer) return answer;
    if (existingValue) return existingValue;
    if (field.defaultValue) return field.defaultValue;
    if (!field.required) return '';
    console.log(`"${field.key}" is required. Please enter a value.`);
  }
}

async function main() {
  const existing = fs.existsSync(envPath)
    ? parseEnvFile(fs.readFileSync(envPath, 'utf8'))
    : {};

  console.log('Configuring environment variables for platform docs…\n');

  const result = {};
  for (const field of fields) {
    result[field.key] = await askField(field, existing[field.key]);
  }

  await rl.close();

  const lines = Object.entries(result)
    .filter(([, value]) => typeof value === 'string' && value.length > 0)
    .map(([key, value]) => formatEnvLine(key, value));

  fs.writeFileSync(envPath, `${lines.join('\n')}\n`);
  console.log(`\nSaved ${Object.keys(result).length} keys to ${envPath}`);
}

main().catch(error => {
  console.error('Failed to configure environment variables', error);
  rl.close();
  process.exitCode = 1;
});
