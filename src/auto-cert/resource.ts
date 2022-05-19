import { PackageAsset } from '@squareball/cfnassets';
import {
  Fn,
  PolicyEffect,
  ResourceInstanceType,
  ResourceOptions,
  TemplateBuilder,
} from '@squareball/cfntemplate';
import { CustomResourceInstance } from '../common/CustomResourceInstance.js';
import { CustomResourceFactory } from '../internal/CustomResourceFactory.js';
import { PackagePath } from '../internal/PackagePath.js';
import {
  AutoCertAttributeNames,
  AutoCertAttributes,
} from './AutoCertAttributes.js';
import { AutoCertProps } from './AutoCertProps.js';

export type AutoCertResource = CustomResourceInstance<
  AutoCertProps,
  AutoCertAttributes
>;

const AutoCertName = 'AutoCert' as const;

class AutoCertFactory extends CustomResourceFactory<
  typeof AutoCertName,
  AutoCertProps,
  AutoCertAttributes
> {
  constructor(name: string) {
    super(
      AutoCertName,
      {
        asset: new PackageAsset(name, PackagePath, 'auto-cert'),
        name,
      },
      AutoCertAttributeNames,
    );

    this.role.addStatement({
      Action: [
        'acm:RequestCertificate',
        'acm:DescribeCertificate',
        'acm:DeleteCertificate',
      ],
      Effect: PolicyEffect.Allow,
      Resource: '*',
    });

    this.role.addStatement({
      Action: ['route53:GetChange'],
      Effect: PolicyEffect.Allow,
      Resource: '*',
    });
  }

  public override makeResource(
    name: string,
    props: AutoCertProps,
    options?: ResourceOptions,
  ): [TemplateBuilder, ResourceInstanceType<AutoCertAttributes>] {
    this.role.addStatement({
      Action: ['route53:changeResourceRecordSets'],
      Effect: PolicyEffect.Allow,
      Resource: [Fn.fmt`arn:aws:route53:::hostedzone/${props.HostedZoneId}`],
    });

    return super.makeResource(name, props, options);
  }
}

export function makeAutoCertResource(
  name: string,
): [TemplateBuilder, AutoCertResource] {
  const factory = new AutoCertFactory(name);
  return [factory, factory];
}
