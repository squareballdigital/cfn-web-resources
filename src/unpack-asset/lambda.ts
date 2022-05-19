import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { CustomResourceHandlerBase } from '@squareball/cfn-custom-resource';
import fs from 'fs';
import { lookup as mime } from 'mime-types';
import path from 'path';
import { pipeline } from 'stream/promises';
import { matchMetadata } from '../internal/matchMetadata.js';
import { splitMetadataHeaders } from '../internal/splitMetadataHeaders.js';
import { openZip } from '../internal/ZipEntryStream.js';
import {
  decodeUnpackAssetProps,
  UnpackAssetProps,
} from './UnpackAssetProps.js';

const s3 = new S3Client({});

export class UnpackAssetResourceHandler extends CustomResourceHandlerBase<UnpackAssetProps> {
  constructor() {
    super(decodeUnpackAssetProps);
  }

  protected override async createResource(): Promise<void> {
    await this.unpack();
  }

  protected override async updateResource(): Promise<void> {
    await this.unpack();
  }

  private async unpack(): Promise<void> {
    const props = this.properties;
    console.log(`unpack`, props);

    const metadata = props.Metadata || [];

    const filePath = '/tmp/source.zip';
    const file = fs.createWriteStream(filePath);

    console.log(`downloading asset`);

    const response = await s3.send(
      new GetObjectCommand({
        Bucket: props.Source.S3Bucket,
        Key: props.Source.S3Key,
        VersionId: props.Source.S3ObjectVersion,
      }),
    );

    await pipeline(response.Body as NodeJS.ReadableStream, file);

    console.log(`asset downloaded to ${filePath}`);
    const zip = openZip(filePath);

    for await (const entry of zip) {
      if (entry.info.fileName.endsWith('/')) {
        continue;
      }
      const [headers, meta] = splitMetadataHeaders(
        matchMetadata(metadata, entry.info.fileName),
      );

      const destPath = path.join(
        props.DestinationPrefix || '',
        entry.info.fileName,
      );

      const objectInfo = {
        Bucket: props.DestinationBucket,
        Key: destPath,
        ...headers,
        Metadata: meta,
        ContentType:
          headers.ContentType ||
          mime(entry.info.fileName) ||
          'application/octet-stream',
      };

      console.log(`uploading ${objectInfo.Key}`, objectInfo);

      const upload = new Upload({
        client: s3,
        params: {
          Body: await entry.open(),
          ...objectInfo,
        },
      });
      await upload.done();
    }
  }
}

export const handler = new UnpackAssetResourceHandler().getHandler();
