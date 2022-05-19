import { boolean, Decoder, ExpectedBoolean, invalid, ok } from '@fmtk/decoders';

export const stringBoolean: Decoder<boolean> = (value) => {
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      return ok(true);
    } else if (value.toLowerCase() === 'false') {
      return ok(false);
    } else {
      return invalid(
        ExpectedBoolean,
        'expected a boolean, or a string equal to "true" or "false"',
      );
    }
  }
  return boolean(value);
};
