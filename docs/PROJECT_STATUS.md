# Project Status

## Current Phase

The pnpm workspace, Expo mobile starter, and NestJS API starter are scaffolded. The mobile starter was verified on web, and the API started and passed its generated Vitest HTTP test. The standalone `entryDate` validator and create-entry DTO validation are merged into `main` and covered by focused tests. Entry HTTP routes, authentication, and persistence remain planned.

## Current Goal

Establish a small GitHub Actions CI gate for checks already verified locally, then continue the protected `POST /entries` slice. NestJS `ValidationPipe` with class-validator is configured, but no entry route uses the DTO yet. The date-only database representation is planned as PostgreSQL `date`; authentication and persistence are not implemented.

## Completed

- Created and reviewed `AGENTS.md`.
- Created `README.md` and the initial learning workflow, architecture, local development, testing, deployment, security, and decision documents in `docs/`.
- The user created the root `package.json`, `pnpm-workspace.yaml`, and `.gitignore`.
- The user scaffolded `apps/mobile` with Expo SDK 57, Expo Router, and TypeScript, then installed workspace dependencies from the repository root.
- The user scaffolded `apps/api` with NestJS 12, ESM, TypeScript, and Vitest, then installed dependencies for all three workspace projects from the repository root.
- Updated the local development and testing guides for the verified baseline, and recorded the ESM/Vitest choice. Agreed on the initial create-entry request, response, and diary-day rules.
- Reconciled the original brief into product, architecture, security, development, testing, deployment, learning, decision, and Git/CI guidance. The later Vitest choice supersedes the original Jest plan.
- The user committed the scaffold and documentation as `16446df` (`chore: scaffold Tinta workspace`) and pushed it to `origin/main`.
- The user added a pure `entryDate` validator for exact `YYYY-MM-DD` calendar dates and 11 focused Vitest cases, including leap-year and invalid-input cases.
- Changed the generated API HTTP test to use the Node HTTP server type for TypeScript checking. The user configured Prettier to preserve existing line-ending styles and formatted the three files reported by the check.
- The user merged [PR #1](https://github.com/kingsmark16/Tinta/pull/1), `feat(entries): validate diary dates`, into `main` at commit `c000c37` (`Merge pull request #1 from kingsmark16/feat/entry-date-validation`) and synchronized local `main` to `origin/main`.
- The user committed the create-entry DTO, global validation pipe configuration, focused Vitest spec, dependency lockfile changes, and related documentation as `7233999` (`feat(entries): add create-entry validation`) on `feat/entry-create-validation`, then pushed the branch to `origin`.
- The user merged [PR #2](https://github.com/kingsmark16/Tinta/pull/2), the create-entry validation checkpoint, into `main` at merge commit `88540c2`. The final PR also included documentation commit `949838d`.

## In Progress

- Work is on `ci/github-actions-checks`, created from local `main` after PR #2 merged. A first GitHub Actions workflow is drafted to check existing API and mobile commands, but has not run on GitHub. `CreateEntryDto` requires nonblank `content`, a valid `entryDate` through the existing date helper, and an optional string `title`. A global `ValidationPipe` is registered in `main.ts` with transformation disabled and unknown body fields forbidden. The focused DTO and pipe spec passed all six cases. No entry controller uses the DTO, so entry requests are not validated over HTTP. Authentication and persistence are not implemented.

## Next

- Review and commit the draft GitHub Actions workflow and documentation on `ci/github-actions-checks`, push the branch, and open a PR into `main` to verify the first GitHub-hosted run. Its frozen install and all listed API/mobile checks passed locally. Do not require its check on `main` until the PR run is trustworthy. GitHub showed no checks on PR #2 because the workflow did not exist then.
- Then continue the entry slice. The DTO will only affect HTTP requests after a route binds it with `@Body()`; keep the route protected when it is added.
- Then implement Clerk token verification, derive ownership from the verified identity, and add owner-scoped persistence. Use the PostgreSQL `date` decision for `entryDate`, with explicit UTC conversion tests when Prisma is installed.
- Track the existing TypeScript/`tsconfck` and React Native Metro peer mismatches when running a frozen install in CI; investigate if they become failures. Native mobile checks remain separate from mobile TypeScript.
- Use the API's existing passing Oxlint command for the first CI workflow. Reconcile Oxlint with the original ESLint direction before treating that choice as permanent.

## Blockers

- None known.

## Important Decisions

- The user is the developer; the AI agent is an engineering mentor. The agent may read and search relevant repository files with read-only commands and has standing authorization to maintain relevant Markdown documentation automatically. Other file edits and non-read-only commands require a direct request; the user normally commits and pushes.
- Tinta is a private digital diary. Privacy and server-side ownership checks are core requirements.
- The pnpm workspace contains the Expo mobile starter and NestJS 12 API starter. The user chose ESM and Vitest for the API.
- The original brief names ESLint and Prettier. The API scaffold uses Oxlint and Prettier; both its current lint command and a non-writing format check have passed locally. The ESLint versus Oxlint choice and CI configuration remain open.
- The planned create-entry contract requires nonblank content, a valid date-only `entryDate`, and verified ownership. Multiple entries may share one diary day.
- The chosen persistence type for `entryDate` is PostgreSQL `date`, with UTC conversion isolated in a mapper when Prisma is added; persistence is not implemented. The request DTO passed a focused pipe-level behavior test, but is not connected to an entry route. The spec instantiates a matching pipe and does not verify `main.ts` registration over HTTP.
- Clerk, Prisma, and PostgreSQL remain planned and are not yet implemented.

## Latest Verification

- `AGENTS.md` was read and reviewed after creation.
- `package.json`, `pnpm-workspace.yaml`, and `.gitignore` were read and match the proposed initial content.
- The user ran `pnpm install` after each scaffold; the latest install completed for all three workspace projects. Slow registry requests and deprecated transitive dependencies were reported, with no install failure.
- The user ran `pnpm --filter mobile run web`; Expo bundled and the starter Home screen rendered at `localhost:8081`.
- The user ran `pnpm --filter mobile exec tsc --noEmit`; it completed with no diagnostics.
- The user ran the API in watch mode; TypeScript reported 0 errors, Nest started, and it mapped `GET /`. The later pnpm exit error followed the user's termination of watch mode.
- The user reran `pnpm --filter api run test:e2e` after the type-only edit to that test file; Vitest passed the generated `GET /` test, which asserts HTTP 200 and `Hello World!` (1 file, 1 test). Vitest printed a non-failing suggestion to replace `vite-tsconfig-paths` with its native tsconfig path resolution option.
- GitHub PR #1 merged into `main` at `c000c37`. After syncing, `git status --short --branch` showed `main...origin/main` with no local changes. No GitHub Actions workflow exists yet.
- The user ran `pnpm --filter api add class-validator class-transformer` on `feat/entry-create-validation`; it completed successfully, added 9 packages, and updated API dependencies and the workspace lockfile. pnpm reported two deprecated transitive dependencies and a peer-dependency warning, but no install failure. A follow-up `pnpm peers check` exited with code 1: `tsconfck@3.1.6` via `vite-tsconfig-paths` wants TypeScript `^5.0.0` but the workspace has `6.0.3`, and `@react-native/community-cli-plugin@0.86.3` wants `@react-native/metro-config@0.86.3` but `0.87.1` is installed. These are in the existing Vite and Expo/React Native toolchains, not the newly added validation packages.
- The new `CreateEntryDto` and `main.ts` pipe configuration were reviewed in the working tree. The user ran `pnpm --filter api exec tsc --noEmit` before the new spec was added; it returned to the prompt without diagnostics. A non-writing Prettier check passed for the new spec, and `git diff --check` found no whitespace errors in tracked changes. The later TypeScript rerun with the spec has no shared output.
- The user ran `pnpm --filter api exec vitest run src/entries/dto/create-entry.dto.spec.ts`; Vitest 4.1.11 passed 1 file and 6 tests: two accepted requests, blank content, impossible date, client-supplied `userId`, and null title. Vitest printed a non-failing suggestion to replace `vite-tsconfig-paths` with native tsconfig path resolution. No HTTP entry route was exercised.
- The user said "done" after the requested `pnpm --filter api exec tsc --noEmit` rerun with the new spec included. No command output or exit status was supplied for that rerun, so its result is not recorded as verified.
- The user ran `pnpm --filter api run lint` after adding the DTO spec; type-aware Oxlint reported 0 warnings and 0 errors across 10 files with 111 rules.
- The user ran `pnpm --filter api exec prettier --check "src/**/*.ts" "test/**/*.ts"` after adding the DTO spec; Prettier reported that all matched files use its code style. A read-only diff review found only the expected API dependency, pipe, DTO, spec, lockfile, and documentation changes; `git diff --check` found no whitespace errors in tracked changes.
- The user corrected the DTO's `EntryDateConstraint` spelling in both the class declaration and its `@Validate` reference. The agent inspected those references and ran `pnpm --filter api exec tsc --noEmit --incremental false` after the rename; it exited with code 0 and no diagnostics, without writing compiler output.
- The user staged the 10 intended files; `git diff --cached --check` exited without whitespace errors. Commit `7233999` contains those 10 files, and the push created `origin/feat/entry-create-validation` with upstream tracking. `git status --short --branch` showed a clean local branch tracking the remote immediately after the push.
- The user's screenshot and the public GitHub page confirmed [PR #2](https://github.com/kingsmark16/Tinta/pull/2) targeted `main` from `feat/entry-create-validation` with 10 changed files. The user reported completing the PR review step. A later read-only `gh pr view 2` reported `MERGEABLE`, no review decision, and an empty status-check list. A subsequent `gh pr view 2` confirmed `MERGED` at `88540c2`; the user fast-forwarded local `main` to `origin/main`, and `git status --short --branch` showed clean `main...origin/main`.
- The user created `ci/github-actions-checks` from synchronized `main`. The agent added `.github/workflows/ci.yml` with read-only token permissions, Node 24, pnpm 12.5.1, frozen-lockfile install, and existing API/mobile checks. A non-writing Prettier check parsed the YAML and passed; `git diff --check` found no whitespace errors in tracked documentation changes. The workflow has not run on GitHub.
- The user ran `pnpm --filter api run test` on the CI branch. Vitest passed 3 files and 18 tests, including all 11 date cases, 6 DTO cases, and the generated controller test. Its tsconfig paths plugin suggestion did not fail the run.
- The user ran `pnpm --filter api run test:e2e` on the CI branch. Vitest passed the generated starter `GET /` HTTP test (1 file, 1 test). Its tsconfig paths plugin suggestion did not fail the run; no entry route was exercised.
- The user ran `pnpm --filter api exec tsc --noEmit --incremental false` on the CI branch. It returned without TypeScript diagnostics or generated output.
- The user ran `pnpm --filter api run lint` on the CI branch. Type-aware Oxlint reported 0 warnings and 0 errors across 10 files with 111 rules.
- The user ran `pnpm --filter api exec prettier --check "src/**/*.ts" "test/**/*.ts"` on the CI branch. Prettier reported that all matched files use its code style.
- The user ran `pnpm --filter mobile exec tsc --noEmit` on the CI branch. It returned without TypeScript diagnostics; Android and iOS builds were not run.
- The user ran `pnpm install --frozen-lockfile` on the CI branch. pnpm 12.5.1 reported that the lockfile passed supply-chain policies, was up to date, skipped resolution, and finished successfully in 252 ms. `git status --short --branch` then showed only the expected workflow and documentation edits; the lockfile was unchanged.
- The user ran the focused `entryDate` Vitest file: 11 tests passed. The full API unit suite passed 2 files and 12 tests, including the generated controller test.
- The user ran `pnpm --filter api exec tsc --noEmit` after the generated HTTP test's type fix; it completed without diagnostics.
- The user ran `pnpm --filter api run lint`; Oxlint reported 0 warnings and 0 errors across 8 files. After setting Prettier's `endOfLine` to `auto` and formatting three files, the non-writing API TypeScript format check reported that all matched files use Prettier style.
- Android, iOS, a production API build, and Tinta-specific HTTP, authentication, and persistence behavior have not been verified.
