import {
  ACMClient,
  DescribeCertificateCommand,
  ResourceRecord,
} from '@aws-sdk/client-acm';
import { backoff } from '@squareball/cfn-custom-resource';

export async function waitForDnsChallenge(
  arn: string,
  acm: ACMClient,
  maxAttempts = 10,
): Promise<ResourceRecord> {
  console.log(`waiting for ACM to provide DNS challenge details`);

  for (let i = 0; i < maxAttempts; ++i) {
    const cert = await acm.send(
      new DescribeCertificateCommand({ CertificateArn: arn }),
    );

    if (!cert.Certificate) {
      throw new Error(`certificate ${arn} not found`);
    }

    const options = cert.Certificate.DomainValidationOptions;

    if (options && options.length && options[0].ResourceRecord) {
      return options[0].ResourceRecord;
    }

    await backoff(i, 1000, undefined, 60000);
  }

  throw new Error(
    `couldn't get DNS Challenge details after ${maxAttempts} attempts`,
  );
}
