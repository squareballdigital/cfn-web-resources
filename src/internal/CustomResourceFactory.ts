import { AssetBuilder } from '@squareball/cfnassets';
import {
  BuilderContext,
  CustomResourceType,
  makeAwsResource,
  makeCustomResource,
  makePolicyDocument,
  PolicyEffect,
  ResourceInstanceType,
  ResourceOptions,
  Template,
  TemplateBuilder,
  TemplateFragment,
} from '@squareball/cfntemplate';
import { IAMRolePolicy, ResourceType } from '@squareball/cfntypes';
import { DefaultLambdaRuntime } from './DefaultLambdaRuntime.js';
import { IamRoleInstance, makeIamRole } from './makeIamRole.js';

export interface CustomResourceFactoryOptions {
  asset: AssetBuilder;
  baseExecutionRole?: string;
  handler?: string;
  name: string;
  policies?: IAMRolePolicy[];
  timeout?: number;
}

export class CustomResourceFactory<
  T extends string,
  Props,
  Attribs extends object = never,
> implements TemplateBuilder
{
  protected readonly attribs: (keyof Attribs)[];
  protected readonly resourceBuilders: TemplateBuilder[] = [];
  protected readonly resourceType: CustomResourceType<T>;
  protected readonly role: IamRoleInstance;
  protected readonly serviceToken: string;
  protected resourceCount = 0;

  constructor(
    resourceType: T,
    opts: CustomResourceFactoryOptions,
    attribs: (keyof Attribs)[],
  ) {
    this.resourceType = `Custom::${resourceType}`;
    this.attribs = attribs;

    const [roleBuilder, role] = makeIamRole(`${opts.name}Role`, {
      AssumeRolePolicyDocument: makePolicyDocument({
        Action: 'sts:AssumeRole',
        Effect: PolicyEffect.Allow,
        Principal: { Service: 'lambda.amazonaws.com' },
      }),
      ManagedPolicyArns: [
        opts.baseExecutionRole ??
          'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
      ],
      Policies: opts.policies,
    });

    const [handlerBuilder, handler] = makeAwsResource(
      ResourceType.LambdaFunction,
      `${opts.name}Fn`,
      {
        Code: opts.asset.ref,
        Handler: opts.handler ?? 'index.handler',
        Role: role.out.Arn,
        Runtime: DefaultLambdaRuntime,
        Timeout: opts.timeout ?? 10 * 60,
      },
    );

    this.resourceBuilders.push(opts.asset, roleBuilder, handlerBuilder);
    this.role = role;
    this.serviceToken = handler.out.Arn;
  }

  public build(template: Template, ctx: BuilderContext): Template {
    if (!this.resourceCount) {
      return template;
    }
    return TemplateFragment.compose(...this.resourceBuilders).build(
      template,
      ctx,
    );
  }

  public makeResource(
    name: string,
    props: Props,
    opts?: ResourceOptions,
  ): [TemplateBuilder, ResourceInstanceType<Attribs>] {
    ++this.resourceCount;

    return makeCustomResource(
      this.resourceType,
      name,
      {
        ServiceToken: this.serviceToken,
        ...props,
      },
      opts,
      this.attribs,
    );
  }
}
