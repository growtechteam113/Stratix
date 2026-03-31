import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { EventsService } from '../events/events.service';
import { PrismaClient } from '@prisma/client';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: PrismaClient;
  let eventsService: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaClient,
          useValue: {
            project: {
              findUnique: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: EventsService,
          useValue: {
            recordActivityEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get<PrismaClient>(PrismaClient);
    eventsService = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const mockProject = {
        id: 'proj-1',
        workspaceId: 'ws-1',
        userId: 'user-1',
        name: 'Test Project',
        slug: 'test-project',
        description: 'Test',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.project, 'create').mockResolvedValue(mockProject as any);
      jest.spyOn(eventsService, 'recordActivityEvent').mockResolvedValue({} as any);

      const result = await service.createProject(
        'ws-1',
        'user-1',
        'Test Project',
      );

      expect(result.name).toBe('Test Project');
      expect(eventsService.recordActivityEvent).toHaveBeenCalled();
    });

    it('should throw error if project name already exists', async () => {
      jest.spyOn(prisma.project, 'findUnique').mockResolvedValue({} as any);

      await expect(
        service.createProject('ws-1', 'user-1', 'Existing Project'),
      ).rejects.toThrow('Project with this name already exists');
    });
  });

  describe('getProject', () => {
    it('should return project with sources', async () => {
      const mockProject = {
        id: 'proj-1',
        name: 'Test Project',
        sources: [],
        user: { id: 'user-1', email: 'user@example.com', name: 'User' },
      };

      jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(mockProject as any);

      const result = await service.getProject('proj-1');

      expect(result.name).toBe('Test Project');
      expect(result.sources).toBeDefined();
    });

    it('should throw error if project not found', async () => {
      jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(null);

      await expect(service.getProject('nonexistent')).rejects.toThrow(
        'Project not found',
      );
    });
  });

  describe('listProjects', () => {
    it('should return paginated projects', async () => {
      const mockProjects = [
        {
          id: 'proj-1',
          name: 'Project 1',
          sources: [],
          user: { email: 'user@example.com', name: 'User' },
        },
      ];

      jest.spyOn(prisma.project, 'findMany').mockResolvedValue(mockProjects as any);
      jest.spyOn(prisma.project, 'count').mockResolvedValue(1);

      const result = await service.listProjects('ws-1');

      expect(result.projects).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('deleteProject', () => {
    it('should archive project', async () => {
      const mockProject = {
        id: 'proj-1',
        userId: 'user-1',
        workspaceId: 'ws-1',
      };

      jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(mockProject as any);
      jest.spyOn(prisma.project, 'update').mockResolvedValue({} as any);
      jest.spyOn(eventsService, 'recordActivityEvent').mockResolvedValue({} as any);

      const result = await service.deleteProject('proj-1', 'user-1');

      expect(result.message).toBe('Project deleted successfully');
      expect(prisma.project.update).toHaveBeenCalled();
    });

    it('should throw error if not project creator', async () => {
      const mockProject = {
        id: 'proj-1',
        userId: 'user-1',
        workspaceId: 'ws-1',
      };

      jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(mockProject as any);

      await expect(
        service.deleteProject('proj-1', 'different-user'),
      ).rejects.toThrow('Only the project creator can delete it');
    });
  });
});
