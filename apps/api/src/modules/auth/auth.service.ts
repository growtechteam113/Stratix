import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService,
  ) {}

  async signup(email: string, password: string, name?: string) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        globalRole: 'USER',
      },
    });

    // Create default workspace
    const workspace = await this.prisma.workspace.create({
      data: {
        name: `${name || email}'s Workspace`,
        slug: `workspace-${randomBytes(4).toString('hex')}`,
      },
    });

    // Assign user to workspace as OWNER
    await this.prisma.workspaceUser.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: 'OWNER',
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id);

    // Create session
    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
      },
      accessToken,
      refreshToken,
    };
  }

  async signin(email: string, password: string, ipAddress?: string, userAgent?: string) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Log failed login attempt
      await this.prisma.loginEvent.create({
        data: {
          emailAttempted: email,
          ipAddress,
          userAgent,
          status: 'FAILED',
        },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Log failed login attempt
      await this.prisma.loginEvent.create({
        data: {
          userId: user.id,
          emailAttempted: email,
          ipAddress,
          userAgent,
          status: 'FAILED',
        },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Log successful login
    await this.prisma.loginEvent.create({
      data: {
        userId: user.id,
        emailAttempted: email,
        ipAddress,
        userAgent,
        status: 'SUCCESS',
      },
    });

    // Get user's workspaces
    const workspaceUsers = await this.prisma.workspaceUser.findMany({
      where: { userId: user.id },
      include: { workspace: true },
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id);

    // Create session
    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        globalRole: user.globalRole,
      },
      workspaces: workspaceUsers.map((wu) => ({
        id: wu.workspace.id,
        name: wu.workspace.name,
        slug: wu.workspace.slug,
        role: wu.role,
      })),
      accessToken,
      refreshToken,
    };
  }

  async signout(userId: string) {
    // Invalidate all sessions for this user
    await this.prisma.session.deleteMany({
      where: { userId },
    });

    return { message: 'Signed out successfully' };
  }

  async refreshToken(refreshToken: string) {
    // Find session
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new access token
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
      },
      { expiresIn: '15m' },
    );

    return { accessToken };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const workspaceUsers = await this.prisma.workspaceUser.findMany({
      where: { userId },
      include: { workspace: true },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        globalRole: user.globalRole,
      },
      workspaces: workspaceUsers.map((wu) => ({
        id: wu.workspace.id,
        name: wu.workspace.name,
        slug: wu.workspace.slug,
        role: wu.role,
      })),
    };
  }

  private async generateTokens(userId: string) {
    const accessToken = this.jwtService.sign(
      {
        sub: userId,
      },
      { expiresIn: '15m' },
    );

    const refreshToken = randomBytes(32).toString('hex');

    return { accessToken, refreshToken };
  }
}
