const cdk = require('@aws-cdk/core');
const lambda = require('@aws-cdk/aws-lambda');
const iam = require('@aws-cdk/aws-iam');
const path = require('path');
const arnParser = require ('@aws-sdk/util-arn-parser');

class CdkStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const syncs = [{
      targetBucket: 'targethbg',
      sourceBucket: 'sourcehbg'
    }];

    for (const sync of syncs) {
      let fn = new lambda.Function(this, `sync-s3-${sync.targetBucket}-${sync.sourceBucket}`, {
        code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda')),
        handler: 'index.handler',
        runtime: lambda.Runtime.NODEJS_14_X,
        environment: {
          S3_BUCKET_TARGET: sync.targetBucket
        },
      });

      fn.role.addToPrincipalPolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: ['*'],
        actions: ['s3:getobject'],
      }));

      fn.role.addToPrincipalPolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: ['*'],
        actions: ['s3:putobject'],
      }));
    }
  }
}

module.exports = { CdkStack }
