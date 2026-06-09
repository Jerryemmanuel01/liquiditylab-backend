import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  // 1) Create a transporter
  // For development, we'll use a local mock or log.
  // In production, configure SMTP (SendGrid, Mailgun, AWS SES, etc.)
  
  // const transporter = nodemailer.createTransport({
  //   host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  //   port: parseInt(process.env.EMAIL_PORT || '2525'),
  //   auth: {
  //     user: process.env.EMAIL_USERNAME || 'development_user',
  //     pass: process.env.EMAIL_PASSWORD || 'development_password',
  //   },
  // });

   const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: `Liquidity Lab Support <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // 3) Actually send the email
  // If we don't have proper credentials, just log it so development isn't blocked.
  if (process.env.NODE_ENV === 'development' && (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'development_user')) {
    console.log('\n================== EMAIL MOCK ==================');
    console.log(`To: ${mailOptions.to}`);
    console.log(`Subject: ${mailOptions.subject}`);
    if (mailOptions.html) {
      console.log(`[HTML Template attached. Length: ${mailOptions.html.length} chars]`);
      console.log(`Text Fallback:\n${mailOptions.text}`);
    } else {
      console.log(`Message:\n${mailOptions.text}`);
    }
    console.log('================================================\n');
    return;
  }

  await transporter.sendMail(mailOptions);
};
