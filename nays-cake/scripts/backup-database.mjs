import 'dotenv/config';
import { spawn } from 'node:child_process';
import { mkdir, open, unlink } from 'node:fs/promises';
import path from 'node:path';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL belum diatur');
const url = new URL(process.env.DATABASE_URL);
const directory = path.resolve('../backups');
await mkdir(directory, { recursive: true });
const destination = path.join(directory, 'nays-' + new Date().toISOString().replaceAll(':', '-') + '.dump');
const file = await open(destination, 'wx', 0o600);
const env = { ...process.env, PGHOST: url.hostname, PGPORT: url.port || '5432', PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password), PGDATABASE: decodeURIComponent(url.pathname.slice(1)), PGSSLMODE: url.searchParams.get('sslmode') || 'require' };
delete env.DATABASE_URL;
function run(command, args, stdout) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, windowsHide: true, stdio: ['ignore', stdout, 'pipe'] });
    let error = '';
    child.stderr.on('data', chunk => { error += chunk.toString(); });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve() : reject(new Error(error || command + ' gagal')));
  });
}
try {
  await run('pg_dump', ['--format=custom', '--no-owner', '--no-acl'], file.fd);
  await file.close();
  await run('pg_restore', ['--list', destination], 'ignore');
  console.log('Backup terverifikasi: ' + destination);
} catch (error) {
  await file.close().catch(() => {});
  await unlink(destination).catch(() => {});
  console.error('Backup gagal. Pastikan pg_dump dan pg_restore tersedia di PATH. ' + error.message);
  process.exitCode = 1;
}
