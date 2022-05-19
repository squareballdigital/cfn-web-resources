import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { CustomResourceHandlerBase } from '@squareball/cfn-custom-resource';
import escapeRegExp from 'lodash.escaperegexp';
import { lookup as mime } from 'mime-types';
import { splitMetadataHeaders } from '../internal/splitMetadataHeaders.js';
import { decodePutObjectProps, PutObjectProps } from './PutObjectProps.js';

const s3 = new S3Client({});

export class PutObjectResourceHandler extends CustomResourceHandlerBase<PutObjectProps> {
  constructor() {
    super(decodePutObjectProps);
  }

  protected override async createResource(): Promise<void> {
    await this.put();
  }

  protected override async updateResource(): Promise<void> {
    await this.put();
  }

  private async put(): Promise<void> {
    const props = this.properties;
    let data: string | Buffer;
    const [headers, metadata] = splitMetadataHeaders(props.Metadata || {});

    console.log(`put`, props);

    if (props.Source) {
      const response = await s3.send(
        new GetObjectCommand({
          Bucket: props.Source.S3Bucket,
          Key: props.Source.S3Key,
          VersionId: props.Source.S3ObjectVersion,
        }),
      );

      const chunks: Buffer[] = [];
      if (!response.Body) {
        throw new Error(`unexpected empty body`);
      }

      for await (const chunk of response.Body as NodeJS.ReadableStream) {
        chunks.push(chunk as Buffer);
      }

      data = Buffer.concat(chunks);

      if (!headers.ContentType) {
        headers.ContentType =
          mime(props.Target.S3Key) || 'application/octet-stream';
      }
    } else {
      let contentType: string;

      if (!props.Contents) {
        data = '';
        contentType = 'application/octet-stream';
      } else if (typeof props.Contents === 'string') {
        data = props.Contents;
        contentType = 'text/plain';
      } else if (Buffer.isBuffer(props.Contents)) {
        data = props.Contents;
        contentType = 'application/octet-stream';
      } else {
        data = JSON.stringify(props.Contents);
        contentType = 'application/json';
      }

      if (!headers.ContentType) {
        headers.ContentType = mime(props.Target.S3Key) || contentType;
      }
    }

    if (props.Replacements) {
      let dataStr = data.toString();

      for (const r of props.Replacements) {
        const search = new RegExp(
          r.Regex ? r.Search : escapeRegExp(r.Search),
          'g',
        );
        dataStr = dataStr.replace(search, r.Replace);
      }

      data = dataStr;
    }

    const s3Request = {
      Body: data,
      Bucket: props.Target.S3Bucket,
      Key: props.Target.S3Key,
      Metadata: metadata,
      ...headers,
    };

    console.log(`S3 Request`, s3Request);
    await s3.send(new PutObjectCommand(s3Request));
  }
}

export const handler = new PutObjectResourceHandler().getHandler();
