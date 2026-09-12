import nodemailer from "nodemailer";

export interface ComplaintEmail {
  to: string;
  subject: string;
  text: string;
  imageUrl?: string;
}

export interface EmailReceipt {
  messageId: string;
}

export interface EmailProvider {
  readonly name: string;
  send(email: ComplaintEmail): Promise<EmailReceipt>;
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export const smtpEmailProvider: EmailProvider = {
  name: "smtp",
  async send(email) {
  const transporter = nodemailer.createTransport({
    host: required("SMTP_HOST"),
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: required("SMTP_USER"),
      pass: required("SMTP_PASSWORD"),
    },
  });

  const info = await transporter.sendMail({
    from: required("SMTP_FROM"),
    to: email.to,
    subject: email.subject,
    text: email.imageUrl ? `${email.text}\n\nPhoto: ${email.imageUrl}` : email.text,
    attachments: email.imageUrl
      ? [{ filename: "issue-photo.jpg", href: email.imageUrl }]
      : undefined,
  });

  return { messageId: info.messageId };
  },
};

export function sendComplaintEmail(email: ComplaintEmail): Promise<EmailReceipt> {
  return smtpEmailProvider.send(email);
}