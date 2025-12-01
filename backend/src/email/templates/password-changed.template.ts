export const passwordChangedTemplate = (userEmail: string) => ({
  subject: '✅ Your Sentinel AI password has been changed',
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f9fc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f7f9fc;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🤖 Sentinel AI</h1>
              <p style="margin: 10px 0 0; color: #d4fff4; font-size: 14px;">Password Changed Successfully</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a202c; font-size: 24px; font-weight: 600;">Password Changed</h2>
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Your Sentinel AI account password has been successfully changed.
              </p>
              <p style="margin: 0 0 30px; color: #718096; font-size: 14px;">
                <strong>Email:</strong> ${userEmail}
              </p>
              
              <!-- Success Message -->
              <div style="padding: 20px; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0; color: #166534; font-size: 14px;">
                  ✅ <strong>All set!</strong> Your new password is now active. All active sessions on other devices have been logged out for security.
                </p>
              </div>
              
              <!-- Security Warning -->
              <div style="padding: 16px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0 0 12px; color: #991b1b; font-size: 14px; font-weight: 600;">
                  ⚠️ Didn't change your password?
                </p>
                <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                  If you didn't make this change, someone else may have accessed your account. Please contact support immediately.
                </p>
              </div>
              
              <!-- Security Tips -->
              <div style="padding: 16px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 6px;">
                <p style="margin: 0 0 8px; color: #1e40af; font-size: 14px; font-weight: 600;">
                  🛡️ Keep your account secure:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 13px; line-height: 1.8;">
                  <li>Store your password in a secure password manager</li>
                  <li>Never share your password with anyone</li>
                  <li>Use a unique password for each service</li>
                  <li>Change your password periodically</li>
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f7fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px; color: #718096; font-size: 13px; line-height: 1.6;">
                This is an automated confirmation message. We send this notification whenever your password is changed for security purposes.
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
