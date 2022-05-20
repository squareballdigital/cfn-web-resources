import { Readable, ReadableOptions, Transform } from 'stream';
import * as yauzl from 'yauzl';

export interface ZipEntry {
  info: yauzl.Entry;
  open(): PromiseLike<Readable>;
}

export class ZipEntryStream extends Readable {
  private zipFile: yauzl.ZipFile | undefined;
  private running = false;
  private started = false;

  constructor(zipPath: string, opts?: ReadableOptions) {
    super({ autoDestroy: false, ...opts, objectMode: true });

    yauzl.open(
      zipPath,
      {
        autoClose: false,
        lazyEntries: true,
      },
      (err, zip) => {
        if (err) {
          this.destroy(err);
        } else if (zip) {
          zip.once('error', (e) => {
            this.destroy(e);
          });

          zip.on('entry', (entry: yauzl.Entry) => {
            this.running = this.push({
              info: entry,
              open: this.makeOpenEntry(entry),
            });
            if (this.running) {
              zip.readEntry();
            }
          });

          zip.once('end', () => {
            this.push(null);
          });

          this.zipFile = zip;

          if (this.started) {
            this.running = true;
            zip.readEntry();
          }
        }
      },
    );
  }

  override _read(): void {
    this.started = true;
    if (!this.running && this.zipFile) {
      this.running = true;
      this.zipFile.readEntry();
    }
  }

  override _destroy(
    error: Error | null,
    callback: (error?: Error | null) => void,
  ): void {
    this.zipFile?.close();
    this.zipFile = undefined;
    callback();
  }

  makeOpenEntry(entry: yauzl.Entry) {
    return async (): Promise<Readable> => {
      const entryStream = await new Promise<Readable>((resolve, reject) => {
        this.zipFile?.openReadStream(entry, (err, stream) => {
          if (err) {
            return reject(err);
          }
          if (!stream) {
            return reject(new Error('unexpected null stream in callback'));
          }
          resolve(stream);
        });
      });

      // pipe it through another steam due to yauzl's non-compliant stream impl
      const echo = new Transform({
        transform(data, encoding, callback) {
          callback(null, data);
        },
      });
      entryStream.pipe(echo);
      return echo;
    };
  }
}

export function openZip(zipPath: string): AsyncIterable<ZipEntry> {
  return new ZipEntryStream(zipPath);
}
