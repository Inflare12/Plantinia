import { env } from '../env';
import nodemailer from 'nodemailer';

export interface EmailOptions { to: string; subject: string; html: string; }
export interface IEmailProvider { sendEmail(options: EmailOptions): Promise<boolean>; }

class MockEmailProvider implements IEmailProvider {
  async sendEmail(options: EmailOptions): Promise<boolean> {
    console.log('----------------------------------------');
    console.log(`[MOCK EMAIL SENT TO: ${options.to}]`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log(`HTML: ${options.html}`);
    console.log('----------------------------------------');
    return true;
  }
}

class ResendEmailProvider implements IEmailProvider {
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is required for Resend email delivery');
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API_KEY}` },
      body: JSON.stringify({ from: env.EMAIL_FROM, to: options.to, subject: options.subject, html: options.html }),
    });
    return res.ok;
  }
}

class SMTPEmailProvider implements IEmailProvider {
  private transporter;
  constructor() {
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) throw new Error('SMTP configuration is incomplete');
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    });
  }
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({ from: env.EMAIL_FROM, to: options.to, subject: options.subject, html: options.html });
      return true;
    } catch (error) {
      console.error('SMTP email error:', error);
      return false;
    }
  }
}

export function getEmailProvider(): IEmailProvider {
  if (env.NODE_ENV === 'production' && env.EMAIL_PROVIDER === 'mock') {
    throw new Error('Mock email provider is not allowed in production');
  }
  if (env.EMAIL_PROVIDER === 'smtp') return new SMTPEmailProvider();
  if (env.EMAIL_PROVIDER === 'resend') return new ResendEmailProvider();
  return new MockEmailProvider();
}

export function generateVerificationEmailHtml(name: string, verificationCode: string): string {
  const safeName = name.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #059669;">Welcome to Plantinia, ${safeName}! 🌱</h2>
      <p style="color: #475569; font-size: 16px;">Thank you for joining Plantinia. Use the verification code below to verify your email address.</p>
      <div style="margin: 32px 0; text-align: center;"><div style="display: inline-block; background-color: #f0fdf4; border: 2px solid #059669; border-radius: 12px; padding: 18px 32px;"><span style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #047857;">${verificationCode}</span></div></div>
      <p style="color: #475569; font-size: 14px; text-align: center;">This code expires in 10 minutes.</p>
      <p style="color: #94a3b8; font-size: 14px;">If you didn't create this account, please ignore this email.</p>
    </div>`;
}
