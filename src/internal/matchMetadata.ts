import glob from 'micromatch';
import { Metadata } from '../common/Metadata.js';
import { MetadataGlob } from '../common/MetadataGlob.js';

export function matchMetadata(
  metadata: MetadataGlob[],
  path: string,
): Metadata {
  for (const item of metadata) {
    if (glob.isMatch(path, item.Glob)) {
      return item.Metadata;
    }
  }
  return {};
}
