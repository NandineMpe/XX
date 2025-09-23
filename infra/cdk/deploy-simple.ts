#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AugentikFrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
};

// Create a simple load balancer for the frontend stack to reference
class MockLoadBalancer implements cdk.aws_elasticloadbalancingv2.IApplicationLoadBalancer {
  public readonly loadBalancerArn = 'arn:aws:elasticloadbalancing:us-east-1:778185677217:loadbalancer/app/mock/1234567890';
  public readonly loadBalancerCanonicalHostedZoneId = 'Z123456789';
  public readonly loadBalancerDnsName = 'mock-alb.us-east-1.elb.amazonaws.com';
  public readonly loadBalancerFullName = 'app/mock/1234567890';
  public readonly loadBalancerName = 'mock';
  public readonly loadBalancerSecurityGroups = ['sg-123456789'];
  public readonly vpc = {} as any;
  public readonly env = env;
  public readonly stack = {} as any;
  public readonly node = {} as any;

  public addListener(): any { return {}; }
  public addRedirect(): any { return {}; }
  public addSecurityGroup(): void {}
  public logAccessLogs(): void {}
  public setAttribute(): void {}
  public metric(): any { return {}; }
  public metricActiveConnectionCount(): any { return {}; }
  public metricClientTlsNegotiationErrorCount(): any { return {}; }
  public metricConsumedLCUs(): any { return {}; }
  public metricElbAuthError(): any { return {}; }
  public metricElbAuthFailure(): any { return {}; }
  public metricElbAuthLatency(): any { return {}; }
  public metricElbAuthSuccess(): any { return {}; }
  public metricHttpCodeElb(): any { return {}; }
  public metricHttpCodeTarget(): any { return {}; }
  public metricHttpFixedResponseCount(): any { return {}; }
  public metricHttpRedirectCount(): any { return {}; }
  public metricHttpRedirectUrlLimitExceededCount(): any { return {}; }
  public metricIpv6ProcessedBytes(): any { return {}; }
  public metricIpv6RequestCount(): any { return {}; }
  public metricNewConnectionCount(): any { return {}; }
  public metricProcessedBytes(): any { return {}; }
  public metricRejectedConnectionCount(): any { return {}; }
  public metricRequestCount(): any { return {}; }
  public metricRuleEvaluations(): any { return {}; }
  public metricTargetConnectionErrorCount(): any { return {}; }
  public metricTargetResponseTime(): any { return {}; }
  public metricTargetTLSNegotiationErrorCount(): any { return {}; }
  public removeAttribute(): void {}
  public applyRemovalPolicy(): void {}
}

// Deploy just the frontend stack for now
new AugentikFrontendStack(app, 'Augentik-prod-Frontend', {
  env,
  description: 'Static frontend hosting via S3 + CloudFront',
  domainName: 'augentik.com',
  certificateArn: 'arn:aws:acm:us-east-1:778185677217:certificate/1678915f-4774-452c-81f1-440088804648',
  backendLoadBalancer: new MockLoadBalancer(),
  enableWww: true,
});