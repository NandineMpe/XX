import { Stack, StackProps, aws_ec2 as ec2 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface AugentikNetworkStackProps extends StackProps {
  cidr: string;
}

export class AugentikNetworkStack extends Stack {
  public readonly vpc: ec2.Vpc;
  public readonly loadBalancerSecurityGroup: ec2.SecurityGroup;
  public readonly clusterSecurityGroup: ec2.SecurityGroup;
  public readonly databaseSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: AugentikNetworkStackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'Vpc', {
      vpcName: `${id}-vpc`,
      ipAddresses: ec2.IpAddresses.cidr(props.cidr),
      maxAzs: 3,
      natGateways: 1,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          name: 'private-app',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          name: 'private-db',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    this.loadBalancerSecurityGroup = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc: this.vpc,
      description: 'Allow inbound HTTP/HTTPS traffic to ALB',
      allowAllOutbound: true,
    });
    this.loadBalancerSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP');
    this.loadBalancerSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'HTTPS');

    this.clusterSecurityGroup = new ec2.SecurityGroup(this, 'ClusterSecurityGroup', {
      vpc: this.vpc,
      description: 'Allow ALB and RDS access for ECS tasks',
      allowAllOutbound: true,
    });
    this.clusterSecurityGroup.addIngressRule(this.loadBalancerSecurityGroup, ec2.Port.tcp(8000), 'App traffic from ALB');

    this.databaseSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc: this.vpc,
      description: 'Allow database access from ECS tasks',
      allowAllOutbound: false,
    });
    this.databaseSecurityGroup.addIngressRule(this.clusterSecurityGroup, ec2.Port.tcp(5432), 'Postgres from ECS tasks');
    this.clusterSecurityGroup.addEgressRule(this.databaseSecurityGroup, ec2.Port.tcp(5432));
  }
}
