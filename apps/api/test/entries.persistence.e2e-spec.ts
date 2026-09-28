import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { config as loadEnv } from 'dotenv';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { CreateEntryDto } from '../src/entries/dto/create-entry.dto.js';
import { EntriesService } from '../src/entries/entries.service.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

loadEnv({ path: fileURLToPath(new URL('../../.env.local', import.meta.url)) });

function isSafeTestDatabaseUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const databaseName = decodeURIComponent(url.pathname.slice(1));
    const isLoopback = ['localhost', '127.0.0.1', '[::1]'].includes(
      url.hostname,
    );
    const isDedicatedDatabase = ['tinta_test', 'tinta_ci'].includes(
      databaseName,
    );

    return isLoopback && isDedicatedDatabase;
  } catch {
    return false;
  }
}

const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
const explicitTestDatabaseUrl = process.env.DATABASE_URL_TEST;
const candidateDatabaseUrl =
  explicitTestDatabaseUrl ??
  (isGitHubActions ? process.env.DATABASE_URL : undefined);

if (
  (explicitTestDatabaseUrl || isGitHubActions) &&
  (!candidateDatabaseUrl || !isSafeTestDatabaseUrl(candidateDatabaseUrl))
) {
  throw new Error(
    'PostgreSQL integration tests require a loopback URL for tinta_test or tinta_ci.',
  );
}

const integrationDatabaseUrl = candidateDatabaseUrl;
const testRunId = randomUUID();
const primaryClerkUserId = `tinta_it_owner_${testRunId}`;
const otherClerkUserId = `tinta_it_other_${testRunId}`;
const clerkUserIds = [primaryClerkUserId, otherClerkUserId];

describe.skipIf(!integrationDatabaseUrl)(
  'EntriesService (PostgreSQL integration)',
  () => {
    let moduleFixture: TestingModule | undefined;
    let prisma: PrismaService | undefined;
    let entriesService: EntriesService | undefined;
    let connected = false;

    beforeAll(async () => {
      const databaseUrl = integrationDatabaseUrl!;
      prisma = new PrismaService(
        new ConfigService({ DATABASE_URL: databaseUrl }),
      );

      moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(PrismaService)
        .useValue(prisma)
        .compile();

      await prisma.$connect();
      connected = true;
      entriesService = moduleFixture.get(EntriesService);
    }, 15_000);

    afterAll(async () => {
      if (!prisma) {
        return;
      }

      try {
        if (connected) {
          const owners = await prisma.user.findMany({
            where: { clerkUserId: { in: clerkUserIds } },
            select: { id: true },
          });
          const ownerIds = owners.map((owner) => owner.id);

          if (ownerIds.length > 0) {
            await prisma.$transaction([
              prisma.diaryEntry.deleteMany({
                where: { userId: { in: ownerIds } },
              }),
              prisma.user.deleteMany({ where: { id: { in: ownerIds } } }),
            ]);
          }
        }
      } finally {
        try {
          await moduleFixture?.close();
        } finally {
          await prisma.$disconnect();
        }
      }
    }, 15_000);

    it('persists diary dates and links each entry to the matching Clerk owner', async () => {
      const service = entriesService;
      if (!service || !prisma) {
        throw new Error('The PostgreSQL test module was not initialized.');
      }

      const firstEntry = await service.create(
        primaryClerkUserId,
        Object.assign(new CreateEntryDto(), {
          title: 'Synthetic first title',
          content: 'Synthetic first entry content.',
          entryDate: '2024-02-29',
        }),
      );
      const secondEntry = await service.create(
        primaryClerkUserId,
        Object.assign(new CreateEntryDto(), {
          title: 'Synthetic second title',
          content: 'Synthetic second entry content.',
          entryDate: '2024-02-29',
        }),
      );
      const otherOwnerEntry = await service.create(
        otherClerkUserId,
        Object.assign(new CreateEntryDto(), {
          content: 'Synthetic entry for another owner.',
          entryDate: '2024-03-01',
        }),
      );

      expect(firstEntry.entryDate).toBe('2024-02-29');
      expect(secondEntry.entryDate).toBe('2024-02-29');
      expect(otherOwnerEntry.entryDate).toBe('2024-03-01');

      const persistedEntries = await prisma.diaryEntry.findMany({
        where: {
          id: {
            in: [firstEntry.id, secondEntry.id, otherOwnerEntry.id],
          },
        },
        select: {
          id: true,
          userId: true,
          title: true,
          content: true,
          entryDate: true,
          user: { select: { clerkUserId: true } },
        },
      });
      const entriesById = new Map(
        persistedEntries.map((entry) => [entry.id, entry]),
      );
      const persistedFirst = entriesById.get(firstEntry.id);
      const persistedSecond = entriesById.get(secondEntry.id);
      const persistedOtherOwner = entriesById.get(otherOwnerEntry.id);

      expect(persistedEntries).toHaveLength(3);
      expect(persistedFirst).toMatchObject({
        title: 'Synthetic first title',
        content: 'Synthetic first entry content.',
        entryDate: new Date('2024-02-29T00:00:00.000Z'),
        user: { clerkUserId: primaryClerkUserId },
      });
      expect(persistedSecond).toMatchObject({
        title: 'Synthetic second title',
        content: 'Synthetic second entry content.',
        entryDate: new Date('2024-02-29T00:00:00.000Z'),
        user: { clerkUserId: primaryClerkUserId },
      });
      expect(persistedOtherOwner).toMatchObject({
        title: null,
        content: 'Synthetic entry for another owner.',
        entryDate: new Date('2024-03-01T00:00:00.000Z'),
        user: { clerkUserId: otherClerkUserId },
      });
      expect(persistedFirst?.userId).toBe(persistedSecond?.userId);
      expect(persistedOtherOwner?.userId).not.toBe(persistedFirst?.userId);
    }, 15_000);
  },
);
