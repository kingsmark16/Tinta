# Local Development

**Status:** The pnpm workspace, Expo mobile starter, and NestJS API starter are scaffolded. Dependency installation, the mobile web starter, mobile TypeScript checking, API development startup, and the generated API end-to-end test have been verified. Tinta features, PostgreSQL, Prisma, and Clerk are not set up yet.

## Toolchain and remaining prerequisites

- The user reported Node.js `v24.21.0` and pnpm `12.5.1`. The root `package.json` specifies pnpm `12.5.1` and Node.js `>=24.15.0 <25`.
- Expo web has run. Set up and verify a physical device, emulator, or simulator separately for native development.
- Provide a local PostgreSQL instance, preferably through Docker Compose when practical. Docker and Compose are not configured in this repository yet.
- Configure a Clerk development instance.

Keep server secrets out of the mobile bundle and out of Git.

The original repository layout also proposed `.editorconfig` and `.npmrc` for shared editor and pnpm conventions. Neither exists yet; add specific settings when the need is established.

## Verified baseline commands

Run these commands in PowerShell from the repository root, `C:\Users\marka\Desktop\Tinta`. The results below are from the user's runs; they describe the generated starters, not Tinta features.

| Command | Purpose and possible changes | Observed result and success check |
| --- | --- | --- |
| `pnpm install` | Installs dependencies for all workspace projects. It writes `node_modules` and may update `pnpm-lock.yaml`. | Completed for all three projects without an install failure. Registry speed and deprecated transitive dependency warnings did not stop installation. |
| `pnpm --filter mobile run web` | Starts Expo's web development server. It stays running until stopped and may create local Expo cache files. | Expo bundled, and the starter Home screen rendered at `http://localhost:8081`. |
| `pnpm --filter mobile exec tsc --noEmit` | Checks mobile TypeScript without emitting JavaScript; TypeScript may update local cache files. | Completed with no diagnostics. |
| `pnpm --filter api run start:dev` | Starts NestJS in watch mode. It stays running until stopped and may write build output. | Watch compilation reported 0 errors, Nest started, and `GET /` was mapped. The later pnpm exit error followed the user's termination of watch mode. |
| `pnpm --filter api run test:e2e` | Runs the generated Vitest end-to-end test, which starts the API in the test process and sends an HTTP request. It may write test cache files. | One test passed: `GET /` returned HTTP 200 and `Hello World!`. This does not verify mobile-to-API or authenticated behavior. |

## Planned full-stack setup sequence

1. Install pnpm workspace dependencies using the verified command above when setting up a fresh checkout.
2. Start local PostgreSQL and configure a development database.
3. Configure API database and Clerk settings using local environment files or secret storage. Keep secrets out of Git.
4. Apply committed Prisma migrations and generate the client if required.
5. Configure the mobile app's development API address and Clerk publishable configuration. Never put server secrets in the mobile bundle.
6. Start the NestJS API and Expo mobile app.
7. Verify a health request and an authenticated request using synthetic data.

Local, test, staging, and production databases and credentials must remain separate. Do not use real diary content as development or test data.

## Commands still to establish or verify

Document the actual commands for Docker Compose start/stop, Prisma validation, named development migrations, Prisma client generation, native mobile start, lint, a non-writing format check, API unit tests with Vitest, and production builds as those workflows are established and run. The original plan calls for ESLint and Prettier. The API scaffold currently defines Oxlint and a writing Prettier `format` script; project-wide ESLint and a format check have not been configured or verified. For each new command, include its working directory, purpose, side effects, expected output, and success check.

## Planned migration workflow

When Prisma is introduced, change and review `schema.prisma`, create a named development migration, inspect its SQL for data loss or compatibility risks, apply it to the local development database, generate the client if required, and run the relevant tests. Commit the schema and migration together after review. Production applies committed migrations through the controlled release process in [DEPLOYMENT.md](DEPLOYMENT.md); never run a development reset against production data. Explain data loss, reversibility, and backup needs before any destructive database action.

## Troubleshooting basics

When a workflow fails, capture the exact error, reproduce it, identify recent changes, and test one hypothesis at a time. Check the relevant layer: React Native, Expo or Expo Router, Clerk, the API client or HTTP transport, a NestJS guard, DTO validation, a controller or service, Prisma, PostgreSQL, Docker, environment configuration, CI, or deployment. Check the API address used by a device or emulator, database availability, migration state, and authentication configuration before changing application code. Do not include tokens, credentials, or diary text in shared logs.

Follow [LEARNING_WORKFLOW.md](LEARNING_WORKFLOW.md) for feature work. Add verified test commands to [TESTING.md](TESTING.md) and record current results in [PROJECT_STATUS.md](PROJECT_STATUS.md).

For branches, reviewed commits, pushes, and the planned CI checks, use [GIT_WORKFLOW.md](GIT_WORKFLOW.md).
