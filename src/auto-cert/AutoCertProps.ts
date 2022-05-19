import { array, object, optional, text } from '@fmtk/decoders';

export interface AutoCertProps {
  DomainName: string;
  HostedZoneId: string;
  Region?: string;
  SubjectAlternativeNames?: string[];
}

export const decodeAutoCertProps = object<AutoCertProps>({
  DomainName: text,
  HostedZoneId: text,
  Region: optional(text),
  SubjectAlternativeNames: optional(array(text)),
});
