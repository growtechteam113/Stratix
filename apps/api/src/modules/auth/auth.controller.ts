import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Response,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() body: { email: string; password: string; name?: string },
    @Response() res: any,
  ) {
    const result = await this.authService.signup(body.email, body.password, body.name);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true,
      data: {
        user: result.user,
        workspace: result.workspace,
        accessToken: result.accessToken,
      },
    });
  }

  @Post('signin')
  @HttpCode(200)
  async signin(
    @Body() body: { email: string; password: string },
    @Request() req: any,
    @Response() res: any,
  ) {
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    const result = await this.authService.signin(
      body.email,
      body.password,
      ipAddress,
      userAgent,
    );

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      data: {
        user: result.user,
        workspaces: result.workspaces,
        accessToken: result.accessToken,
      },
    });
  }

  @Post('signout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async signout(@Request() req: any, @Response() res: any) {
    await this.authService.signout(req.user.sub);

    res.clearCookie('refreshToken');

    return res.json({
      success: true,
      message: 'Signed out successfully',
    });
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Request() req: any, @Response() res: any) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token not found',
      });
    }

    const result = await this.authService.refreshToken(refreshToken);

    return res.json({
      success: true,
      data: result,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    const profile = await this.authService.getProfile(req.user.sub);

    return {
      success: true,
      data: profile,
    };
  }
}
