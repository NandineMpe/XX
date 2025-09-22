import { Duration, Stack, StackProps, aws_certificatemanager as acm, aws_cloudfront as cloudfront, aws_cloudfront_origins as origins, aws_elasticloadbalancingv2 as elbv2, aws_iam as iam, aws_route53 as route53, aws_route53_targets as targets, aws_s3 as s3 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface AugentikFrontendStackProps extends StackProps {
  domainName: string;
  certificateArn?: string;
  backendLoadBalancer: elbv2.IApplicationLoadBalancer;
}

export class AugentikFrontendStack extends Stack {
  public readonly siteBucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;
  public readonly artifactBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: AugentikFrontendStackProps) {
    super(scope, id, props);

    this.siteBucket = new s3.Bucket(this, 'SiteBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
    });

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'Oai');
    this.siteBucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [this.siteBucket.arnForObjects('*')],
      principals: [new iam.CanonicalUserPrincipal(originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
    }));

    const certificate = props.certificateArn
      ? acm.Certificate.fromCertificateArn(this, 'ImportedCertificate', props.certificateArn)
      : undefined;

    const backendOrigin = new origins.HttpOrigin(props.backendLoadBalancer.loadBalancerDnsName, {
      protocolPolicy: props.certificateArn
        ? cloudfront.OriginProtocolPolicy.HTTPS_ONLY
        : cloudfront.OriginProtocolPolicy.HTTP_ONLY,
      originSslProtocols: [cloudfront.OriginSslPolicy.TLS_V1_2],
    });

    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(this.siteBucket, { originAccessIdentity }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: backendOrigin,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        },
      },
      defaultRootObject: 'index.html',
      enableLogging: true,
      logFilePrefix: 'cloudfront/',
      geoRestriction: cloudfront.GeoRestriction.none(),
      certificate,
      domainNames: certificate ? [props.domainName] : undefined,
    });

    if (props.env?.region === 'us-east-1') {
      const zone = route53.HostedZone.fromLookup(this, 'HostedZone', {
        domainName: props.domainName,
      });
      new route53.ARecord(this, 'AliasRecord', {
        zone,
        recordName: props.domainName,
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution)),
      });
    }

    this.artifactBucket = new s3.Bucket(this, 'ArtifactBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
      lifecycleRules: [
        {
          id: 'PruneBuildArtifacts',
          expiration: Duration.days(30),
        },
      ],
    });
  }
}
