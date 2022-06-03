import { PackageAsset } from '@squareball/cfnassets';
import { PolicyEffect, TemplateBuilder } from '@squareball/cfntemplate';
import { CustomResourceInstance } from '../common/CustomResourceInstance.js';
import { CustomResourceFactory } from '../internal/CustomResourceFactory.js';
import { PackagePath } from '../internal/PackagePath.cjs';
import { makePolicy } from '../internal/Policy.js';
import { EmptyBucketProps } from './EmptyBucketProps.js';

export type EmptyBucketResource = CustomResourceInstance<EmptyBucketProps>;

const EmptyBucketResourceType = 'EmptyBucket' as const;

export function makeEmptyBucketResource(
  name: string,
): [TemplateBuilder, EmptyBucketResource] {
  const factory = new CustomResourceFactory(
    EmptyBucketResourceType,
    {
      asset: new PackageAsset(name, PackagePath, 'empty-bucket'),
      name,
      policies: [
        makePolicy(`${name}Policy`, [
          {
            Action: ['s3:ListBucket*', 's3:DeleteObject*'],
            Effect: PolicyEffect.Allow,
            Resource: '*', // need all resources so it still works on delete
          },
        ]),
      ],
    },
    [],
  );
  return [factory, factory];
}
