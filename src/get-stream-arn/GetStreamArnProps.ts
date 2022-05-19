import { object, optional, string, text } from '@fmtk/decoders';

export interface GetStreamArnProps {
  // change this to retrieve the ARN again (in case the table has been recreated)
  RequestId?: string;
  TableName: string;
}

export const decodeGetStreamArnProps = object<GetStreamArnProps>({
  RequestId: optional(string),
  TableName: text,
});
