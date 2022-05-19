import { array, object, optional, text, unknown } from '@fmtk/decoders';
import { decodeMetadata, Metadata } from '../common/Metadata.js';
import { decodeS3ObjectRef, S3ObjectRef } from '../common/S3ObjectRef.js';
import { stringBoolean } from '../internal/stringBoolean.js';

export interface TextReplacement {
  Regex?: boolean;
  Replace: string;
  Search: string;
}

export interface PutObjectProps {
  Target: S3ObjectRef;
  Contents?: unknown;
  Metadata?: Metadata;
  Replacements?: TextReplacement[];
  Source?: S3ObjectRef;
}

export const decodeTextReplacement = object<TextReplacement>({
  Regex: optional(stringBoolean),
  Replace: text,
  Search: text,
});

export const decodePutObjectProps = object<PutObjectProps>({
  Target: decodeS3ObjectRef,
  Contents: optional(unknown),
  Metadata: optional(decodeMetadata),
  Replacements: optional(array(decodeTextReplacement)),
  Source: optional(decodeS3ObjectRef),
});
