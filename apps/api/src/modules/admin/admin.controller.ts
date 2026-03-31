import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  Query,
  Param,
  Put,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminAnalyticsService } from './admin-analytics.service';
import { GlobalAdminGuard } from '../../common/guards/global-admin.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly analyticsService: AdminAnalyticsService,
  ) {}

  @Post('bootstrap')
  @HttpCode(200)
  async bootstrap(
    @Body() body: { email: string; password: string; name?: string },
  ) {
    const result = await this.adminService.bootstrap(
      body.email,
      body.password,
      body.name,
    );

    return {
      success: true,
      data: result,
    };
  }

  @Get('dashboard/stats')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  async getDashboardStats() {
    const stats = await this.analyticsService.getSystemHealth();

    return {
      success: true,
      data: stats,
    };
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  async listUsers(
    @Query('limit') limit: string = '20',
    @Query('offset') offset: string = '0',
  ) {
    const result = await this.analyticsService.getUsersList(
      parseInt(limit),
      parseInt(offset),
    );

    return {
      success: true,
      data: result,
    };
  }

  @Put('users/:id/suspend')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  async suspendUser(
    @Param('id') userId: string,
    @Body() body: { reason?: string },
  ) {
    const result = await this.adminService.suspendUser(userId, body.reason);

    return {
      success: true,
      data: result,
      message: 'User suspended successfully',
    };
  }

  @Put('users/:id/restore')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  async restoreUser(@Param('id') userId: string) {
    const result = await this.adminService.restoreUser(userId);

    return {
      success: true,
      data: result,
      message: 'User restored successfully',
    };
  }

  @Get('events/logins')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  async getLoginHistory(
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0',
  ) {
    const result = await this.analyticsService.getLoginHistory(
      parseInt(limit),
      parseInt(offset),
    );

    return {
      success: true,
      data: result,
    };
  }

  @Get('events/activity')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  async getUserActivityHistory(
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0',
  ) {
    const result = await this.analyticsService.getUserActivityHistory(
      parseInt(limit),
      parseInt(offset),
    );

    return {
      success: true,
      data: result,
    };
  }

  @Get('events/audit')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  async getAuditLogs(
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0',
  ) {
    const result = await this.analyticsService.getAuditLogs(
      parseInt(limit),
      parseInt(offset),
    );

    return {
      success: true,
      data: result,
    };
  }

  @Get('events/rate-limits')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  async getRateLimitEvents(
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0',
  ) {
    const result = await this.analyticsService.getRateLimitEvents(
      parseInt(limit),
      parseInt(offset),
    );

    return {
      success: true,
      data: result,
    };
  }
}
