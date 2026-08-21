import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import argon2 from 'argon2';
import { AppModule } from '../../src/app.module.js';
import { DRIZZLE_DB, PG_POOL } from '../../src/infrastructure/database/database.provider.js';

describe('Auth Service Endpoints (Clean Architecture Integration)', () => {
  let app: INestApplication;
  const mockUsers: any[] = [];
  const mockCouriers: any[] = [];

  const mockPool = {
    end: async () => {},
    on: () => {},
  };

  const mockDb = {
    query: {
      users: {
        findFirst: async () => {
          return mockUsers.find((u) => u.id === 'usr_test123') || null;
        },
      },
      couriers: {
        findFirst: async () => mockCouriers[0] || null,
      },
    },
    update: (_table: any) => ({
      set: (val: any) => ({
        where: (_cond: any) => ({
          returning: async () => {
            if (mockCouriers[0]) {
              mockCouriers[0] = { ...mockCouriers[0], ...val };
              return [mockCouriers[0]];
            }
            return [];
          },
        }),
      }),
    }),
    insert: (_table: any) => ({
      values: (val: any) => ({
        returning: async () => {
          const item = { ...val, createdAt: new Date(), updatedAt: new Date() };
          mockUsers.push(item);
          return [item];
        },
      }),
    }),
    transaction: async (cb: any) => {
      const tx = {
        insert: (_table: any) => ({
          values: (val: any) => ({
            returning: async () => {
              const item = { ...val, createdAt: new Date(), updatedAt: new Date() };
              if (val.vehicleType !== undefined) {
                mockCouriers.push(item);
              } else {
                mockUsers.push(item);
              }
              return [item];
            },
          }),
        }),
      };
      return cb(tx);
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PG_POOL)
      .useValue(mockPool)
      .overrideProvider(DRIZZLE_DB)
      .useValue(mockDb)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('POST /auth/register should create a customer account', async () => {
    const payload = {
      email: 'customer@dashroute.com',
      password: 'Password123!',
      fullName: 'Customer Test',
    };

    const res = await request(app.getHttpServer()).post('/auth/register').send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user).toMatchObject({
      email: payload.email,
      fullName: payload.fullName,
      role: 'CUSTOMER',
    });
  });

  it('POST /auth/register/courier should create a courier account with vehicle profile', async () => {
    const payload = {
      email: 'courier@dashroute.com',
      password: 'Password123!',
      fullName: 'Courier Test',
      vehicleType: 'MOTORCYCLE',
      plateNumber: 'ABC-123',
    };

    const res = await request(app.getHttpServer()).post('/auth/register/courier').send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user).toMatchObject({
      email: payload.email,
      fullName: payload.fullName,
      role: 'COURIER',
      courierProfile: {
        vehicleType: 'MOTORCYCLE',
        plateNumber: 'ABC-123',
        isVerified: false,
      },
    });
  });

  it('POST /auth/register with invalid email format should fail with 400 Bad Request', async () => {
    const payload = {
      email: 'invalid-email',
      password: 'Password123!',
      fullName: 'Test User',
    };

    const res = await request(app.getHttpServer()).post('/auth/register').send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Validation failed');
    expect(res.body).toHaveProperty('errors');
  });

  it('POST /auth/register with short password should fail with 400 Bad Request', async () => {
    const payload = {
      email: 'valid@dashroute.com',
      password: 'short',
      fullName: 'Test User',
    };

    const res = await request(app.getHttpServer()).post('/auth/register').send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Validation failed');
  });

  it('POST /auth/login with valid credentials should return tokens and user payload', async () => {
    const passwordHash = await argon2.hash('Password123!');
    mockUsers[0] = {
      id: 'usr_test123',
      email: 'customer@dashroute.com',
      passwordHash,
      fullName: 'Customer Test',
      role: 'CUSTOMER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'customer@dashroute.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user).toMatchObject({
      id: 'usr_test123',
      email: 'customer@dashroute.com',
      role: 'CUSTOMER',
    });
  });

  it('POST /auth/login with wrong password should return 401 Unauthorized', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'customer@dashroute.com',
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'InvalidCredentialsException');
  });

  it('GET /auth/me without token should return 401 Unauthorized', async () => {
    const res = await request(app.getHttpServer()).get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /auth/me with valid Bearer token should return profile', async () => {
    const loginRes = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'customer@dashroute.com',
      password: 'Password123!',
    });

    const token = loginRes.body.accessToken;

    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 'usr_test123',
      email: 'customer@dashroute.com',
    });
  });

  it('POST /auth/logout with token should return 200 OK', async () => {
    const loginRes = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'customer@dashroute.com',
      password: 'Password123!',
    });

    const token = loginRes.body.accessToken;

    const res = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Successfully logged out' });
  });

  it('POST /auth/refresh should issue new access token given valid refresh token', async () => {
    const loginRes = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'customer@dashroute.com',
      password: 'Password123!',
    });

    const refreshToken = loginRes.body.refreshToken;

    const refreshRes = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body).toHaveProperty('accessToken');
    expect(refreshRes.body).toHaveProperty('refreshToken');
  });

  it('PATCH /auth/couriers/:id/verify should fail with 403 Forbidden for CUSTOMER role', async () => {
    const loginRes = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'customer@dashroute.com',
      password: 'Password123!',
    });

    const token = loginRes.body.accessToken;

    const res = await request(app.getHttpServer())
      .patch('/auth/couriers/cur_123/verify')
      .set('Authorization', `Bearer ${token}`)
      .send({ isVerified: true });

    expect(res.status).toBe(403);
  });
});
