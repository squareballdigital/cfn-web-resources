import { PackageAsset } from '@squareball/cfnassets';
import {
  bucketArn,
  PolicyEffect,
  ResourceInstanceType,
  ResourceOptions,
  TemplateBuilder,
} from '@squareball/cfntemplate';
import { CustomResourceInstance } from '../common/CustomResourceInstance.js';
import { CustomResourceFactory } from '../internal/CustomResourceFactory.js';
import { PackagePath } from '../internal/PackagePath.cjs';
import { PutObjectProps } from './PutObjectProps.js';

export type PutObjectResource = CustomResourceInstance<PutObjectProps>;

const PutObjectName = 'PutObject';

class PutObjectFactory extends CustomResourceFactory<
  typeof PutObjectName,
  PutObjectProps
> {
  constructor(name: string) {
    super(
      PutObjectName,
      {
        asset: new PackageAsset(name, PackagePath, 'put-object'),
        name,
      },
      [],
    );
  }

  public override makeResource(
    name: string,
    props: PutObjectProps,
    options?: ResourceOptions,
  ): [TemplateBuilder, ResourceInstanceType<never>] {
    if (props.Source) {
      this.role.addStatement({
        Action: 's3:GetObject*',
        Effect: PolicyEffect.Allow,
        Resource: bucketArn(props.Source.S3Bucket, props.Source.S3Key),
      });
    }
    this.role.addStatement({
      Action: 's3:PutObject*',
      Effect: PolicyEffect.Allow,
      Resource: bucketArn(props.Target.S3Bucket, props.Target.S3Key),
    });
    return super.makeResource(name, props, options);
  }
}

export function makePutObjectResource(
  name: string,
): [TemplateBuilder, PutObjectResource] {
  const factory = new PutObjectFactory(name);
  return [factory, factory];
}
