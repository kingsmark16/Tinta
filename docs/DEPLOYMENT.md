# Deployment

**Status:** Planning. No hosting provider, production environment, release pipeline, or deployment command has been selected or verified.

## Environments and configuration

Keep local, test, staging, and production configurations separate. Staging must not point at production data. Production will use managed PostgreSQL and a containerized NestJS API where practical. Store server secrets in the deployment platform's secret storage. The mobile app may contain only values intended to be public; environment-specific API and Clerk configuration must point to the matching environment.

## Backend and database release

Build the API from compiled NestJS output into a production image. Expose a health check and use HTTPS. Commit and review Prisma migrations before release; apply committed migrations through a controlled production workflow, never a development reset. Review existing data, nullability, constraints, backfills, and compatibility with the running API before applying a migration.

Establish CI only after equivalent local install, lint, format, type-check, test, Prisma validation, and build workflows are reliable. The planned GitHub checks are in [GIT_WORKFLOW.md](GIT_WORKFLOW.md). Stage releases and run smoke checks for health, authentication, entry ownership, and important diary flows before production approval.

The planned release sequence is reviewed code, local checks, Git and CI, staging deployment, staging smoke tests, production approval, reviewed production migration, backend deployment, health checks, mobile build and submission, and privacy-conscious monitoring. The exact order of migration and backend rollout must preserve compatibility with the running versions when schema changes are introduced. No deployment pipeline is configured yet.

## Mobile release

Define separate EAS development, preview, and production build profiles in `eas.json`. Build and test each profile for its purpose. EAS Submit is a separate release step after a production build is verified. Use `expo-updates` only for changes it can safely deliver; native changes require a new build. Maintain API compatibility with supported installed app versions.

## Monitoring, backups, and recovery

Monitor availability and errors without collecting diary content, tokens, or other sensitive text. Configure automated database backups, retention, and a documented restore procedure; verify that a restore works before relying on it. Plan API rollback together with migration compatibility. A database restore may discard newer entries, and an installed mobile binary cannot be assumed to roll back immediately.

Add the chosen providers, exact environment variables, commands, health-check criteria, smoke tests, monitoring, release steps, and rollback procedure after they are implemented and tested. Record consequential choices in [DECISIONS.md](DECISIONS.md) and actual release results in [PROJECT_STATUS.md](PROJECT_STATUS.md).
