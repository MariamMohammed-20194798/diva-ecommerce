import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;

  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>('RESEND_API_KEY');
    this.resend = key ? new Resend(key) : null;
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

  async sendOtpEmail(to: string, code: string): Promise<void> {
    // Use onboarding@resend.dev if you haven't verified a domain yet
    const from = this.config.get<string>('EMAIL_FROM') || 'onboarding@resend.dev';

    this.logger.log(`Attempting to send OTP to ${to}: ${code}`);

    if (!this.resend) {
      this.logger.warn(`RESEND_API_KEY not set; skipping OTP email.`);
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

      this.logger.log(`OTP email sent successfully! ID: ${data?.id}`);
    } catch (err) {
      this.logger.error(`Failed to send email: ${err.message}`);
    }
  }

}
