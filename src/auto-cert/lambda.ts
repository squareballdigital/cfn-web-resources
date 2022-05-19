import {
  ACMClient,
  DeleteCertificateCommand,
  RequestCertificateCommand,
  waitUntilCertificateValidated,
} from '@aws-sdk/client-acm';
import {
  ChangeResourceRecordSetsCommand,
  Route53Client,
  waitUntilResourceRecordSetsChanged,
} from '@aws-sdk/client-route-53';
import { CustomResourceHandlerBase } from '@squareball/cfn-custom-resource';
import { hash } from '../internal/hash.js';
import { waitForCertificateUse } from '../internal/waitForCertificateUse.js';
import { waitForDnsChallenge } from '../internal/waitForDnsChallenge.js';
import {
  AutoCertAttributes,
  decodeAutoCertAttributes,
} from './AutoCertAttributes.js';
import { AutoCertProps, decodeAutoCertProps } from './AutoCertProps.js';

const route53 = new Route53Client({});

export class AutoCertResourceHandler extends CustomResourceHandlerBase<
  AutoCertProps,
  AutoCertAttributes
> {
  constructor() {
    super(decodeAutoCertProps, decodeAutoCertAttributes);
  }

  protected override async createResource(): Promise<void> {
    await this.createUpdateResource();
  }

  protected override async deleteResource(): Promise<void> {
    const acm = new ACMClient({ region: this.properties.Region });
    const arn = this.physicalResourceId;

    if (!arn.startsWith('arn:aws:acm')) {
      console.log(`physical resource "${arn}" doesn't seem to be mine`);
      return;
    }

    try {
      await waitForCertificateUse(arn, acm);
      await acm.send(new DeleteCertificateCommand({ CertificateArn: arn }));
    } catch (e: any) {
      // don't throw if resource has already been removed
      if (e.code !== 'ResourceNotFoundException') {
        throw e;
      }
    }
  }

  protected override async updateResource(): Promise<void> {
    await this.createUpdateResource();
  }

  protected async createUpdateResource(): Promise<void> {
    const props = this.properties;
    const acm = new ACMClient({ region: props.Region });

    console.log(`requesting cert for ${props.DomainName}`);
    if (props.SubjectAlternativeNames && props.SubjectAlternativeNames.length) {
      console.log(`SANs = ${props.SubjectAlternativeNames.join(', ')}`);
    }

    const certRequest = await acm.send(
      new RequestCertificateCommand({
        DomainName: props.DomainName,
        SubjectAlternativeNames: props.SubjectAlternativeNames,
        IdempotencyToken: hash([this.requestId]).slice(0, 32),
        ValidationMethod: 'DNS',
      }),
    );

    if (!certRequest.CertificateArn) {
      throw new Error(`failed to request certificate`);
    }

    console.log(`requested cert with ARN ${certRequest.CertificateArn}`);

    const challenge = await waitForDnsChallenge(
      certRequest.CertificateArn,
      acm,
    );

    const dnsChange = await route53.send(
      new ChangeResourceRecordSetsCommand({
        ChangeBatch: {
          Changes: [
            {
              Action: 'UPSERT',
              ResourceRecordSet: {
                Name: challenge.Name,
                Type: challenge.Type,
                TTL: 60,
                ResourceRecords: [
                  {
                    Value: challenge.Value,
                  },
                ],
              },
            },
          ],
        },
        HostedZoneId: props.HostedZoneId,
      }),
    );

    console.log('Waiting for DNS records to commit...');

    await waitUntilResourceRecordSetsChanged(
      {
        client: route53,
        maxWaitTime: 600,
      },
      { Id: dnsChange.ChangeInfo?.Id },
    );

    console.log('Waiting for validation...');
    await waitUntilCertificateValidated(
      {
        client: acm,
        maxWaitTime: 600,
      },
      {
        CertificateArn: certRequest.CertificateArn,
      },
    );

    this.data = {
      CertificateArn: certRequest.CertificateArn,
    };
    this.physicalResourceId = certRequest.CertificateArn;
  }
}

export const handler = new AutoCertResourceHandler().getHandler();
