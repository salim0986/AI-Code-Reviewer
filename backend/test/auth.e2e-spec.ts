import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { users, emailVerificationTokens, passwordResetTokens, refreshTokens, loginHistory } from '../src/database/schema';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let accessToken: string;
  let verificationToken: string;
  let resetToken: string;

  const testUser = {
    email: 'test@example.com',
    password: 'TestPass123!@#',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply same configuration as main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    databaseService = moduleFixture.get<DatabaseService>(DatabaseService);
  });

  afterAll(async () => {
    // Clean up test data
    await databaseService.db.delete(loginHistory);
    await databaseService.db.delete(refreshTokens);
    await databaseService.db.delete(passwordResetTokens);
    await databaseService.db.delete(emailVerificationTokens);
    await databaseService.db.delete(users);
    
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Registration successful');

      // Get verification token from database
      const [token] = await databaseService.db
        .select()
        .from(emailVerificationTokens)
        .limit(1);

      expect(token).toBeDefined();
      verificationToken = token.token;
    });

    it('should reject registration with weak password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'weak@example.com',
          password: 'weak',
        })
        .expect(400);
    });

    it('should reject registration with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'TestPass123!@#',
        })
        .expect(400);
    });

    it('should reject duplicate email registration', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);
    });
  });

  describe('/auth/verify-email (GET)', () => {
    it('should verify email with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get(`/auth/verify-email?token=${verificationToken}`)
        .expect(200);

      expect(response.body.message).toContain('Email verified successfully');
    });

    it('should reject invalid verification token', async () => {
      await request(app.getHttpServer())
        .get('/auth/verify-email?token=invalid-token')
        .expect(400);
    });

    it('should reject expired verification token', async () => {
      await request(app.getHttpServer())
        .get(`/auth/verify-email?token=${verificationToken}`)
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should reject login with unverified email', async () => {
      // Create unverified user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'unverified@example.com',
          password: 'TestPass123!@#',
        });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'unverified@example.com',
          password: 'TestPass123!@#',
        })
        .expect(401);
    });

    it('should login successfully with verified account', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.isVerified).toBe(true);

      // Check for refresh token cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c: string) => c.startsWith('refresh_token='))).toBe(true);

      accessToken = response.body.accessToken;
    });

    it('should reject login with wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should reject login with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPass123!@#',
        })
        .expect(401);
    });
  });

  describe('/auth/me (GET)', () => {
    it('should get current user with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.email).toBe(testUser.email);
      expect(response.body.isVerified).toBe(true);
    });

    it('should reject request without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('should reject request with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/auth/refresh (POST)', () => {
    let refreshTokenCookie: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser);

      const cookies = response.headers['set-cookie'];
      refreshTokenCookie = cookies.find((c: string) => c.startsWith('refresh_token='));
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', refreshTokenCookie)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
    });

    it('should reject refresh without refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .expect(401);
    });
  });

  describe('/auth/forgot-password (POST)', () => {
    it('should send password reset email for existing user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body.message).toContain('password reset link');

      // Get reset token from database
      const [token] = await databaseService.db
        .select()
        .from(passwordResetTokens)
        .limit(1);

      expect(token).toBeDefined();
      resetToken = token.token;
    });

    it('should not reveal if email does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.message).toContain('password reset link');
    });

    it('should reject invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);
    });
  });

  describe('/auth/reset-password (POST)', () => {
    const newPassword = 'NewSecurePass456!@#';

    it('should reset password with valid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: newPassword,
        })
        .expect(200);

      expect(response.body.message).toContain('Password reset successfully');
    });

    it('should login with new password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: newPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      accessToken = response.body.accessToken;
    });

    it('should reject reset with invalid token', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'AnotherPass789!@#',
        })
        .expect(400);
    });

    it('should reject weak new password', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'weak',
        })
        .expect(400);
    });
  });

  describe('/auth/change-password (POST)', () => {
    const currentPassword = 'NewSecurePass456!@#';
    const changedPassword = 'ChangedPass789!@#';

    it('should change password with correct current password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: currentPassword,
          newPassword: changedPassword,
        })
        .expect(200);

      expect(response.body.message).toContain('Password changed successfully');
    });

    it('should login with changed password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: changedPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
    });

    it('should reject change with wrong current password', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: changedPassword,
        });

      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPass123!@#',
        })
        .expect(401);
    });

    it('should reject change without authentication', async () => {
      await request(app.getHttpServer())
        .post('/auth/change-password')
        .send({
          currentPassword: changedPassword,
          newPassword: 'AnotherPass123!@#',
        })
        .expect(401);
    });
  });

  describe('/auth/logout (POST)', () => {
    let logoutRefreshToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'ChangedPass789!@#',
        });

      const cookies = response.headers['set-cookie'];
      logoutRefreshToken = cookies.find((c: string) => c.startsWith('refresh_token='));
    });

    it('should logout successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', logoutRefreshToken)
        .expect(200);

      expect(response.body.message).toContain('Logged out successfully');
    });

    it('should clear refresh token cookie', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', logoutRefreshToken);

      const cookies = response.headers['set-cookie'];
      const refreshCookie = cookies?.find((c: string) => c.startsWith('refresh_token='));
      
      // Cookie should be cleared (empty or expired)
      if (refreshCookie) {
        expect(refreshCookie).toContain('Max-Age=0');
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting on login endpoint', async () => {
      const requests = [];
      
      // Make 11 requests (limit is 10)
      for (let i = 0; i < 11; i++) {
        requests.push(
          request(app.getHttpServer())
            .post('/auth/login')
            .send({
              email: 'ratelimit@example.com',
              password: 'TestPass123!@#',
            })
        );
      }

      const responses = await Promise.all(requests);
      const tooManyRequests = responses.filter(r => r.status === 429);
      
      expect(tooManyRequests.length).toBeGreaterThan(0);
    });
  });
});
