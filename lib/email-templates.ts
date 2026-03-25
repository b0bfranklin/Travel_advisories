/**
 * Email templates for the alert subscription system.
 * Returns both text and HTML variants for each template.
 */

interface VerificationEmailData {
  verifyUrl: string
  email: string
  alertType: string
  watchValue: string
}

interface AlertNotificationData {
  email: string
  alertType: string
  watchValue: string
  disruptions: Array<{
    flightNumber: string
    route: string
    disruptionType: string
    severity: string
    reason: string | null
    updatedAt: string
  }>
  unsubscribeUrl: string
}

interface UnsubscribeConfirmationData {
  email: string
  watchValue: string
}

export function getVerificationEmail(data: VerificationEmailData): {
  subject: string
  text: string
  html: string
} {
  const subject = `Verify your TripWatch alert — ${data.watchValue}`

  const text = `
TripWatch — Alert Verification

Hi,

You requested a disruption alert for: ${data.watchValue} (${data.alertType})

Please verify your email address to activate this alert:
${data.verifyUrl}

This link expires in 24 hours. If you didn't request this, you can safely ignore this email.

— TripWatch
https://tripwatch.io
  `.trim()

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your TripWatch alert</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7;">
          <tr>
            <td style="background:#1d4ed8;padding:24px;text-align:center;">
              <span style="color:#ffffff;font-size:20px;font-weight:700;">✈ TripWatch</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px;">
              <h1 style="margin:0 0 16px;font-size:20px;color:#09090b;">Verify your alert</h1>
              <p style="margin:0 0 8px;color:#52525b;font-size:14px;">
                You requested a disruption alert for:
              </p>
              <p style="margin:0 0 24px;font-size:16px;font-weight:600;color:#09090b;background:#f4f4f5;padding:12px 16px;border-radius:6px;border-left:4px solid #1d4ed8;">
                ${data.watchValue}
              </p>
              <p style="margin:0 0 24px;color:#52525b;font-size:14px;">
                Click the button below to verify your email and activate your alert:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${data.verifyUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;font-size:15px;">
                      Verify email &amp; activate alert
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;color:#a1a1aa;font-size:12px;text-align:center;">
                This link expires in 24 hours. If you didn't request this, ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;border-top:1px solid #e4e4e7;text-align:center;">
              <p style="margin:0;color:#a1a1aa;font-size:11px;">
                TripWatch · <a href="https://tripwatch.io" style="color:#1d4ed8;text-decoration:none;">tripwatch.io</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  return { subject, text, html }
}

export function getAlertNotificationEmail(data: AlertNotificationData): {
  subject: string
  text: string
  html: string
} {
  const count = data.disruptions.length
  const subject = `⚠ TripWatch alert: ${count} disruption${count !== 1 ? 's' : ''} for ${data.watchValue}`

  const disruptionLines = data.disruptions
    .map(
      (d) =>
        `• ${d.flightNumber} (${d.route}) — ${d.disruptionType.replace('_', ' ')} [${d.severity}]${d.reason ? `\n  Reason: ${d.reason}` : ''}`
    )
    .join('\n')

  const text = `
TripWatch — Disruption Alert

Alert: ${data.watchValue}

${count} disruption${count !== 1 ? 's' : ''} detected:

${disruptionLines}

View live status: https://tripwatch.io/flights

---
To unsubscribe from this alert:
${data.unsubscribeUrl}

TripWatch provides disruption information for informational purposes only.
Always verify with your carrier before travelling.
  `.trim()

  const disruptionHtml = data.disruptions
    .map(
      (d) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <span style="font-family:monospace;font-weight:700;font-size:14px;">${d.flightNumber}</span>
              <span style="color:#52525b;font-size:13px;margin-left:8px;">${d.route}</span>
            </div>
            <span style="background:${d.severity === 'CRITICAL' ? '#fef2f2' : '#fff7ed'};color:${d.severity === 'CRITICAL' ? '#dc2626' : '#ea580c'};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">${d.severity}</span>
          </div>
          <div style="margin-top:4px;">
            <span style="background:#e4e4e7;color:#3f3f46;padding:1px 6px;border-radius:3px;font-size:11px;">${d.disruptionType.replace('_', ' ')}</span>
          </div>
          ${d.reason ? `<p style="margin:4px 0 0;color:#71717a;font-size:12px;">${d.reason}</p>` : ''}
        </td>
      </tr>
    `
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TripWatch Alert</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7;">
          <tr>
            <td style="background:#b91c1c;padding:16px 24px;">
              <span style="color:#ffffff;font-size:16px;font-weight:700;">⚠ Disruption Alert</span>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px 12px;">
              <p style="margin:0;color:#52525b;font-size:14px;">
                Alert for: <strong style="color:#09090b;">${data.watchValue}</strong>
              </p>
              <p style="margin:8px 0 0;font-size:13px;color:#71717a;">
                ${count} disruption${count !== 1 ? 's' : ''} detected
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 12px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:6px;overflow:hidden;">
                ${disruptionHtml}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;">
              <a href="https://tripwatch.io/flights" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;">
                View live status →
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 24px 20px;border-top:1px solid #e4e4e7;">
              <p style="margin:0;color:#a1a1aa;font-size:11px;">
                For informational purposes only. Always verify with your carrier.<br>
                <a href="${data.unsubscribeUrl}" style="color:#a1a1aa;">Unsubscribe from this alert</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  return { subject, text, html }
}

export function getUnsubscribeConfirmationEmail(data: UnsubscribeConfirmationData): {
  subject: string
  text: string
  html: string
} {
  const subject = `TripWatch alert cancelled — ${data.watchValue}`

  const text = `
TripWatch — Alert Unsubscribed

Your alert for "${data.watchValue}" has been cancelled.

You will no longer receive disruption notifications for this alert.

If this was a mistake, you can re-subscribe at:
https://tripwatch.io/flights

— TripWatch
  `.trim()

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Alert cancelled</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7;">
          <tr>
            <td style="padding:32px 24px;text-align:center;">
              <p style="font-size:32px;margin:0 0 16px;">✓</p>
              <h1 style="margin:0 0 8px;font-size:18px;color:#09090b;">Alert cancelled</h1>
              <p style="margin:0;color:#52525b;font-size:14px;">
                Your alert for <strong>${data.watchValue}</strong> has been removed.
              </p>
              <p style="margin:16px 0 0;color:#a1a1aa;font-size:12px;">
                <a href="https://tripwatch.io/flights" style="color:#1d4ed8;text-decoration:none;">Re-subscribe at any time</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  return { subject, text, html }
}
