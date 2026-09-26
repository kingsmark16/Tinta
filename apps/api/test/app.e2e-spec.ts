import type { Server } from 'node:http';
import { clerkMiddleware } from '@clerk/express';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<Server>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(clerkMiddleware());
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/auth/me rejects requests without a session (GET)', () => {
    return request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('/auth/me rejects an invalid bearer token (GET)', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer not-a-valid-clerk-token')
      .expect(401);
  });

  afterEach(async () => {
    await app.close();
  });
});
