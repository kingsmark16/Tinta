import type { Server } from 'node:http';
import { clerkMiddleware } from '@clerk/express';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import {
  DEFAULT_EXPO_WEB_ORIGIN,
  getApiCorsOptions,
} from './../src/api-cors.js';

const expoWebOrigin = DEFAULT_EXPO_WEB_ORIGIN;

describe('API CORS (e2e)', () => {
  let app: INestApplication<Server>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors(getApiCorsOptions());
    app.use(clerkMiddleware());
    await app.init();
  });

  it('allows the Expo web origin to preflight a bearer-authenticated GET', async () => {
    const response = await request(app.getHttpServer())
      .options('/auth/me')
      .set('Origin', expoWebOrigin)
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'authorization')
      .expect(204);

    expect(response.headers['access-control-allow-origin']).toBe(expoWebOrigin);
    expect(response.headers['access-control-allow-methods']).toContain('GET');
    expect(response.headers['access-control-allow-headers']).toMatch(
      /authorization/i,
    );
  });

  it('does not grant CORS access to an unconfigured origin', async () => {
    const response = await request(app.getHttpServer())
      .options('/auth/me')
      .set('Origin', 'https://untrusted.example')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'authorization')
      .expect(204);

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('includes CORS headers on an authorized-origin API response', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Origin', expoWebOrigin)
      .expect(401);

    expect(response.headers['access-control-allow-origin']).toBe(expoWebOrigin);
  });

  afterEach(async () => {
    await app.close();
  });
});
