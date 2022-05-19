import { ACMClient, DescribeCertificateCommand } from '@aws-sdk/client-acm';
import { backoff } from '@squareball/cfn-custom-resource';

export async function waitForCertificateUse(
  arn: string,
  acm: ACMClient,
  maxAttempts = 20,
): Promise<void> {
  console.log(`waiting for certificate ${arn} to become unused`);

  for (let i = 0; i < maxAttempts; ++i) {
    const cert = await acm.send(
      new DescribeCertificateCommand({ CertificateArn: arn }),
    );

    if (!cert.Certificate) {
      return;
    }
    if (!cert.Certificate.InUseBy || !cert.Certificate.InUseBy.length) {
      return;
    }

    await backoff(i, 1000, undefined, 60000);
  }

  throw new Error(
    `gave up waiting for certificate to be unused after ${maxAttempts} attempts`,
  );
}
