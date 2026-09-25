# Architecture

**Status:** The Expo and NestJS starters are scaffolded. The standalone date validator, create-entry DTO, and global validation pipe configuration are present. Entry routes, authentication, and persistence are not implemented. Update this document as running behavior establishes the contracts and boundaries.

## System and repository

```text
React Native app (Expo, Expo Router)
  → Clerk session and token
  → shared API client and TanStack Query
  → NestJS REST API
  → verified identity, validation, and ownership checks
  → Prisma → PostgreSQL
```

The pnpm workspace contains `apps/mobile` and `apps/api`, with repository guidance in `docs`. Both starters use TypeScript. Add shared packages such as `packages/types` or `packages/config` only when real reuse exists. GitHub Actions checks live under `.github/workflows`; the initial CI workflow checks API quality and tests plus mobile TypeScript.

## Mobile responsibilities

Expo Router owns navigation. The current scaffold uses `apps/mobile/src/app`. Planned routes include sign-in and sign-up, a tab layout for home, calendar, writing, memories, and profile, plus entry detail and edit screens. Route files should stay focused on screens; feature components and hooks handle presentation and behavior. A feature hook calls an API function, which uses a shared API client to set the base URL, attach a Clerk token in the authorization header, and normalize errors. TanStack Query owns remote server state, query keys, mutations, and cache invalidation; use optimistic updates only when their failure behavior is clear. React Hook Form and Zod are available when they simplify forms and validation. Zustand is reserved for genuine shared client state, such as an unsaved draft, and must not duplicate the server cache.

## API responsibilities

Keep each module, controller, and service focused on one responsibility.

NestJS is planned with feature modules for authentication, users, entries, tags, Prisma, and health, plus common cross-cutting code. Dependency injection keeps responsibilities clear. Controllers receive HTTP input through explicit validated DTOs, obtain the authenticated identity, delegate to services, and return responses. Candidate DTOs include `CreateEntryDto`, `UpdateEntryDto`, `EntryQueryDto`, `CalendarQueryDto`, and `CreateTagDto`. Services apply application rules and ownership-aware data access through one `PrismaService`; do not instantiate Prisma clients throughout feature modules. Controllers must not query Prisma directly, repeat token parsing, contain business rules, or accept Prisma input types as public request contracts. Avoid repository wrappers that add no value.

The initial REST entry contract is planned around `POST /entries`, `GET /entries`, `GET /entries/:id`, `PATCH /entries/:id`, `DELETE /entries/:id`, `GET /entries/date/:date`, and `GET /entries/calendar`. `GET /entries` will eventually accept validated `page`, `limit`, `search`, `mood`, `favorite`, `tag`, `dateFrom`, `dateTo`, `sortBy`, and `sortOrder` parameters. Document implemented contracts with Swagger/OpenAPI when the routes exist; no OpenAPI setup is configured yet.

The agreed first create-entry slice uses a protected `POST /entries`. The request has required nonblank `content`, a required real calendar date in `YYYY-MM-DD` form as `entryDate`, and an optional `title`; it does not accept `userId`. Validate class-based DTOs with NestJS `ValidationPipe` and `class-validator`. Configure `whitelist` and `forbidNonWhitelisted` so unexpected properties, including `userId`, are rejected. Keep transformation disabled unless a specific field needs it; check that `content` contains non-whitespace without silently changing the value that gets stored. Reuse the standalone `isValidEntryDate` helper through a custom DTO validator. The API derives ownership from verified identity. A successful response is HTTP 201 with an opaque `id`, saved `content`, `title` or `null`, unchanged `entryDate`, and `createdAt` and `updatedAt` timestamps. Invalid input is rejected with HTTP 400, and missing or invalid authentication with HTTP 401. The DTO and global pipe configuration are now present, but no entry route binds the DTO, and the HTTP contract remains planned. See [NestJS validation](https://docs.nestjs.com/techniques/validation).

## Authentication and authorization

Clerk owns sign-up, sign-in, sign-out, email verification, sessions, and tokens; OAuth can be added later if needed. The mobile client sends a token to the API. The API verifies it, derives the Clerk identity, finds or synchronizes a local user, and uses that user for authorization. The synchronization trigger and identifier mapping remain open design decisions. NestJS will not duplicate Clerk's login endpoints.

Every entry and tag belongs to a user. The API must scope reads, lists, updates, deletes, search, and calendar results to the authenticated owner and prevent cross-user tag attachment. A client-provided `userId` never establishes ownership.

## Data model and dates

The planned local `User` has `id`, a unique Clerk ID, optional application-specific `displayName`, `createdAt`, and `updatedAt`. Clerk owns identity while Tinta owns application data and relationships. `DiaryEntry` has `id`, `userId`, `title`, `content`, `entryDate`, `mood`, `isFavorite`, `isPrivate`, `createdAt`, and `updatedAt`. Planned moods are `HAPPY`, `EXCITED`, `CALM`, `NEUTRAL`, `SAD`, `STRESSED`, `ANGRY`, and `TIRED`. `Tag` has `id`, `userId`, `name`, `createdAt`, and `updatedAt`; an entry-tag relation connects `entryId` and `tagId`. The API must prevent a user's entry from attaching another user's tag.

`entryDate` is the user's intended calendar day, represented at the API boundary as `YYYY-MM-DD`. The mobile app defaults to the user's local today but sends the selected day explicitly; changing time zones must not move an entry to another diary day. Multiple entries may share a day, so `(userId, entryDate)` must not be unique. `createdAt` and `updatedAt` are event timestamps. Store `entryDate` as PostgreSQL's native `date`, not a timestamp. For the conventional Prisma ORM v7 schema, map it with `DateTime @db.Date`; keep conversion in one persistence mapper, using UTC when converting to and from the API string. Do not use local-time date getters. When Prisma is installed, verify its generated type and test a database round trip across time zones. See [PostgreSQL date/time types](https://www.postgresql.org/docs/18/datatype-datetime.html) and [Prisma ORM v7 type mappings](https://www.prisma.io/docs/orm/v7/prisma-client/type-safety/prisma-type-system). The meaning of `isPrivate` is also open; it does not authorize sharing by itself.

Before each schema migration, consider existing data, nullability, foreign keys, unique constraints, cascades, indexes, backfills, and compatibility with deployed code. Add indexes for observed query patterns; `(userId, entryDate)` is a possible non-unique index for owner-scoped calendar queries, not a schema change already made.

## Boundaries to preserve

The mobile app presents and requests data; the API validates and authorizes it; PostgreSQL persists it. Keep names clear and components, controllers, and services small enough to have one understandable responsibility. Do not scatter API calls through screens, duplicate TanStack Query data in Zustand, put business rules in controllers, or add microservices, Redis, queues, or event infrastructure without a concrete requirement.

Record resolved choices in [DECISIONS.md](DECISIONS.md) and implementation progress in [PROJECT_STATUS.md](PROJECT_STATUS.md).
