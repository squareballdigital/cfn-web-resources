import { object, PropDecoders, text } from '@fmtk/decoders';
import { keyOf } from '../internal/keyOf.js';

export interface GetStreamArnAttributes {
  LatestStreamArn: string;
}

const props: PropDecoders<GetStreamArnAttributes> = {
  LatestStreamArn: text,
};

export const decodeGetStreamArnAttributes = object(props);

export const GetStreamArnAttributeNames = keyOf(props);
