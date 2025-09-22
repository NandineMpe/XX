# Augentik AWS Migration Kickoff

This document captures the work staged locally and the follow-on actions that must be completed inside AWS and supporting SaaS tooling. The automation here is **not** executed and still requires validation of IAM permissions, secrets, and environment-specific configuration before production use.

## Local Artifacts Added

- `infra/cdk`: AWS CDK v2 TypeScript app with stacks for networking, data, ECS, frontend, observability, and GitHub OIDC integration. Each stack groups related resources to simplify promotion across environments.
- `.github/workflows/deploy-backend.yml`: Builds the backend image, pushes to ECR, and triggers an ECS deployment. Expects `AWS_GITHUB_ROLE_ARN` and sanitized task definitions/secrets.
- `.github/workflows/deploy-frontend.yml`: Builds the static frontend, syncs to S3, and invalidates CloudFront. Expects the bucket/distribution names exported by CDK plus `BACKEND_LOGIN_URL`.
- `.github/workflows/deploy-infra.yml`: CDK synth on push and manual-triggered deployment using GitHub OIDC. Requires approver list in `DEPLOY_APPROVERS` or set `require_approval` to `false`.

## Immediate Remediation Required

1. **Secrets hygiene**
   - Remove hard-coded secrets from `taskdef.json`, `secret-amd.json`, and related files. Import values into AWS Secrets Manager/SSM Parameter Store. Update the CDK stacks to reference the final secret schema.
   - Rotate any compromised credentials (e.g., `AUTH_ACCOUNTS`, JWT secrets) across Railway, Vercel, and any other surfaces.
2. **AWS account guardrails**
   - Enable MFA on the root account, delete root access keys, and review CloudTrail for anomalous activity.
   - Create `admins`, `ops`, and `readonly` IAM groups with least-privilege policies; assign existing users/roles appropriately.
3. **IAM role validation**
   - The GitHub OIDC provider already exists at `arn:aws:iam::778185677217:oidc-provider/token.actions.githubusercontent.com`. Confirm the CI/CD role (`AugentikAWSRole` or future CDK-managed equivalent) trusts that provider and limits `token.actions.githubusercontent.com:sub` to the intended repo/branches.
   - Scope the role's policies to explicit ARNs (ECR repo, ECS cluster/service, Secrets Manager entries) once those resources are finalized.
4. **Networking**
   - Verify the planned VPC CIDR (`10.64.0.0/16`) does not conflict with existing networks/DirectConnect/VPNs. Adjust before first deploy if conflicts exist.
   - Request/validate ACM certificates per environment and populate `cdk.json` context with the ARNs. The previous ACM request failed; retry and ensure DNS validation succeeds.
5. **Data layer**
   - Size the RDS instance appropriately (storage, instance class, Multi-AZ) and configure parameter groups. Consider PG bouncer/Proxy if required.
   - Build and test a Railway to RDS migration workflow (pg_dump/pg_restore or DMS). Capture in CI or runbook.
6. **Frontend**
   - Confirm the static build output folder (`dist`) matches the real frontend artifact path. Adjust the workflow and CloudFront behaviors if different.
   - Populate Route 53 hosted zones and plan DNS cut-over approval steps.
   - Define `BACKEND_LOGIN_URL` after the new ALB/CloudFront endpoint is available; for now leave the GitHub secret blank or point to the existing Railway/Vercel URL.
7. **Observability**
   - Wire the SNS topic in `AugentikObservabilityStack` to real email/SNS endpoints or Slack (via webhook/Lambda) before go-live.
8. **Compliance & backups**
   - Enable AWS Config, GuardDuty, and Backup if required by policy. Add cross-region snapshot copy for RDS if DR mandates it.

## Deployment Checklist

1. Run `npm install && npm run build` inside `infra/cdk`, fix TypeScript compilation errors, and adjust stack logic for real secrets/parameters.
2. Bootstrap the target account/regions for CDK v2 (`cdk bootstrap aws://778185677217/us-east-1`).
3. Deploy networking/data stacks in a staging account:
   ```bash
   npx cdk deploy Augentik-staging-Network Augentik-staging-Data --context env=staging
   ```
4. Populate Secrets Manager/SSM with application secrets and non-sensitive configs (`applicationSecret` placeholder must be replaced with real values that include DB host/port/user/password and JWT/API keys).
5. Deploy ECS/frontend/observability stacks and confirm services register with the new load balancer and CloudFront distribution.
6. Update GitHub repository secrets:
   - `AWS_GITHUB_ROLE_ARN` -> ARN of the OIDC role (e.g., `arn:aws:iam::778185677217:role/AugentikAWSRole`).
   - `BACKEND_LOGIN_URL` -> populate once the ALB/CloudFront endpoint is published.
   - `DEPLOY_APPROVERS` -> optional comma-separated GitHub usernames for manual approvals.
7. Trigger `Deploy Infrastructure` workflow via GitHub Actions for end-to-end test, then seed data and validate application health.
8. Execute database migration, switch DNS via Route 53, monitor CloudWatch dashboards/alarms for 48 hours, and only then decommission Railway/Vercel.

## Known Gaps / Next Steps

- Secrets Manager object models use placeholder keys; redefine them once target schema is finalized.
- CloudFront additional behavior points at the ALB DNS name. Ensure the ALB listener is configured for HTTPS and uses a certificate that matches the hostname served behind CloudFront before enabling prod traffic.
- The GitHub Actions role currently grants broad resource access (`resources: '*'`). Narrow these to specific ARNs after CDK deploys the final resources.
- Database migration automation is not yet scripted. Decide between GitHub Actions job, AWS DMS, or manual runbook.
- Cost-optimization (Savings Plans, S3 intelligent tiering tuning, RDS storage autoscaling) remains to be evaluated once usage metrics are collected.

Document owners should revise this checklist after each milestone to capture changes requested by security, compliance, or application teams.
