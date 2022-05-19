# @squareball/cfn-web-resources

Custom resources for standard web deployments:

1. `auto-cert`: provision and validate a certificate in ACM
1. `empty-bucket`: deletes everything in a bucket when the custom resource is deleted; useful to remove static content buckets that don't need to persist beyond a deployment
1. `get-stream-arn`: get the DynamoDB Stream ARN of a specified table
1. `put-object`: write specific content to an S3 bucket
1. `unpack-asset`: unpack a whole zip file to an S3 bucket

## Documentation

See [documentation](https://squareballdigital.github.io/cfn-web-resources).
