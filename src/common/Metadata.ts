import { record, text } from '@fmtk/decoders';

export interface Metadata {
  [key: string]: string;
}

export const decodeMetadata = record(text, text);
