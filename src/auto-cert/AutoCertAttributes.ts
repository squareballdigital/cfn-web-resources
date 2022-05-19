import { object, PropDecoders, text } from '@fmtk/decoders';
import { keyOf } from '../internal/keyOf.js';

export interface AutoCertAttributes {
  CertificateArn: string;
}

const props: PropDecoders<AutoCertAttributes> = {
  CertificateArn: text,
};

export const decodeAutoCertAttributes = object(props);

export const AutoCertAttributeNames = keyOf(props);
