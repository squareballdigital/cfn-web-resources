import {
  ResourceInstanceType,
  ResourceOptions,
  TemplateBuilder,
} from '@squareball/cfntemplate';

export interface CustomResourceInstance<
  Props,
  Attributes extends object = never,
> {
  makeResource(
    name: string,
    props: Props,
    options?: ResourceOptions,
  ): [TemplateBuilder, ResourceInstanceType<Attributes>];
}
