import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { REFRESH_COOKIE } from './auth.constants';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GoogleOAuthConfiguredGuard } from './guards/google-oauth-configured.guard';
import { GoogleOAuthUser } from './types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('send-otp')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendOtp(dto);
  }

  @Post('verify-otp')
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
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.auth.revokeRefresh(raw);
    this.clearRefreshCookie(res);
    return { ok: true };
  }

  @Get('google')
  @UseGuards(GoogleOAuthConfiguredGuard, AuthGuard('google'))
  googleAuth() {
    /* redirects to Google */
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthConfiguredGuard, AuthGuard('google'))
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
    // Vercel (frontend) + Railway (API) are different sites; Lax blocks cross-site cookies.
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
