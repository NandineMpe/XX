import { Duration, Stack, StackProps, aws_ec2 as ec2, aws_ecr as ecr, aws_ecs as ecs, aws_elasticloadbalancingv2 as elbv2, aws_iam as iam, aws_logs as logs, aws_rds as rds, aws_secretsmanager as secretsmanager } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface AugentikEcsStackProps extends StackProps {
  vpc: ec2.IVpc;
  clusterSecurityGroup: ec2.ISecurityGroup;
  loadBalancerSecurityGroup: ec2.ISecurityGroup;
  databaseSecret: secretsmanager.ISecret;
  applicationSecret: secretsmanager.ISecret;
  rdsInstance: rds.IDatabaseInstance;
  domainName: string;
  /**
   * ACM certificate ARN for the ALB HTTPS listener (regional cert, same region as the stack).
   * Optional: if omitted, service will expose only HTTP:80 and redirect cannot be enabled.
   */
  backendCertificateArn?: string;
}

export class AugentikEcsStack extends Stack {
  public readonly cluster: ecs.Cluster;
  public readonly service: ecs.FargateService;
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: AugentikEcsStackProps) {
    super(scope, id, props);

    this.cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: props.vpc,
      containerInsights: true,
      clusterName: `${id.toLowerCase()}-cluster`,
    });

    const executionRole = iam.Role.fromRoleArn(this, 'ExistingExecutionRole', 'arn:aws:iam::778185677217:role/ecsTaskExecutionRole');
    const taskRole = iam.Role.fromRoleArn(this, 'ExistingTaskRole', 'arn:aws:iam::778185677217:role/AugentikAmdTaskRole');

    const logGroup = new logs.LogGroup(this, 'BackendLogGroup', {
      logGroupName: `/ecs/${id.toLowerCase()}-backend`,
      retention: logs.RetentionDays.ONE_MONTH,
    });

    const repository = ecr.Repository.fromRepositoryName(this, 'BackendRepository', 'augentik-backend');

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDefinition', {
      memoryLimitMiB: 1024,
      cpu: 512,
      executionRole,
      taskRole,
    });

    taskDefinition.addContainer('BackendContainer', {
      containerName: 'augentik-backend',
      image: ecs.ContainerImage.fromEcrRepository(repository, 'latest'),
      portMappings: [{ containerPort: 8000 }],
      essential: true,
      logging: ecs.LogDriver.awsLogs({ logGroup, streamPrefix: 'ecs' }),
      environment: {
        HOST: '0.0.0.0',
        PORT: '8000',
        CORS_ORIGINS: `https://${props.domainName}`,
      },
      secrets: {
        DATABASE_URL: ecs.Secret.fromSecretsManager(props.applicationSecret, 'database_url'),
        JWT_SECRET: ecs.Secret.fromSecretsManager(props.applicationSecret, 'jwt_secret'),
        OPENAI_API_KEY: ecs.Secret.fromSecretsManager(props.applicationSecret, 'openai_api_key'),
        TOKEN_SECRET: ecs.Secret.fromSecretsManager(props.applicationSecret, 'token_secret_placeholder'),
      },
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost:8000/health || exit 1'],
        interval: Duration.seconds(30),
        timeout: Duration.seconds(5),
        retries: 3,
      },
    });

    this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      vpc: props.vpc,
      internetFacing: true,
      securityGroup: props.loadBalancerSecurityGroup,
      loadBalancerName: `${id.toLowerCase()}-alb`,
    });

    const httpListener = this.loadBalancer.addListener('HttpListener', {
      port: 80,
      open: true,
    });

    let listenerForTargets: elbv2.ApplicationListener = httpListener;

    if (props.backendCertificateArn) {
      const certificate = elbv2.ListenerCertificate.fromArn(props.backendCertificateArn);
      httpListener.addAction('RedirectToHttps', {
        action: elbv2.ListenerAction.redirect({ protocol: 'HTTPS', port: '443' }),
      });
      listenerForTargets = this.loadBalancer.addListener('HttpsListener', {
        port: 443,
        certificates: [certificate],
        defaultAction: elbv2.ListenerAction.fixedResponse(200, { contentType: 'text/plain', messageBody: 'Alive' }),
      });
    }

    const serviceSecurityGroup = props.clusterSecurityGroup as ec2.SecurityGroup;

    this.service = new ecs.FargateService(this, 'Service', {
      cluster: this.cluster,
      securityGroups: [serviceSecurityGroup],
      taskDefinition,
      desiredCount: 2,
      circuitBreaker: { rollback: true },
      assignPublicIp: false,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    });

    listenerForTargets.addTargets('BackendTargets', {
      port: 8000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      healthCheck: {
        path: '/health',
        healthyThresholdCount: 3,
        unhealthyThresholdCount: 5,
      },
      targets: [this.service],
    });


    this.service.autoScaleTaskCount({
      minCapacity: 2,
      maxCapacity: 6,
    }).scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 60,
      scaleInCooldown: Duration.minutes(5),
      scaleOutCooldown: Duration.minutes(2),
    });

    props.rdsInstance.connections.allowDefaultPortFrom(serviceSecurityGroup, 'Allow ECS tasks to reach Postgres');
  }
}
