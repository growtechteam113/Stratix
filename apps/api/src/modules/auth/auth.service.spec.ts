import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'test-token'),
          },
        },
        {
          provide: PrismaClient,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            workspace: {
              create: jest.fn(),
            },
            workspaceUser: {
              findMany: jest.fn(),
              create: jest.fn(),
            },
            session: {
              create: jest.fn(),
              deleteMany: jest.fn(),
              findUnique: jest.fn(),
            },
            loginEvent: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should create a new user and workspace', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed',
        globalRole: 'USER',
      };

      const mockWorkspace = {
        id: 'workspace-1',
        name: "Test User's Workspace",
        slug: 'workspace-abc123',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser as any);
      jest.spyOn(prisma.workspace, 'create').mockResolvedValue(mockWorkspace as any);
      jest.spyOn(prisma.workspaceUser, 'create').mockResolvedValue({} as any);
      jest.spyOn(prisma.session, 'create').mockResolvedValue({} as any);

      const result = await service.signup('test@example.com', 'password123', 'Test User');

      expect(result.user.email).toBe('test@example.com');
      expect(result.workspace.id).toBe('workspace-1');
      expect(result.accessToken).toBe('test-token');
    });

    it('should throw error if user already exists', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({} as any);

      await expect(
        service.signup('test@example.com', 'password123'),
      ).rejects.toThrow('User already exists');
    });
  });

  describe('signin', () => {
    it('should return user and tokens on successful signin', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: '$2b$10$...',
        globalRole: 'USER',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.spyOn(prisma.workspaceUser, 'findMany').mockResolvedValue([
        {
          workspace: {
            id: 'workspace-1',
            name: 'Workspace',
            slug: 'workspace-1',
          },
          role: 'OWNER',
        },
      ] as any);
      jest.spyOn(prisma.loginEvent, 'create').mockResolvedValue({} as any);
      jest.spyOn(prisma.session, 'create').mockResolvedValue({} as any);

      // Mock bcrypt comparison
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

      const result = await service.signin('test@example.com', 'password123');

      expect(result.user.email).toBe('test@example.com');
      expect(result.workspaces.length).toBeGreaterThan(0);
    });

    it('should log failed login event on invalid credentials', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.loginEvent, 'create').mockResolvedValue({} as any);

      await expect(
        service.signin('test@example.com', 'wrongpassword'),
      ).rejects.toThrow('Invalid credentials');

      expect(prisma.loginEvent.create).toHaveBeenCalled();
    });
  });

  describe('signout', () => {
    it('should invalidate all sessions for user', async () => {
      jest.spyOn(prisma.session, 'deleteMany').mockResolvedValue({ count: 1 } as any);

      const result = await service.signout('user-1');

      expect(result.message).toBe('Signed out successfully');
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });
  });
});
