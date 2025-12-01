export const loginNotificationTemplate = (
  userEmail: string,
  loginDetails: {
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
  },
) => ({
  subject: '🔔 New login to your Sentinel AI account',
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Login Detected</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f9fc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f7f9fc;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🤖 Sentinel AI</h1>
              <p style="margin: 10px 0 0; color: #e0f7ff; font-size: 14px;">Security Alert</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a202c; font-size: 24px; font-weight: 600;">New Login Detected</h2>
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                We detected a new login to your Sentinel AI account. If this was you, you can safely ignore this email.
              </p>
              
              <!-- Login Details -->
              <div style="padding: 20px; background-color: #f7fafc; border-radius: 8px; margin-bottom: 30px;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #718096; font-size: 14px; font-weight: 600;">Email:</td>
                    <td style="padding: 8px 0; color: #1a202c; font-size: 14px;">${userEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #718096; font-size: 14px; font-weight: 600;">Time:</td>
                    <td style="padding: 8px 0; color: #1a202c; font-size: 14px;">${loginDetails.timestamp.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #718096; font-size: 14px; font-weight: 600;">IP Address:</td>
                    <td style="padding: 8px 0; color: #1a202c; font-size: 14px;">${loginDetails.ipAddress}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #718096; font-size: 14px; font-weight: 600; vertical-align: top;">Device:</td>
                    <td style="padding: 8px 0; color: #1a202c; font-size: 14px; word-break: break-word;">${loginDetails.userAgent}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Security Warning -->
              <div style="padding: 16px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0 0 12px; color: #991b1b; font-size: 14px; font-weight: 600;">
                  ⚠️ Don't recognize this activity?
                </p>
                <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                  If this wasn't you, your account may be compromised. Please reset your password immediately and review your recent account activity.
                </p>
              </div>
              
              <!-- Security Tips -->
              <div style="padding: 16px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 6px;">
                <p style="margin: 0 0 8px; color: #1e40af; font-size: 14px; font-weight: 600;">
                  🛡️ Security Tips:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 13px; line-height: 1.8;">
                  <li>Never share your password with anyone</li>
                  <li>Use a unique, strong password</li>
                  <li>Enable two-factor authentication (coming soon!)</li>
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f7fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px; color: #718096; font-size: 13px; line-height: 1.6;">
                This is an automated security notification. We send these alerts whenever there's a login to your account from a new device or location.
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
