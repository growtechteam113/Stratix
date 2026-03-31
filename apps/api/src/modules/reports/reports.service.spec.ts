import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaClient } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaClient,
          useValue: {
            project: {
              findUnique: jest.fn(),
            },
            publicReport: {
              upsert: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  describe('createOrUpdatePublicReport', () => {
    it('should create a new public report', async () => {
      const mockProject = { id: 'proj-1', slug: 'my-project' };
      const mockReport = {
        id: 'report-1',
        projectId: 'proj-1',
        slug: 'my-project-abc123-def456',
        title: 'Test Report',
        isPublished: false,
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.publicReport.upsert as jest.Mock).mockResolvedValue(mockReport);

      const result = await service.createOrUpdatePublicReport('proj-1', 'Test Report');

      expect(result.projectId).toBe('proj-1');
      expect(result.title).toBe('Test Report');
    });

    it('should throw if project not found', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createOrUpdatePublicReport('proj-1', 'Test Report'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('publishReport', () => {
    it('should publish a report', async () => {
      const mockReport = {
        id: 'report-1',
        projectId: 'proj-1',
        isPublished: true,
      };

      (prisma.publicReport.update as jest.Mock).mockResolvedValue(mockReport);

      const result = await service.publishReport('proj-1');

      expect(result.isPublished).toBe(true);
    });
  });

  describe('unpublishReport', () => {
    it('should unpublish a report', async () => {
      const mockReport = {
        id: 'report-1',
        projectId: 'proj-1',
        isPublished: false,
      };

      (prisma.publicReport.update as jest.Mock).mockResolvedValue(mockReport);

      const result = await service.unpublishReport('proj-1');

      expect(result.isPublished).toBe(false);
    });
  });

  describe('getPublicReportBySlug', () => {
    it('should fetch a published report by slug', async () => {
      const mockReport = {
        slug: 'test-slug',
        isPublished: true,
        project: {
          name: 'Test Project',
          positioning: null,
          scoreCard: null,
          strategicBrief: null,
        },
      };

      (prisma.publicReport.findUnique as jest.Mock).mockResolvedValue(mockReport);
      (prisma.publicReport.update as jest.Mock).mockResolvedValue(mockReport);

      const result = await service.getPublicReportBySlug('test-slug');

      expect(result.isPublished).toBe(true);
      expect(result.project.name).toBe('Test Project');
    });

    it('should throw if report not found or not published', async () => {
      (prisma.publicReport.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getPublicReportBySlug('test-slug')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('listPublishedReports', () => {
    it('should list published reports', async () => {
      const mockReports = [
        {
          id: 'report-1',
          slug: 'report-1-slug',
          isPublished: true,
          project: { name: 'Project 1' },
        },
      ];

      (prisma.publicReport.findMany as jest.Mock).mockResolvedValue(mockReports);
      (prisma.publicReport.count as jest.Mock).mockResolvedValue(1);

      const result = await service.listPublishedReports(10, 0);

      expect(result.reports).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
