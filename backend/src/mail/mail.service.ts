import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly transporter: nodemailer.Transporter | null;

  constructor(private readonly config: ConfigService) {
    // Resend Init
    const resendKey = this.config.get<string>('RESEND_API_KEY');
    this.resend = resendKey ? new Resend(resendKey) : null;

    // Nodemailer Init
    const smtpHost = this.config.get<string>('SMTP_HOST');
    const smtpPort = this.config.get<number>('SMTP_PORT', 587);
    const smtpUser = this.config.get<string>('SMTP_USER');
    const smtpPass = this.config.get<string>('SMTP_PASS');

    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.logger.log('Nodemailer transporter initialized');
    } else {
      this.transporter = null;
      this.logger.warn('Nodemailer SMTP config missing; skipping initialization');
    }
  }

  async sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
    const from = this.config.get<string>('EMAIL_FROM', 'noreply@ecommerce.com');

    // ✅ ALWAYS log the verification URL (for development)
    this.logger.log(`Verification email URL for ${to}: ${verifyUrl}`);

    if (!this.resend) {
      this.logger.warn(
        `RESEND_API_KEY not set; skipping verification email to ${to}. URL: ${verifyUrl}`,
      );
      return;
    }
    await this.resend.emails.send({
      from,
      to,
      subject: 'Verify your email',
      html: `<p>Click to verify your account:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
    });

    // ✅ Optional: confirm email sent
    this.logger.log(`Verification email sent to ${to}`);
  }

  /**
   * Main entry point for OTP emails.
   * Currently set to use Nodemailer as requested.
   */
  async sendOtpEmail(to: string, code: string): Promise<void> {
    // We prioritize Nodemailer for now
    if (this.transporter) {
      return this.sendOtpEmailNodemailer(to, code);
    }

    // Fallback to Resend if Nodemailer is not configured
    return this.sendOtpEmailResend(to, code);
  }

  async sendOtpEmailNodemailer(to: string, code: string): Promise<void> {
    if (!this.transporter) {
      this.logger.error('[Nodemailer] Cannot send email: Transporter not initialized');
      return;
    }

    const from = this.config.get<string>('EMAIL_FROM', '"DIVA Brand" <noreply@ecommerce.com>');

    this.logger.log(`[Nodemailer] Sending OTP to ${to}: ${code}`);

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: 'Your One-Time Password (OTP)',
        html: `<p>Your one-time password is: <strong>${code}</strong></p><p>This code will expire in 10 minutes.</p>`,
      });
      this.logger.log(`[Nodemailer] OTP email sent successfully to ${to}`);
    } catch (err) {
      this.logger.error(`[Nodemailer] Failed to send email: ${err.message}`);
      // If Nodemailer fails, we could optionally try Resend here as a last resort
    }
  }

  async sendOtpEmailResend(to: string, code: string): Promise<void> {
    const from = this.config.get<string>('EMAIL_FROM') || 'onboarding@resend.dev';

    this.logger.log(`[Resend] Attempting to send OTP to ${to}: ${code}`);

    if (!this.resend) {
      this.logger.warn(`RESEND_API_KEY not set; skipping Resend OTP email.`);
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from,
        to,
        subject: 'Your One-Time Password (OTP)',
        html: `<p>Your one-time password is: <strong>${code}</strong></p><p>This code will expire in 10 minutes.</p>`,
      });

      if (error) {
        this.logger.error(`Resend Error: ${JSON.stringify(error)}`);
        return;
      }

      this.logger.log(`[Resend] OTP email sent successfully! ID: ${data?.id}`);
    } catch (err) {
      this.logger.error(`[Resend] Failed to send email: ${err.message}`);
    }
  }
}
