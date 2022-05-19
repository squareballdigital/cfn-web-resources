import { PackageAsset } from '@squareball/cfnassets';
import {
  bucketArn,
  Fn,
  PolicyEffect,
  ResourceInstanceType,
  ResourceOptions,
  TemplateBuilder,
} from '@squareball/cfntemplate';
import { CustomResourceInstance } from '../common/CustomResourceInstance.js';
import { CustomResourceFactory } from '../internal/CustomResourceFactory.js';
import { PackagePath } from '../internal/PackagePath.js';
import { UnpackAssetProps } from './UnpackAssetProps.js';

export type UnpackAssetResource = CustomResourceInstance<UnpackAssetProps>;

const UnpackAssetName = 'UnpackAsset' as const;

class UnpackAssetFactory extends CustomResourceFactory<
  typeof UnpackAssetName,
  UnpackAssetProps
> {
  constructor(name: string) {
    super(
      UnpackAssetName,
      {
        asset: new PackageAsset(name, PackagePath, 'unpack-asset'),
        name,
      },
      [],
    );
  }

  public override makeResource(
    name: string,
    props: UnpackAssetProps,
    options?: ResourceOptions,
  ): [TemplateBuilder, ResourceInstanceType<never>] {
    this.role.addStatement({
      Action: 's3:GetObject*',
      Effect: PolicyEffect.Allow,
      Resource: bucketArn(props.Source.S3Bucket, props.Source.S3Key),
    });
    this.role.addStatement({
      Action: 's3:PutObject*',
      Effect: PolicyEffect.Allow,
      Resource: bucketArn(
        props.DestinationBucket,
        props.DestinationPrefix ? Fn.fmt`${props.DestinationPrefix}/*` : '*',
      ),
    });

    return super.makeResource(name, props, options);
  }
}

export function makeUnpackAssetResource(
  name: string,
): [TemplateBuilder, UnpackAssetResource] {
  const factory = new UnpackAssetFactory(name);
  return [factory, factory];
}
