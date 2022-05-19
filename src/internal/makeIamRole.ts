import {
  makeAwsResource,
  PolicyStatement,
  ResourceInstance,
  ResourceOptions,
  TemplateBuilder,
} from '@squareball/cfntemplate';
import {
  IAMRoleAttributes,
  IAMRoleProps,
  ResourceType,
} from '@squareball/cfntypes';
import cloneDeep from 'lodash.clonedeep';
import { makePolicy, Policy } from './Policy.js';

export class IamRoleInstance extends ResourceInstance<IAMRoleAttributes> {
  private readonly props: IAMRoleProps;
  private policy: Policy | undefined;

  constructor(name: string, props: IAMRoleProps) {
    super(name);
    this.props = props;
  }

  public addStatement(statement: PolicyStatement): void {
    if (!this.policy) {
      this.policy = makePolicy(`${this.name}AutoPolicy`, []);

      if (this.props.Policies) {
        this.props.Policies.push(this.policy);
      } else {
        this.props.Policies = [this.policy];
      }
    }
    this.policy.PolicyDocument.Statement.push(statement);
  }
}

export function makeIamRole(
  name: string,
  props: IAMRoleProps,
  options?: ResourceOptions,
): [TemplateBuilder, IamRoleInstance] {
  props = cloneDeep(props);
  const [builder] = makeAwsResource(ResourceType.IAMRole, name, props, options);
  return [builder, new IamRoleInstance(name, props)];
}
