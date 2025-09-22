#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AugentikNetworkStack } from '../lib/network-stack';
import { AugentikDataStack } from '../lib/data-stack';
import { AugentikEcsStack } from '../lib/ecs-stack';
import { AugentikFrontendStack } from '../lib/frontend-stack';
import { AugentikObservabilityStack } from '../lib/observability-stack';
import { AugentikCiCdStack } from '../lib/cicd-stack';

interface EnvironmentConfig {
  domain: string;
  /** CloudFront (global) certificate in us-east-1 for apex+www */
  frontendCertificateArn?: string;
  /** Regional certificate (stack region) for ALB HTTPS */
  backendCertificateArn?: string;
  githubOwner: string;
  githubRepo: string;
  githubOidcProviderArn: string;
  slackWebhookUrl?: string;
}

const app = new cdk.App();
const contextKey = app.node.tryGetContext('env') ?? 'staging';
const environments = app.node.tryGetContext('environments') as Record<string, EnvironmentConfig>;

if (!environments || !environments[contextKey]) {
  throw new Error(`Missing context for environment '${contextKey}'. Set --context env=<dev|staging|prod>.`);
}

const envConfig = environments[contextKey];

if (!envConfig.githubOidcProviderArn) {
  throw new Error('githubOidcProviderArn must be defined in cdk.json context.');
}

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
};

const networkStack = new AugentikNetworkStack(app, `Augentik-${contextKey}-Network`, {
  env,
  description: 'Core VPC networking for Augentik workloads',
  cidr: '10.64.0.0/16',
});

const dataStack = new AugentikDataStack(app, `Augentik-${contextKey}-Data`, {
  env,
  description: 'Persistent data services (RDS, S3) for Augentik',
  vpc: networkStack.vpc,
  databaseSecurityGroup: networkStack.databaseSecurityGroup,
  databaseName: 'augentik',
  databaseUsername: 'augentik_app',
  enableMultiAz: contextKey === 'prod',
});

dataStack.addDependency(networkStack);

const ecsStack = new AugentikEcsStack(app, `Augentik-${contextKey}-Ecs`, {
  env,
  description: 'ECS Fargate services, task definitions, and ALB wiring',
  vpc: networkStack.vpc,
  clusterSecurityGroup: networkStack.clusterSecurityGroup,
  loadBalancerSecurityGroup: networkStack.loadBalancerSecurityGroup,
  databaseSecret: dataStack.databaseSecret,
  applicationSecret: dataStack.applicationSecret,
  rdsInstance: dataStack.databaseInstance,
  domainName: envConfig.domain,
  backendCertificateArn: envConfig.backendCertificateArn,
});

ecsStack.addDependency(dataStack);

const frontendStack = new AugentikFrontendStack(app, `Augentik-${contextKey}-Frontend`, {
  env,
  description: 'Static frontend hosting via S3 + CloudFront',
  domainName: envConfig.domain,
  certificateArn: envConfig.frontendCertificateArn,
  backendLoadBalancer: ecsStack.loadBalancer,
  enableWww: process.env.AUGENTIK_ENABLE_WWW !== '0',
});

frontendStack.addDependency(ecsStack);

const observabilityStack = new AugentikObservabilityStack(app, `Augentik-${contextKey}-Observability`, {
  env,
  description: 'Monitoring, alarms, and dashboards for Augentik',
  cluster: ecsStack.cluster,
  loadBalancer: ecsStack.loadBalancer,
  databaseInstance: dataStack.databaseInstance,
  notificationEmail: process.env.AUGENTIK_ALERT_EMAIL,
  slackWebhookUrl: envConfig.slackWebhookUrl,
});

observabilityStack.addDependency(ecsStack);

new AugentikCiCdStack(app, `Augentik-${contextKey}-CiCd`, {
  env,
  description: 'GitHub OIDC role and supporting resources for CI/CD',
  githubOwner: envConfig.githubOwner,
  githubRepo: envConfig.githubRepo,
  githubOidcProviderArn: envConfig.githubOidcProviderArn,
  targetCluster: ecsStack.cluster,
  backendService: ecsStack.service,
  artifactBucket: frontendStack.artifactBucket,
});
