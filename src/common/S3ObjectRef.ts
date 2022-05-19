import { object, optional, text } from '@fmtk/decoders';

export interface S3ObjectRef {
  S3Bucket: string;
  S3Key: string;
  S3ObjectVersion?: string;
}

export const decodeS3ObjectRef = object<S3ObjectRef>({
  S3Bucket: text,
  S3Key: text,
  S3ObjectVersion: optional(text),
});
