import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {

    const config: nodemailer.TransportOptions = {
      host: process.env.SMTP_HOST,
      service: process.env.SMTP_SERVICE,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',

    };
    
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      config.auth = {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      };
    }


    this.transporter = nodemailer.createTransport(config);
  }
  async sendMail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const from = process.env.SMTP_FROM || 'noreply@example.com';
    await this.transporter.sendMail({
      from,
      ...options,
    });

  }

}
