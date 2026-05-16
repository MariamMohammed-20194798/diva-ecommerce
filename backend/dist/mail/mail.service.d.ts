import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private readonly config;
    private readonly logger;
    private readonly resend;
    private readonly transporter;
    constructor(config: ConfigService);
    sendVerificationEmail(to: string, verifyUrl: string): Promise<void>;
    sendOtpEmail(to: string, code: string): Promise<void>;
    sendOtpEmailNodemailer(to: string, code: string): Promise<void>;
    sendOtpEmailResend(to: string, code: string): Promise<void>;
}
