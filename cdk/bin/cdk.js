#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const pipelines = require('@aws-cdk/pipelines');
const codepipeline = require('@aws-cdk/aws-codepipeline');
const codepipelineActions = require('@aws-cdk/aws-codepipeline-actions');
const { CdkStack } = require('../lib/cdk-stack');

class PipelineStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create CodePipeline artifact to hold source code from repo
    const sourceArtifact = new codepipeline.Artifact();
    // Create CodePipeline artifact to hold synthesized cloud assembly
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    // Create the CDK pipeline
    const pipeline = new pipelines.CdkPipeline(this, 'Pipeline', {
      pipelineName: 'ServerlessPipelineDemo',
      cloudAssemblyArtifact,

      // Checkout source from GitHub
      sourceAction: new codepipelineActions.BitBucketSourceAction({
        actionName: 'Source',
        connectionArn: cdk.Fn.importValue('github-connection-CodeStarConnection'),
        owner: 'helsingborg-stad',
        repo: 'aws-cloudformation-templates',
        branch: 'master',
        output: sourceArtifact,
        runOrder: 1,
        codeBuildCloneOutput: true,
      }),
      // For synthesize we use the default NPM synth
      synthAction: pipelines.SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,
        // We override the default install command to prepare our lambda too
        installCommand: 'npm ci && npm ci --prefix ../lambda',
        // As we may need Docker we create a privileged container
        environment: {
          privileged: true,
        },
      }),
    });
  }
}


const app = new cdk.App();
new CdkStack(app, 'CdkStack');
