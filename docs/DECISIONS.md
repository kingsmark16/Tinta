# Decisions

This file records consequential technical choices and their tradeoffs. **Accepted** means chosen as project direction, not implemented or verified. Add new entries when a decision is made or revised; keep implementation details in [ARCHITECTURE.md](ARCHITECTURE.md).

## Decision: pnpm workspace

**Status:** Accepted. **Context:** Tinta has a mobile app and an API. **Decision:** Manage them in one pnpm workspace. **Reason:** One repository supports a coordinated development workflow. **Tradeoff:** Workspace setup adds some complexity. Shared packages should appear only after genuine reuse exists.

## Decision: React Native and Expo for mobile

**Status:** Accepted. **Context:** Tinta is a mobile diary. **Decision:** Use React Native, Expo, Expo Router, and TypeScript. **Reason:** This establishes a consistent mobile and navigation stack. **Tradeoff:** Native capabilities, build profiles, and offline behavior need separate design as those needs arise.

## Decision: NativeWind for mobile UI styling

**Status:** Accepted; the web bundle and visible utility-class rendering are verified, while native verification remains in progress. **Context:** Tinta's Expo app targets native platforms and web, and the user wants a consistent utility-based styling approach. **Decision:** Use NativeWind for app-owned UI styling across those targets. Prefer NativeWind classes for new and updated screens and components; use `StyleSheet` or platform-specific styling only when a native API or platform behavior requires it. **Reason:** A shared styling approach keeps the mobile UI implementation consistent across targets. **Tradeoff:** NativeWind needs Expo-compatible dependency and configuration setup, and platform-specific differences still need deliberate handling. NativeWind 4.2.7 and Tailwind CSS 3 are installed; the Tailwind config, global CSS directives, Expo and NativeWind Babel presets, Metro wrapper, Expo web bundler selection, and root CSS import are in place. After the first bundle failed to resolve `react-native-css-interop/jsx-runtime`, the user added `react-native-css-interop@0.2.7` directly. A retry successfully bundled and started Expo web. The user visually confirmed the Tailwind background, spacing, corner, and text utilities on a temporary Home screen panel and moved the panel outside `ThemedText`; the corrected web layout and native builds still need verification. The generated starter has not been migrated.

## Decision: diary-first MVP

**Status:** Accepted. **Context:** Tinta could expand into many adjacent features. **Decision:** Keep private writing, moods, memories, and calendar recall at the center; build the listed MVP before media, offline support, or optional AI reflection. **Reason:** The product should feel personal and calm rather than like a social network or generic dashboard. **Tradeoff:** Attractive later features are deferred until the core diary experience is reliable. See [PRODUCT.md](PRODUCT.md).

## Decision: Clerk for authentication

**Status:** Accepted. **Context:** Private diary data requires a reliable user identity. **Decision:** Clerk manages sign-in and sessions; the NestJS API verifies tokens and enforces authorization. **Reason:** Identity management and application ownership have distinct responsibilities. **Tradeoff:** Tinta depends on Clerk configuration and availability, and local user synchronization still needs a precise design.

## Decision: email and password authentication with verified sign-up

**Status:** Accepted; the mobile flow is implemented but live verification is pending. **Context:** The user wants password-based accounts, and the previous `signUpIfMissing` email-code flow could not set a password after transferring a verified identity into sign-up. **Decision:** Keep sign-in and sign-up as separate Clerk password flows. Verify a new account's email with a code, and support email-code MFA/device-trust challenges after sign-in when Clerk reports that factor as available. Keep both password options enabled in Clerk Dashboard. **Reason:** The user can choose and use a password at account creation without relying on unsupported transfer behavior. **Tradeoff:** Separate paths can expose account-existence differences during sign-up. Keep sign-in errors generic and configure Clerk's user-enumeration protections and rate limits before production. Password reset, other MFA methods, and production configuration are future work.

## Decision: use Clerk's Express SDK with NestJS

**Status:** Accepted and implemented for the current `GET /auth/me` slice. **Context:** The NestJS API uses its default Express adapter, and Clerk provides an Express SDK. **Decision:** Use `@clerk/express` `clerkMiddleware()` to verify incoming Clerk session tokens and attach auth state to the Express request. Protect NestJS controllers with a guard that uses Clerk's `getAuth()` and requires both `isAuthenticated` and a user ID. The auth controller returns only the verified caller's Clerk user ID. **Reason:** This uses Clerk's maintained Express integration instead of hand-parsing or decoding JWTs, and separates token verification from NestJS route authorization. **Tradeoff:** The auth boundary depends on Nest's Express adapter; changing to Fastify would require a different Clerk integration. The middleware alone does not protect routes, so protected controllers still need the guard. Clerk's `authorizedParties` allowlist must match the actual clients' origins when those are established. A valid real session and Expo client flow remain unverified.

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
