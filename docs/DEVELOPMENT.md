# Local Development

**Status:** The pnpm workspace, Expo mobile starter, and NestJS API starter are scaffolded. Dependency installation, mobile web startup, mobile TypeScript checking, API development startup, and the API HTTP tests have been verified. The standalone `entryDate` validator passed its unit tests, API TypeScript, Oxlint, and Prettier checks. The API has `CreateEntryDto` and a global `ValidationPipe`, but no entry route uses the DTO. API-side Clerk verification for `GET /auth/me` is implemented on `feat/api-authentication`. The mobile app uses Clerk Expo with password sign-in and sign-up, email-code verification for new accounts, and supported email-code MFA/device-trust challenges. The user ran the combined route-state, password-auth, and profile-requirements test suite: 37 passed. The user reports creating an account and authenticating successfully; Expo web shows the protected Home route and NativeWind panel. The API allows the local Expo web origin through a narrow CORS policy; all 6 API e2e tests passed, including 3 CORS tests. The signed-in Home screen calls `GET /auth/me` through a tested helper: its 7 tests passed, and the mobile TypeScript check returned without diagnostics. `EXPO_PUBLIC_API_URL` is present in the ignored mobile `.env`; the helper, Home screen, and test pass the Prettier check. The user corrected the Home effect loop, passed the mobile TypeScript check, started the API, and shared an Expo screenshot showing `API session verified`; the live authenticated response is confirmed. PostgreSQL and Prisma are not set up yet.

NativeWind is the required styling system for app-owned mobile UI across native and web targets. The user installed NativeWind 4.2.7 and Tailwind CSS 3 in the mobile workspace, added Babel preset Expo as a mobile dev dependency, created `apps/mobile/tailwind.config.js` to scan `src`, added Tailwind directives to the existing `src/global.css` while preserving its font variables, created `apps/mobile/babel.config.js` with the Expo and NativeWind presets, created `apps/mobile/metro.config.js` to wrap Expo's default Metro config and process `src/global.css`, and set Expo's web bundler to Metro. The root layout is now the sole importer of the CSS. The first web bundle attempt failed because Metro could not resolve `react-native-css-interop/jsx-runtime`; adding `react-native-css-interop@0.2.7` directly resolved the bundling error. The retry bundled Expo web and started the app runtime. A temporary Home screen `View`/`Text` panel visibly confirmed NativeWind background, spacing, corner, and text utilities on web. The screenshot of the current Expo Home confirms the panel renders as a separate row. Expo also generated `nativewind-env.d.ts` and added it to `tsconfig.json`; mobile TypeScript checking passed afterward. The generated starter still uses its existing styling approach. Use NativeWind for new and updated UI as setup proceeds.

## Toolchain and remaining prerequisites

- The user reported Node.js `v24.21.0` and pnpm `12.5.1`. The root `package.json` specifies pnpm `12.5.1` and Node.js `>=24.15.0 <25`.
- Expo web has run. Set up and verify a physical device, emulator, or simulator separately for native development.
- Provide a local PostgreSQL instance, preferably through Docker Compose when practical. Docker and Compose are not configured in this repository yet.
- The Clerk Development instance is linked and Native API is enabled. Production Clerk configuration remains future work.

Keep server secrets out of the mobile bundle and out of Git.

The original repository layout also proposed `.editorconfig` and `.npmrc` for shared editor and pnpm conventions. Neither exists yet; add specific settings when the need is established.

## Verified baseline commands

Run these commands in PowerShell from the repository root, `C:\Users\marka\Desktop\Tinta`. The results below are from the user's runs; they cover the generated starters and the standalone date validator, not a complete Tinta feature.

| Command | Purpose and possible changes | Observed result and success check |
| --- | --- | --- |
| `pnpm install` | Installs dependencies for all workspace projects. It writes `node_modules` and may update `pnpm-lock.yaml`. | Completed for all three projects without an install failure. Registry speed and deprecated transitive dependency warnings did not stop installation. |
| `pnpm --filter mobile exec expo start --web --clear` | Starts Expo's web development server and clears Metro's local cache. It stays running until stopped; clearing the cache can make the next bundle slower. | After `react-native-css-interop@0.2.7` was added directly to the mobile app, Expo produced the server and web bundles and started the app runtime. A screenshot showed the temporary Home panel with the requested NativeWind styles. The user moved it outside `ThemedText`; visually confirm the corrected layout before native verification. The Clerk development-key warning was expected. |
| `pnpm --filter mobile exec tsc --noEmit` | Checks mobile TypeScript without emitting JavaScript; TypeScript may update local cache files. | The user reran it after NativeWind generated `nativewind-env.d.ts` and updated `tsconfig.json`; it completed without diagnostics. This verifies types, not visible utility-class rendering or a native build. |
| `pnpm --filter api run start:dev` | Starts NestJS in watch mode. It stays running until stopped and may write build output. | Watch compilation reported 0 errors, Nest started, and `GET /` was mapped. The later pnpm exit error followed the user's termination of watch mode. |
| `pnpm --filter api run test:e2e` | Runs the generated Vitest HTTP test, which starts the API in the test process and sends an HTTP request. It may write test cache files. | One test passed after the type-only edit: `GET /` returned HTTP 200 and `Hello World!`. This result does not verify mobile-to-API or authenticated behavior. |
| `pnpm --filter api add class-validator class-transformer` | Adds NestJS DTO validation dependencies to the API and updates `apps/api/package.json`, `pnpm-lock.yaml`, and installed workspace packages. | Completed successfully; pnpm added 9 packages. It reported two deprecated transitive dependencies and a workspace peer-dependency warning, but no install failure. |
| `pnpm peers check` | Reports unmet peer dependency ranges across the workspace; it does not change project files. | Exited with code 1 and reported TypeScript 6.0.3 where `tsconfck@3.1.6` (from API dev dependency `vite-tsconfig-paths@5.1.4`) wants TypeScript `^5.0.0`, plus `@react-native/metro-config@0.87.1` where `@react-native/community-cli-plugin@0.86.3` wants `0.86.3`. These are in the existing Vite and Expo/React Native toolchains, not the newly added validation packages. Review before establishing CI or native mobile checks. |
| `pnpm --filter api exec tsc --noEmit` | Checks API TypeScript without emitting JavaScript; TypeScript may update an ignored incremental cache. | Completed with no diagnostics after the new `CreateEntryDto` and global pipe configuration were added. After the DTO spec and spelling fix, `pnpm --filter api exec tsc --noEmit --incremental false` also exited with code 0 and no diagnostics without writing compiler output. |
| `pnpm --filter api run test` | Runs the API Vitest unit suite without a running server or database; it may write local test cache files. | 2 files and 12 tests passed, including 11 date-validator cases and the generated controller test. |
| `pnpm --filter api run lint` | Runs the API scaffold's type-aware Oxlint check on `src/` and `test/`; it does not rewrite source. | Reported 0 warnings and 0 errors across 10 files after the DTO spec was added. |
| `pnpm --filter api exec prettier --check "src/**/*.ts" "test/**/*.ts"` | Checks API TypeScript formatting without rewriting files. The API's `.prettierrc` uses `endOfLine: "auto"` for the existing Windows and Unix line endings. | Reported that all matched files use Prettier code style after the DTO spec was added. |

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

Document the actual commands for Docker Compose start/stop, Prisma validation, named development migrations, Prisma client generation, native mobile start, and production builds as those workflows are established and run. API unit tests, Oxlint, and a non-writing Prettier command have passed locally; broader workspace checks and CI are not configured. Review the TypeScript/`tsconfck` and React Native Metro peer mismatches listed above before establishing CI or relying on native mobile checks. The original plan calls for ESLint and Prettier, while the API scaffold currently uses Oxlint, so the lint-tool choice remains open. The API's `format` script writes files; the verified `prettier --check` command above does not. For each new command, include its working directory, purpose, side effects, expected output, and success check.

## Planned migration workflow

When Prisma is introduced, change and review `schema.prisma`, create a named development migration, inspect its SQL for data loss or compatibility risks, apply it to the local development database, generate the client if required, and run the relevant tests. Commit the schema and migration together after review. Production applies committed migrations through the controlled release process in [DEPLOYMENT.md](DEPLOYMENT.md); never run a development reset against production data. Explain data loss, reversibility, and backup needs before any destructive database action.

## Troubleshooting basics

When a workflow fails, capture the exact error, reproduce it, identify recent changes, and test one hypothesis at a time. Check the relevant layer: React Native, Expo or Expo Router, Clerk, the API client or HTTP transport, a NestJS guard, DTO validation, a controller or service, Prisma, PostgreSQL, Docker, environment configuration, CI, or deployment. Check the API address used by a device or emulator, database availability, migration state, and authentication configuration before changing application code. Do not include tokens, credentials, or diary text in shared logs.

Follow [LEARNING_WORKFLOW.md](LEARNING_WORKFLOW.md) for feature work. Add verified test commands to [TESTING.md](TESTING.md) and record current results in [PROJECT_STATUS.md](PROJECT_STATUS.md).

For branches, reviewed commits, pushes, and the planned CI checks, use [GIT_WORKFLOW.md](GIT_WORKFLOW.md).
