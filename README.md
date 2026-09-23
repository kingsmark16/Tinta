# Tinta

**Your days, remembered.**

Tinta is a private digital diary for writing daily thoughts, tracking moods, saving meaningful memories, and revisiting special moments. The diary and personal writing experience are the center of the product.

## Project status

The pnpm workspace, Expo mobile starter, and NestJS API starter are scaffolded. Dependencies are installed, and the starter web app and API baseline have been verified. Tinta features, authentication, and persistence are not implemented yet. See [project status](docs/PROJECT_STATUS.md) for the current goal and verified checks.

## Technology and planned integrations

- Mobile scaffold: React Native, Expo, Expo Router, and TypeScript. Clerk and TanStack Query are planned.
- API scaffold: NestJS, TypeScript, ESM, and Vitest. Clerk token verification, Prisma, and PostgreSQL are planned.
- Workspace: pnpm workspaces are configured. Docker Compose remains a possible local database setup.

The scaffolded applications are still generated starters; the planned integrations are not configured.

## Repository guide

- [Agent working agreement](AGENTS.md)
- [Product direction and MVP](docs/PRODUCT.md)
- [Learning workflow](docs/LEARNING_WORKFLOW.md)
- [Architecture](docs/ARCHITECTURE.md) and [decisions](docs/DECISIONS.md)
- [Local development](docs/DEVELOPMENT.md) and [testing](docs/TESTING.md)
- [Git, commits, pushes, and CI](docs/GIT_WORKFLOW.md)
- [Deployment](docs/DEPLOYMENT.md) and [security](docs/SECURITY.md)

Tinta is a learning-first project. The user implements and runs the project; the AI agent mentors, explains, and reviews unless explicitly asked to make a specific change.
