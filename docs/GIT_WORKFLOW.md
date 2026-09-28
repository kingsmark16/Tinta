# Git, Commits, Pushes, and CI

**Status:** PR #3 introduced GitHub Actions CI, and PR #4 merged Clerk API/mobile authentication into main at c50deb0. The final PR run and post-merge main run passed. The API HTTP test step uses the repository Actions secrets CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY; their values are kept out of source control. Branch protection settings have not been checked.

## Ownership and branch strategy

The user normally stages files, commits, pushes, and configures CI. The agent reviews changes, explains commands, and suggests commit messages. It does not run Git write commands merely because a push is discussed; a direct request to perform the specific action is required. Do not commit or push automatically.

Keep `main` as the stable branch. Use short-lived branches when a change benefits from review, such as `feat/auth`, `feat/entries`, `feat/calendar`, or `fix/date-handling`. Prefer focused commits with descriptive messages, for example `feat(entries): add entry creation`, `fix(auth): enforce Clerk ownership`, or `test(entries): cover cross-user access`.

## Review, commit, and push a checkpoint

The commands below are for the user to run in PowerShell from the repository root, `C:\Users\marka\Desktop\Tinta`, after reviewing the work. They document the initial scaffold checkpoint on `main`; use the actual branch name for a later feature branch.

| Command | Purpose and why | What it changes | Expected output and verification |
| --- | --- | --- | --- |
| `git status --short --branch` | Shows the branch, upstream, and pending files before staging. Check that every file belongs in the checkpoint. | Nothing. | A `main...origin/main` header and file status lines; inspect unexpected files before proceeding. |
| `git add -- .gitignore AGENTS.md README.md docs package.json pnpm-workspace.yaml pnpm-lock.yaml apps/api apps/mobile` | Stages the reviewed scaffold and documentation paths for the baseline commit. | The local Git index only; it does not create a commit or push. | Usually no output. Run the next two commands to verify what was staged. |
| `git diff --cached --check` | Checks staged changes for whitespace errors before committing. | Nothing. | No output and exit code 0 when the check passes; fix any reported lines before committing. |
| `git diff --cached --stat` | Summarizes staged files and sizes. | Nothing. | A file list and change counts. Review the full staged diff in the IDE, especially source, configuration, and docs; confirm no secrets, environment files, generated outputs, or unrelated changes. |
| `git commit -m "chore: scaffold Tinta workspace"` | Records this reviewed baseline as one focused local commit. | Local Git history and index. | A new commit hash and file summary; verify with `git status --short --branch`. |
| `git push origin main` | Sends the local `main` commit to GitHub. | The remote branch; future CI may run on the push. | A successful remote update. Verify the commit on GitHub and check that local status no longer reports unpushed commits. |

Git ignores dependency folders, build output, logs, and local environment files, but inspect the staged file list and diff anyway. Commit the lockfile with dependency changes. Pushing requires GitHub access and network connectivity; Git may prompt for authentication. If the remote rejects a push because it has new commits, inspect the divergence and integrate safely; never use a force push as the routine fix. A feature branch can be pushed and reviewed in a pull request before merging to `main`.

## CI and future checks

The API HTTP test step receives CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY from repository Actions secrets. Their values are scoped to that step and must stay private and out of Git. PR #4 and its post-merge main CI run passed after these secrets were configured.

The first workflow in `.github/workflows/ci.yml` was merged in PR #3. It runs on pull requests to `main` and pushes to `main`. It installs from the frozen lockfile and checks API TypeScript, Oxlint, Prettier, Vitest unit tests, API HTTP tests, and mobile TypeScript. Its first run caught missing declarations for CSS imports; commit `515bb1c` fixed them and disabled incremental state for mobile TypeScript. The final PR run and the post-merge `main` run passed. PR #5 extended the workflow with a PostgreSQL 18.6 `tinta_ci` service, Prisma validation/client generation, and migration deployment before API checks. Its e2e step includes the PostgreSQL persistence integration test. Local unit tests (37), e2e tests (9), TypeScript, Oxlint, and Prettier passed; PR #5 merged into `main` and its GitHub Actions check passed. Future CI expansion can cover the backend build, broader mobile checks, and any additional Prisma validation that is not already run.

The original project brief named Jest and ESLint. The user later chose **Vitest**, which is configured in the API scaffold. The CI workflow uses the generated API's existing Oxlint command; resolve the ESLint versus Oxlint direction before treating that choice as permanent. A non-writing API Prettier command has also passed locally and is included in the workflow, though it is not a package script. See [DECISIONS.md](DECISIONS.md) and [DEVELOPMENT.md](DEVELOPMENT.md).

CI should report failures without printing tokens, diary content, or database credentials. Protect `main` with required checks and review rules when those checks are trustworthy. A green CI run does not replace manual checks for mobile behavior, privacy, and release readiness. Deployment remains a separate, controlled workflow described in [DEPLOYMENT.md](DEPLOYMENT.md).
