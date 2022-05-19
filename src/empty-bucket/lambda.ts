import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  ObjectIdentifier,
  S3Client,
} from '@aws-sdk/client-s3';
import { CustomResourceHandlerBase } from '@squareball/cfn-custom-resource';
import {
  decodeEmptyBucketProps,
  EmptyBucketProps,
} from './EmptyBucketProps.js';

const s3 = new S3Client({});

export class EmptyBucketResourceHandler extends CustomResourceHandlerBase<EmptyBucketProps> {
  constructor() {
    super(decodeEmptyBucketProps);
  }

  protected override async createResource(): Promise<void> {
    if (this.properties.EmptyOnCreate) {
      await this.empty(this.properties.Bucket, this.properties.Prefix);
    }
  }

  protected override async deleteResource(): Promise<void> {
    if (this.properties.EmptyOnDelete) {
      await this.empty(this.properties.Bucket, this.properties.Prefix);
    }
  }

  protected override async updateResource(): Promise<void> {
    if (this.properties.EmptyOnUpdate) {
      await this.empty(this.properties.Bucket, this.properties.Prefix);
    }
  }

  private async empty(bucket: string, prefix?: string): Promise<void> {
    console.log(`empyting bucket ${bucket} (prefix='${prefix || ''}')`);

    for (;;) {
      const objects = await s3.send(
        new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }),
      );

      if (!objects.Contents || !objects.Contents.length) {
        console.log(`nothing more to delete`);
        break;
      }

      const keys = objects.Contents.reduce(
        (a, { Key }) => (Key ? [...a, { Key }] : a),
        [] as ObjectIdentifier[],
      );

      console.log(`deleting objects`, keys);

      await s3.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: keys,
          },
        }),
      );
    }
  }
}

export const handler = new EmptyBucketResourceHandler().getHandler();
