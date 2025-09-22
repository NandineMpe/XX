import { Duration, RemovalPolicy, Stack, StackProps, aws_ec2 as ec2, aws_rds as rds, aws_secretsmanager as secretsmanager, aws_s3 as s3 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface AugentikDataStackProps extends StackProps {
  vpc: ec2.IVpc;
  databaseSecurityGroup: ec2.ISecurityGroup;
  databaseName: string;
  databaseUsername: string;
  enableMultiAz: boolean;
}

export class AugentikDataStack extends Stack {
  public readonly databaseInstance: rds.DatabaseInstance;
  public readonly databaseSecret: secretsmanager.Secret;
  public readonly applicationSecret: secretsmanager.Secret;
  public readonly assetBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: AugentikDataStackProps) {
    super(scope, id, props);

    this.databaseSecret = new secretsmanager.Secret(this, 'DatabaseCredentials', {
      secretName: `${id.toLowerCase()}-postgres`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: props.databaseUsername }),
        generateStringKey: 'password',
        excludePunctuation: true,
      },
    });

    this.databaseInstance = new rds.DatabaseInstance(this, 'Postgres', {
      vpc: props.vpc,
      securityGroups: [props.databaseSecurityGroup],
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      allocatedStorage: 100,
      maxAllocatedStorage: 500,
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.V16_1 }),
      credentials: rds.Credentials.fromSecret(this.databaseSecret, props.databaseUsername),
      multiAz: props.enableMultiAz,
      storageEncrypted: true,
      deletionProtection: props.enableMultiAz,
      backupRetention: Duration.days(7),
      monitoringInterval: Duration.seconds(60),
      cloudwatchLogsExports: ['postgresql', 'upgrade'],
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      databaseName: props.databaseName,
    });

    this.applicationSecret = new secretsmanager.Secret(this, 'BackendRuntimeSecret', {
      secretName: `${id.toLowerCase()}-backend`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          database_url: '',
          jwt_secret: '',
          openai_api_key: '',
        }),
        generateStringKey: 'token_secret_placeholder',
      },
    });

    this.assetBucket = new s3.Bucket(this, 'TenantAssetBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
      lifecycleRules: [
        {
          id: 'ExpireIncompleteUploads',
          abortIncompleteMultipartUploadAfter: Duration.days(7),
        },
      ],
      removalPolicy: props.env?.account ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: false,
    });
  }
}
