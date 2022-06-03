import { resolve } from 'path';

function getPackagePath(): string {
  return resolve(__dirname, '../../package.json');
}

export const PackagePath = getPackagePath();
