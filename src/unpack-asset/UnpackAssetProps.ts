import { array, object, optional, text } from '@fmtk/decoders';
import { decodeMetadataGlob, MetadataGlob } from '../common/MetadataGlob.js';
import { decodeS3ObjectRef, S3ObjectRef } from '../common/S3ObjectRef.js';

export interface UnpackAssetProps {
  DestinationBucket: string;
  DestinationPrefix?: string;
  Metadata?: MetadataGlob[];
  Source: S3ObjectRef;
}

export const decodeUnpackAssetProps = object<UnpackAssetProps>({
  DestinationBucket: text,
  DestinationPrefix: optional(text),
  Metadata: optional(array(decodeMetadataGlob)),
  Source: decodeS3ObjectRef,
});
