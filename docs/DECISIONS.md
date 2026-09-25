# Decisions

This file records consequential technical choices and their tradeoffs. **Accepted** means chosen as project direction, not implemented or verified. Add new entries when a decision is made or revised; keep implementation details in [ARCHITECTURE.md](ARCHITECTURE.md).

## Decision: pnpm workspace

**Status:** Accepted. **Context:** Tinta has a mobile app and an API. **Decision:** Manage them in one pnpm workspace. **Reason:** One repository supports a coordinated development workflow. **Tradeoff:** Workspace setup adds some complexity. Shared packages should appear only after genuine reuse exists.

## Decision: React Native and Expo for mobile

**Status:** Accepted. **Context:** Tinta is a mobile diary. **Decision:** Use React Native, Expo, Expo Router, and TypeScript. **Reason:** This establishes a consistent mobile and navigation stack. **Tradeoff:** Native capabilities, build profiles, and offline behavior need separate design as those needs arise.

## Decision: diary-first MVP

**Status:** Accepted. **Context:** Tinta could expand into many adjacent features. **Decision:** Keep private writing, moods, memories, and calendar recall at the center; build the listed MVP before media, offline support, or optional AI reflection. **Reason:** The product should feel personal and calm rather than like a social network or generic dashboard. **Tradeoff:** Attractive later features are deferred until the core diary experience is reliable. See [PRODUCT.md](PRODUCT.md).

## Decision: Clerk for authentication

**Status:** Accepted. **Context:** Private diary data requires a reliable user identity. **Decision:** Clerk manages sign-in and sessions; the NestJS API verifies tokens and enforces authorization. **Reason:** Identity management and application ownership have distinct responsibilities. **Tradeoff:** Tinta depends on Clerk configuration and availability, and local user synchronization still needs a precise design.

## Decision: NestJS REST API

**Status:** Accepted. **Context:** Mobile clients need a protected interface to diary data. **Decision:** Use a TypeScript NestJS REST API. **Reason:** It provides a clear place for DTO validation, authorization, and application rules. **Tradeoff:** Request and response contracts must be maintained as both apps evolve.

## Decision: ESM and Vitest for the API

**Status:** Accepted. **Context:** The original brief named Jest, but the user later chose the ESM option when scaffolding the NestJS API and explicitly preferred Vitest. **Decision:** Use ES modules and Vitest for API tests; this supersedes the earlier Jest plan. **Reason:** It matches the user's current choice and the test runner already verified with its generated HTTP test. **Tradeoff:** Imports and test configuration need to remain compatible with ESM as the API grows.

## Decision: PostgreSQL and Prisma

**Status:** Accepted. **Context:** Users, entries, and tags have relationships and ownership constraints. **Decision:** Persist them in PostgreSQL through Prisma. **Reason:** A relational schema and migration history fit those requirements. **Tradeoff:** Migrations need review and a safe deployment process once real data exists.

## Decision: diary day as a date-only value

**Status:** Accepted. **Context:** A diary entry belongs to the day the user intends, which can differ from the moment it was created. **Decision:** Represent `entryDate` at the API boundary as `YYYY-MM-DD`, preserve that calendar day across time zones, and allow multiple entries on one day. Keep `createdAt` and `updatedAt` as separate timestamps. **Reason:** Calendar navigation should not move an entry to another day when the user changes time zones. **Tradeoff:** The API must validate real calendar dates, and database clients need an explicit conversion that preserves the date.

## Decision: store diary days as PostgreSQL `date`

**Status:** Accepted. **Context:** `entryDate` is a calendar day, not an instant. **Decision:** Store it in PostgreSQL's native `date` column and keep the HTTP representation as the validated `YYYY-MM-DD` string. With the conventional Prisma ORM v7 schema, use `DateTime @db.Date` for the column; isolate conversion in one persistence mapper. Convert the validated string to UTC midnight for persistence and serialize the returned value with its UTC date (`toISOString().slice(0, 10)`). Do not use local-time date getters. Keep `createdAt` and `updatedAt` as timestamps. **Reason:** PostgreSQL `date` stores a date without a time of day, while a timestamp would model the wrong concept and invite time-zone shifts. **Tradeoff:** Prisma ORM v7 represents `DateTime` values as JavaScript `Date` objects, so persistence conversion needs explicit round-trip tests across time zones. Verify the exact generated type when selecting and installing the Prisma version. See [PostgreSQL date/time types](https://www.postgresql.org/docs/18/datatype-datetime.html) and [Prisma ORM v7 type mappings](https://www.prisma.io/docs/orm/v7/prisma-client/type-safety/prisma-type-system).

## Decision: validate API request DTOs with NestJS `ValidationPipe`

**Status:** Accepted. **Context:** The first write endpoint needs runtime validation for untrusted JSON while preserving diary text exactly as submitted. **Decision:** Use class-based DTOs with NestJS `ValidationPipe` and `class-validator`; enable `whitelist` and `forbidNonWhitelisted` so unknown fields such as `userId` are rejected. Keep transformation disabled unless a specific DTO field needs it, and validate that content is a string containing non-whitespace without trimming or rewriting the stored value. Reuse `isValidEntryDate` through a custom validator instead of implementing date rules twice. **Reason:** This matches NestJS's built-in DTO validation approach and makes accepted body fields explicit. **Tradeoff:** It adds `class-validator` and `class-transformer` dependencies and uses decorators; ensure validation responses do not echo diary content. See [NestJS validation](https://docs.nestjs.com/techniques/validation).

## Decision: TanStack Query for server state

**Status:** Accepted. **Context:** Mobile screens will fetch and update API data. **Decision:** Use TanStack Query for server state; use Zustand only for genuine shared client state. **Reason:** One cache owner makes loading, errors, and invalidation easier to reason about. **Tradeoff:** Query keys and mutation invalidation must be designed consistently.

## Decision: local checks before CI

**Status:** Accepted. **Context:** The original brief calls for GitHub CI, but several quality commands are not configured or verified yet. **Decision:** Add CI checks after their matching local commands work, then use those checks to review changes before merging. **Reason:** A pipeline should report meaningful failures and match the developer's local workflow. **Tradeoff:** CI coverage grows in stages. The original lint direction is ESLint and Prettier; the generated API currently uses Oxlint, so that tooling difference must be resolved before a lint gate is treated as settled. See [GIT_WORKFLOW.md](GIT_WORKFLOW.md).
