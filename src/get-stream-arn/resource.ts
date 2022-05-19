import { PackageAsset } from '@squareball/cfnassets';
import {
  localArn,
  PolicyEffect,
  ResourceInstanceType,
  ResourceOptions,
  TemplateBuilder,
} from '@squareball/cfntemplate';
import { CustomResourceInstance } from '../common/CustomResourceInstance.js';
import { CustomResourceFactory } from '../internal/CustomResourceFactory.js';
import { PackagePath } from '../internal/PackagePath.js';
import {
  GetStreamArnAttributeNames,
  GetStreamArnAttributes,
} from './GetStreamArnAttributes.js';
import { GetStreamArnProps } from './GetStreamArnProps.js';

export type GetStreamArnResource = CustomResourceInstance<
  GetStreamArnProps,
  GetStreamArnAttributes
>;

const GetStreamArnName = 'GetStreamArn' as const;

class GetStreamArnFactory extends CustomResourceFactory<
  typeof GetStreamArnName,
  GetStreamArnProps,
  GetStreamArnAttributes
> {
  constructor(name: string) {
    super(
      GetStreamArnName,
      {
        asset: new PackageAsset(name, PackagePath, 'get-stream-arn'),
        name,
      },
      GetStreamArnAttributeNames,
    );
  }

  public override makeResource(
    name: string,
    props: GetStreamArnProps,
    options?: ResourceOptions,
  ): [TemplateBuilder, ResourceInstanceType<GetStreamArnAttributes>] {
    this.role.addStatement({
      Action: 'dynamodb:DescribeTable',
      Effect: PolicyEffect.Allow,
      Resource: localArn('dynamodb', 'table', props.TableName),
    });
    return super.makeResource(name, props, options);
  }
}

export function makeGetStreamArnResource(
  name: string,
): [TemplateBuilder, GetStreamArnResource] {
  const factory = new GetStreamArnFactory(name);
  return [factory, factory];
}
