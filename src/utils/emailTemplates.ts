export const getWelcomeTemplate = (username: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to LiquidityLab</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F8FAFC;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      color: #334155;
    }
    .wrapper {
      width: 100%;
      background-color: #F8FAFC;
      padding: 60px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
    }
    .header {
      padding: 40px 40px 20px 40px;
      text-align: left;
      border-bottom: 1px solid #F1F5F9;
    }
    .header-logo {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0F172A;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }
    .accent-dot {
      color: #4F46E5;
    }
    .content {
      padding: 40px;
    }
    .badge {
      display: inline-block;
      background: #ECFDF5;
      border: 1px solid #D1FAE5;
      color: #059669;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 12px;
      border-radius: 6px;
      margin-bottom: 24px;
    }
    .title {
      font-size: 24px;
      font-weight: 700;
      color: #0F172A;
      margin: 0 0 16px 0;
      line-height: 1.3;
    }
    .text {
      font-size: 15px;
      line-height: 1.7;
      color: #475569;
      margin: 0 0 24px 0;
    }
    .text-highlight {
      color: #0F172A;
      font-weight: 600;
    }
    .btn-wrapper {
      margin: 36px 0;
    }
    .btn {
      display: inline-block;
      background-color: #4F46E5;
      color: #FFFFFF !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 14px 32px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1);
      transition: background-color 0.2s;
    }
    .divider {
      height: 1px;
      background-color: #F1F5F9;
      margin: 32px 0;
    }
    .footer {
      padding: 32px 40px;
      background-color: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      text-align: center;
    }
    .footer-text {
      font-size: 12px;
      color: #64748B;
      line-height: 1.6;
      margin: 0;
    }
    .footer-links {
      margin-top: 16px;
    }
    .footer-link {
      color: #4F46E5;
      text-decoration: none;
      font-size: 12px;
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="header-logo">
          LiquidityLab<span class="accent-dot">.</span>
        </a>
      </div>
      <div class="content">
        <span class="badge">Institutional Account Active</span>
        <h2 class="title">Welcome aboard, ${username}</h2>
        <p class="text">
          Your infrastructure is fully provisioned. You now have access to our suite of quantitative analysis tools, high-frequency aggregation engines, and institutional-grade portfolio metrics.
        </p>
        
        <div class="btn-wrapper">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="btn">Access Terminal</a>
        </div>
        
        <div class="divider"></div>
        
        <p class="text">
          <span class="text-highlight">Security Notice:</span> Please ensure you have enabled Two-Factor Authentication (2FA) in your account settings to maintain strict security compliance.
        </p>
      </div>
      <div class="footer">
        <p class="footer-text">
          This is an automated operational message from LiquidityLab.<br>
          For security inquiries, contact security@liquiditylab.io
        </p>
        <div class="footer-links">
          <a href="#" class="footer-link">Privacy Policy</a>
          <a href="#" class="footer-link">Terms of Service</a>
        </div>
        <p class="footer-text" style="margin-top: 24px; font-size: 11px;">
          &copy; ${new Date().getFullYear()} LiquidityLab Technologies. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

export const getPasswordResetTemplate = (resetUrl: string, username: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password - LiquidityLab</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F8FAFC;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      color: #334155;
    }
    .wrapper {
      width: 100%;
      background-color: #F8FAFC;
      padding: 60px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
    }
    .header {
      padding: 40px 40px 20px 40px;
      text-align: left;
      border-bottom: 1px solid #F1F5F9;
    }
    .header-logo {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0F172A;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }
    .accent-dot {
      color: #4F46E5;
    }
    .content {
      padding: 40px;
    }
    .badge {
      display: inline-block;
      background: #FEF2F2;
      border: 1px solid #FEE2E2;
      color: #DC2626;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 12px;
      border-radius: 6px;
      margin-bottom: 24px;
    }
    .title {
      font-size: 24px;
      font-weight: 700;
      color: #0F172A;
      margin: 0 0 16px 0;
      line-height: 1.3;
    }
    .text {
      font-size: 15px;
      line-height: 1.7;
      color: #475569;
      margin: 0 0 24px 0;
    }
    .text-highlight {
      color: #0F172A;
      font-weight: 600;
    }
    .btn-wrapper {
      margin: 36px 0;
    }
    .btn {
      display: inline-block;
      background-color: #0F172A;
      color: #FFFFFF !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 14px 32px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.2), 0 2px 4px -1px rgba(15, 23, 42, 0.1);
    }
    .warning-box {
      background-color: #FFFBEB;
      border-left: 3px solid #F59E0B;
      padding: 16px 20px;
      margin-top: 32px;
      border-radius: 0 6px 6px 0;
    }
    .warning-text {
      font-size: 13px;
      color: #B45309;
      line-height: 1.6;
      margin: 0;
    }
    .footer {
      padding: 32px 40px;
      background-color: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      text-align: center;
    }
    .footer-text {
      font-size: 12px;
      color: #64748B;
      line-height: 1.6;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="header-logo">
          LiquidityLab<span class="accent-dot">.</span>
        </a>
      </div>
      <div class="content">
        <span class="badge">Security Action Required</span>
        <h2 class="title">Reset your credentials</h2>
        <p class="text">
          Hello <span class="text-highlight">${username}</span>,
        </p>
        <p class="text">
          We received a request to authorize a password reset for your institutional account. This link will expire in exactly 10 minutes to maintain security integrity.
        </p>
        
        <div class="btn-wrapper">
          <a href="${resetUrl}" class="btn">Establish New Password</a>
        </div>
        
        <p class="text" style="font-size: 13px; margin-top: 24px;">
          If the button does not work, copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #4F46E5; word-break: break-all;">${resetUrl}</a>
        </p>
        
        <div class="warning-box">
          <p class="warning-text">
            <strong>Unrecognized Activity?</strong> If you did not request this password reset, please ignore this email. We strongly advise auditing your account security and enabling Two-Factor Authentication immediately.
          </p>
        </div>
      </div>
      <div class="footer">
        <p class="footer-text">
          This is an automated security broadcast from LiquidityLab.<br>
          If you suspect unauthorized access, contact security@liquiditylab.io
        </p>
        <p class="footer-text" style="margin-top: 24px; font-size: 11px;">
          &copy; ${new Date().getFullYear()} LiquidityLab Technologies. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};
