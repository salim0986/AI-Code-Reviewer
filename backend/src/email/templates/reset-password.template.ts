export const resetPasswordTemplate = (resetLink: string, userEmail: string) => ({
  subject: '🔒 Reset your Sentinel AI password',
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f9fc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f7f9fc;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🤖 Sentinel AI</h1>
              <p style="margin: 10px 0 0; color: #ffe5e5; font-size: 14px;">Password Reset Request</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a202c; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                We received a request to reset the password for your Sentinel AI account:
              </p>
              <p style="margin: 0 0 30px; color: #718096; font-size: 14px;">
                <strong>Email:</strong> ${userEmail}
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="${resetLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(245, 87, 108, 0.4);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative Link -->
              <p style="margin: 0 0 20px; color: #718096; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 30px; padding: 12px; background-color: #f7fafc; border-radius: 6px; word-break: break-all;">
                <a href="${resetLink}" style="color: #f5576c; text-decoration: none; font-size: 13px;">${resetLink}</a>
              </p>
              
              <!-- Security Warning -->
              <div style="padding: 16px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0; color: #991b1b; font-size: 14px;">
                  🚨 <strong>Security Notice:</strong> This link expires in 1 hour for your protection.
                </p>
              </div>
              
              <!-- Info Notice -->
              <div style="padding: 16px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 6px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px;">
                  💡 <strong>Didn't request this?</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f7fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px; color: #718096; font-size: 13px; line-height: 1.6;">
                For security reasons, we recommend changing your password if you suspect unauthorized access to your account.
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                © ${new Date().getFullYear()} Sentinel AI. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `,
});
