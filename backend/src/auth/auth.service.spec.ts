import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseService } from '../database/database.service';
import { EmailService } from '../email/email.service';
import { SessionsService } from '../sessions/sessions.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
jest.mock('uuid', () => ({ v4: () => 'test-uuid-1234' }));

describe('AuthService', () => {
  let service: AuthService;
  let databaseService: DatabaseService;
  let jwtService: JwtService;
  let emailService: EmailService;
  let sessionsService: SessionsService;

  const mockDatabaseService = {
    db: {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockEmailService = {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    sendLoginNotification: jest.fn(),
    sendPasswordChangedEmail: jest.fn(),
  };

  const mockSessionsService = {
    trackLogin: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        JWT_ACCESS_SECRET: 'test-access-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_ACCESS_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: SessionsService, useValue: mockSessionsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);
    sessionsService = module.get<SessionsService>(SessionsService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'TestPass123!@#',
    };

    it('should register a new user successfully', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockFrom = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue([]);

      mockDatabaseService.db.select = mockSelect;
      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      const mockInsert = jest.fn().mockReturnThis();
      const mockValues = jest.fn().mockReturnThis();
      const mockReturning = jest.fn().mockResolvedValue([
        { id: 'user-id', email: registerDto.email, isVerified: false },
      ]);

      mockDatabaseService.db.insert = mockInsert;
      mockInsert.mockReturnValue({ values: mockValues });
      mockValues.mockReturnValue({ returning: mockReturning });

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('Registration successful');
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
      expect(emailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockFrom = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue([{ id: 'existing-user' }]);

      mockDatabaseService.db.select = mockSelect;
      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'TestPass123!@#',
    };

    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      password: 'hashed-password',
      isVerified: true,
    };

    it('should login successfully with correct credentials', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockFrom = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue([mockUser]);

      mockDatabaseService.db.select = mockSelect;
      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const mockUpdate = jest.fn().mockReturnThis();
      const mockSet = jest.fn().mockReturnThis();
      const mockUpdateWhere = jest.fn().mockResolvedValue({});

      mockDatabaseService.db.update = mockUpdate;
      mockUpdate.mockReturnValue({ set: mockSet });
      mockSet.mockReturnValue({ where: mockUpdateWhere });

      const mockInsert = jest.fn().mockReturnThis();
      const mockValues = jest.fn().mockResolvedValue({});

      mockDatabaseService.db.insert = mockInsert;
      mockInsert.mockReturnValue({ values: mockValues });

      const result = await service.login(loginDto, '127.0.0.1', 'test-agent');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(sessionsService.trackLogin).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException with wrong password', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockFrom = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue([mockUser]);

      mockDatabaseService.db.select = mockSelect;
      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto, '127.0.0.1', 'test-agent')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if email is not verified', async () => {
      const unverifiedUser = { ...mockUser, isVerified: false };

      const mockSelect = jest.fn().mockReturnThis();
      const mockFrom = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue([unverifiedUser]);

      mockDatabaseService.db.select = mockSelect;
      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto, '127.0.0.1', 'test-agent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const mockToken = {
        id: 'token-id',
        userId: 'user-id',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockFrom = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue([mockToken]);

      mockDatabaseService.db.select = mockSelect;
      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      const mockUpdate = jest.fn().mockReturnThis();
      const mockSet = jest.fn().mockReturnThis();
      const mockUpdateWhere = jest.fn().mockResolvedValue({});

      mockDatabaseService.db.update = mockUpdate;
      mockUpdate.mockReturnValue({ set: mockSet });
      mockSet.mockReturnValue({ where: mockUpdateWhere });

      const mockDelete = jest.fn().mockReturnThis();
      const mockDeleteWhere = jest.fn().mockResolvedValue({});

      mockDatabaseService.db.delete = mockDelete;
      mockDelete.mockReturnValue({ where: mockDeleteWhere });

      const result = await service.verifyEmail('valid-token');

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('Email verified successfully');
    });

    it('should throw BadRequestException with invalid token', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockFrom = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue([]);

      mockDatabaseService.db.select = mockSelect;
      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should create reset token for existing user', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockFrom = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue([mockUser]);

      mockDatabaseService.db.select = mockSelect;
      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      const mockDelete = jest.fn().mockReturnThis();
      const mockDeleteWhere = jest.fn().mockResolvedValue({});

      mockDatabaseService.db.delete = mockDelete;
      mockDelete.mockReturnValue({ where: mockDeleteWhere });

      const mockInsert = jest.fn().mockReturnThis();
      const mockValues = jest.fn().mockResolvedValue({});

      mockDatabaseService.db.insert = mockInsert;
      mockInsert.mockReturnValue({ values: mockValues });

      const result = await service.forgotPassword({ email: mockUser.email });

      expect(result).toHaveProperty('message');
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should not reveal if user does not exist', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockFrom = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue([]);

      mockDatabaseService.db.select = mockSelect;
      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      const result = await service.forgotPassword({ email: 'nonexistent@example.com' });

      expect(result).toHaveProperty('message');
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const mockToken = {
        id: 'token-id',
        userId: 'user-id',
        token: 'valid-reset-token',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      };

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockFrom = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockReturnThis();
      const mockLimit = jest.fn()
        .mockResolvedValueOnce([mockToken])
        .mockResolvedValueOnce([mockUser]);

      mockDatabaseService.db.select = mockSelect;
      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');

      const mockUpdate = jest.fn().mockReturnThis();
      const mockSet = jest.fn().mockReturnThis();
      const mockUpdateWhere = jest.fn().mockResolvedValue({});

      mockDatabaseService.db.update = mockUpdate;
      mockUpdate.mockReturnValue({ set: mockSet });
      mockSet.mockReturnValue({ where: mockUpdateWhere });

      const mockDelete = jest.fn().mockReturnThis();
      const mockDeleteWhere = jest.fn().mockResolvedValue({});

      mockDatabaseService.db.delete = mockDelete;
      mockDelete.mockReturnValue({ where: mockDeleteWhere });

      const result = await service.resetPassword({
        token: 'valid-reset-token',
        newPassword: 'NewPass123!@#',
      });

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('Password reset successfully');
      expect(emailService.sendPasswordChangedEmail).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should change password with correct current password', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'current-hashed-password',
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockFrom = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue([mockUser]);

      mockDatabaseService.db.select = mockSelect;
      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true) // Current password check
        .mockResolvedValueOnce(false); // New password different check

      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');

      const mockUpdate = jest.fn().mockReturnThis();
      const mockSet = jest.fn().mockReturnThis();
      const mockUpdateWhere = jest.fn().mockResolvedValue({});

      mockDatabaseService.db.update = mockUpdate;
      mockUpdate.mockReturnValue({ set: mockSet });
      mockSet.mockReturnValue({ where: mockUpdateWhere });

      const mockDelete = jest.fn().mockReturnThis();
      const mockDeleteWhere = jest.fn().mockResolvedValue({});

      mockDatabaseService.db.delete = mockDelete;
      mockDelete.mockReturnValue({ where: mockDeleteWhere });

      const result = await service.changePassword('user-id', {
        currentPassword: 'OldPass123!@#',
        newPassword: 'NewPass123!@#',
      });

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('Password changed successfully');
      expect(emailService.sendPasswordChangedEmail).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException with wrong current password', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'current-hashed-password',
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockFrom = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue([mockUser]);

      mockDatabaseService.db.select = mockSelect;
      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword('user-id', {
          currentPassword: 'WrongPass123!@#',
          newPassword: 'NewPass123!@#',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
