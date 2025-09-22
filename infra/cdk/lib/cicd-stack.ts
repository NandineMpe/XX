import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps, aws_iam as iam, aws_s3 as s3, aws_ecs as ecs } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface AugentikCiCdStackProps extends StackProps {
  githubOwner: string;
  githubRepo: string;
  githubOidcProviderArn: string;
  targetCluster: ecs.ICluster;
  backendService: ecs.FargateService;
  artifactBucket: s3.IBucket;
}

export class AugentikCiCdStack extends Stack {
  public readonly githubRole: iam.Role;

  constructor(scope: Construct, id: string, props: AugentikCiCdStackProps) {
    super(scope, id, props);

    const provider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      'GitHubOidc',
      props.githubOidcProviderArn,
    );

    this.githubRole = new iam.Role(this, 'GitHubActionsRole', {
      assumedBy: new iam.WebIdentityPrincipal(provider.openIdConnectProviderArn, {
        'StringEquals': {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:sub': `repo:${props.githubOwner}/${props.githubRepo}:ref:refs/heads/main`,
        },
      }),
      description: 'Role assumed by GitHub Actions via OIDC for deployments',
      maxSessionDuration: cdk.Duration.hours(1),
    });

    this.githubRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'ecr:GetAuthorizationToken',
        'ecr:BatchCheckLayerAvailability',
        'ecr:CompleteLayerUpload',
        'ecr:GetDownloadUrlForLayer',
        'ecr:BatchGetImage',
        'ecr:InitiateLayerUpload',
        'ecr:PutImage',
        'ecr:UploadLayerPart',
      ],
      resources: ['*'],
    }));

    this.githubRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'ecs:DescribeServices',
        'ecs:DescribeTaskDefinition',
        'ecs:RegisterTaskDefinition',
        'ecs:UpdateService',
        'iam:PassRole',
      ],
      resources: ['*'],
    }));

    this.githubRole.addToPolicy(new iam.PolicyStatement({
      actions: ['ssm:GetParameters', 'ssm:GetParameter', 'secretsmanager:GetSecretValue'],
      resources: ['*'],
    }));

    props.artifactBucket.grantReadWrite(this.githubRole);
  }
}
