import { Stack, StackProps, aws_cloudwatch as cloudwatch, aws_cloudwatch_actions as actions, aws_ecs as ecs, aws_elasticloadbalancingv2 as elbv2, aws_rds as rds, aws_sns as sns, aws_sns_subscriptions as subscriptions } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface AugentikObservabilityStackProps extends StackProps {
  cluster: ecs.ICluster;
  loadBalancer: elbv2.IApplicationLoadBalancer;
  databaseInstance: rds.IDatabaseInstance;
  notificationEmail?: string;
  slackWebhookUrl?: string;
}

export class AugentikObservabilityStack extends Stack {
  constructor(scope: Construct, id: string, props: AugentikObservabilityStackProps) {
    super(scope, id, props);

    const topic = new sns.Topic(this, 'OpsAlerts', {
      displayName: `${id} Alerts`,
    });

    if (props.notificationEmail) {
      topic.addSubscription(new subscriptions.EmailSubscription(props.notificationEmail));
    }

    const cpuAlarm = new cloudwatch.Alarm(this, 'EcsCpuHigh', {
      metric: props.cluster.metricCpuUtilization(),
      threshold: 80,
      evaluationPeriods: 3,
      datapointsToAlarm: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    cpuAlarm.addAlarmAction(new actions.SnsAction(topic));

    const alb5xxAlarm = new cloudwatch.Alarm(this, 'Alb5xxHigh', {
      metric: props.loadBalancer.metrics.httpCodeElb(elbv2.HttpCodeElb.ELB_5XX_COUNT),
      threshold: 10,
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
    });
    alb5xxAlarm.addAlarmAction(new actions.SnsAction(topic));

    const rdsConnectionsAlarm = new cloudwatch.Alarm(this, 'RdsConnectionsHigh', {
      metric: props.databaseInstance.metricDatabaseConnections(),
      threshold: 80,
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
    });
    rdsConnectionsAlarm.addAlarmAction(new actions.SnsAction(topic));

    new cloudwatch.Dashboard(this, 'OpsDashboard', {
      dashboardName: `${id}-dashboard`,
      widgets: [
        [
          new cloudwatch.GraphWidget({
            title: 'ECS CPU Utilization',
            left: [props.cluster.metricCpuUtilization()],
          }),
          new cloudwatch.GraphWidget({
            title: 'ECS Memory Utilization',
            left: [props.cluster.metricMemoryUtilization()],
          }),
        ],
        [
          new cloudwatch.GraphWidget({
            title: 'ALB 5XX Count',
            left: [props.loadBalancer.metrics.httpCodeElb(elbv2.HttpCodeElb.ELB_5XX_COUNT)],
          }),
          new cloudwatch.GraphWidget({
            title: 'ALB Target Response Time',
            left: [props.loadBalancer.metrics.targetResponseTime()],
          }),
        ],
        [
          new cloudwatch.GraphWidget({
            title: 'RDS CPU Utilization',
            left: [props.databaseInstance.metricCPUUtilization()],
          }),
          new cloudwatch.GraphWidget({
            title: 'RDS Connections',
            left: [props.databaseInstance.metricDatabaseConnections()],
          }),
        ],
      ],
    });
  }
}
