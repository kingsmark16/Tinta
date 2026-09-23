# Git, Commits, Pushes, and CI

**Status:** Git and GitHub are used for the repository. No CI workflow is configured yet. See [PROJECT_STATUS.md](PROJECT_STATUS.md) for the current branch and checkpoint state.

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

## Planned CI

Add GitHub Actions only after each equivalent local command is established and passes. Prefer checks on pull requests to `main` and relevant pushes. Once implemented, the CI pipeline should cover a frozen lockfile install, lint, a non-writing Prettier format check, TypeScript checks, Vitest unit tests, API HTTP tests, database integration tests against an isolated test database, backend build, mobile static checks, and Prisma schema validation. Add test database setup and migrations when Prisma exists; use synthetic data and environment-specific credentials.

The original project brief named Jest and ESLint. The user later chose **Vitest**, which is configured in the API scaffold. ESLint remains the intended lint direction, while the generated API currently uses Oxlint; its local lint command has passed, but resolve the tooling difference before settling the CI lint gate. A non-writing API Prettier command has also passed locally, though it is not yet a package script or CI check. See [DECISIONS.md](DECISIONS.md) and [DEVELOPMENT.md](DEVELOPMENT.md).

CI should report failures without printing tokens, diary content, or database credentials. Protect `main` with required checks and review rules when those checks are trustworthy. A green CI run does not replace manual checks for mobile behavior, privacy, and release readiness. Deployment remains a separate, controlled workflow described in [DEPLOYMENT.md](DEPLOYMENT.md).
