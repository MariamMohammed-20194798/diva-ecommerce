import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBody,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { REFRESH_COOKIE } from './auth.constants';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GoogleOAuthConfiguredGuard } from './guards/google-oauth-configured.guard';
import { GoogleOAuthUser } from './types';
import {
  ApiProtectedEndpointErrors,
  ApiValidationErrorResponse,
} from '../common/swagger/api-responses';
import { OtpType } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send OTP to email (login or signup)',
    description:
      'Sends a six-digit one-time password to the given email. Use type LOGIN for existing users or SIGNUP for new accounts.',
  })
  @ApiOkResponse({
    description: 'OTP sent successfully',
    schema: { example: { ok: true, expiresInSeconds: 600 } },
  })
  @ApiValidationErrorResponse()
  @ApiBody({
    type: SendOtpDto,
    examples: {
      login: {
        summary: 'Login — request OTP',
        value: { email: 'customer@diva.shop', type: OtpType.LOGIN },
      },
      register: {
        summary: 'Register — request OTP',
        value: {
          email: 'newuser@diva.shop',
          type: OtpType.SIGNUP,
          name: 'Jane Doe',
        },
      },
    },
  })
  sendOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendOtp(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP and authenticate',
    description:
      'Validates the OTP, issues JWT access token in the response body, and sets an httpOnly refresh token cookie on `/api/auth`.',
  })
  @ApiOkResponse({
    description:
      'Authentication successful — returns accessToken and user profile',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'customer@diva.shop',
          name: 'Jane Doe',
          role: 'CUSTOMER',
        },
      },
    },
  })
  @ApiValidationErrorResponse()
  @ApiBody({
    type: VerifyOtpDto,
    examples: {
      login: {
        summary: 'Login — verify OTP',
        value: {
          email: 'customer@diva.shop',
          code: '123456',
          type: OtpType.LOGIN,
        },
      },
      register: {
        summary: 'Register — verify OTP',
        value: {
          email: 'newuser@diva.shop',
          code: '123456',
          type: OtpType.SIGNUP,
          name: 'Jane Doe',
        },
      },
    },
  })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.verifyOtp(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Uses the httpOnly refresh cookie (set by verify-otp). Returns a new access token without re-entering OTP.',
  })
  @ApiOkResponse({
    description: 'New access token issued',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'customer@diva.shop',
        },
      },
    },
  })
  @ApiProtectedEndpointErrors()
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const result = await this.auth.rotateRefresh(raw);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout and revoke refresh token',
    description:
      'Revokes the refresh token server-side and clears the refresh cookie.',
  })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.auth.revokeRefresh(raw);
    this.clearRefreshCookie(res);
    return { ok: true };
  }

  @Get('google')
  @UseGuards(GoogleOAuthConfiguredGuard, AuthGuard('google'))
  @ApiExcludeEndpoint()
  googleAuth() {
    /* redirects to Google */
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthConfiguredGuard, AuthGuard('google'))
  @ApiExcludeEndpoint()
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const profile = req.user as GoogleOAuthUser;
    const result = await this.auth.oauthLogin(profile);
    this.setRefreshCookie(res, result.refreshToken);
    const frontend = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    res.redirect(`${frontend.replace(/\/$/, '')}/auth/callback`);
  }

  private refreshCookieOptions() {
    const maxAgeDays = Number(
      this.config.get<string>('REFRESH_TOKEN_DAYS', '30'),
    );
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    const sameSite = isProd ? ('none' as const) : ('lax' as const);
    return {
      httpOnly: true,
      secure: isProd,
      sameSite,
      path: '/api/auth',
      maxAge: maxAgeMs,
    };
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE, token, this.refreshCookieOptions());
  }

  private clearRefreshCookie(res: Response) {
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    const sameSite = isProd ? ('none' as const) : ('lax' as const);
    res.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: isProd,
      sameSite,
      path: '/api/auth',
    });
  }
}
