import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

function getPackagePath(): string {
  if (typeof __dirname !== 'undefined') {
    return resolve(__dirname, '../../package.json');
  } else {
    return resolve(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      dirname(fileURLToPath(import.meta.url)),
      '../../package.json',
    );
  }
}

export const PackagePath = getPackagePath();
