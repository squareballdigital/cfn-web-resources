import { object, optional, text } from '@fmtk/decoders';
import { stringBoolean } from '../internal/stringBoolean.js';

export interface EmptyBucketProps {
  Bucket: string;
  EmptyOnCreate?: boolean;
  EmptyOnDelete?: boolean;
  EmptyOnUpdate?: boolean;
  Prefix?: string;
}

export const decodeEmptyBucketProps = object<EmptyBucketProps>({
  Bucket: text,
  EmptyOnCreate: optional(stringBoolean),
  EmptyOnDelete: optional(stringBoolean),
  EmptyOnUpdate: optional(stringBoolean),
  Prefix: optional(text),
});
