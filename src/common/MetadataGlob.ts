import { object, text } from '@fmtk/decoders';
import { decodeMetadata, Metadata } from './Metadata.js';

export interface MetadataGlob {
  Glob: string;
  Metadata: Metadata;
}

export const decodeMetadataGlob = object<MetadataGlob>({
  Glob: text,
  Metadata: decodeMetadata,
});
