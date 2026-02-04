// Kommentify HTML Email Template Builder
// Professional email designs matching Kommentify branding

export function createKommentifyEmail(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kommentify</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ''}
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Kommentify</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">LinkedIn Growth on Autopilot</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 15px;">
                    <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6;">
                      <strong style="color: #495057;">Team Kommentify</strong><br>
                      Making LinkedIn networking effortless
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-top: 15px; border-top: 1px solid #dee2e6;">
                    <p style="margin: 0; color: #868e96; font-size: 12px;">
                      © 2024 Kommentify. All rights reserved.<br>
                      <a href="{{unsubscribeUrl}}" style="color: #667eea; text-decoration: none;">Unsubscribe</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function createButton(text: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin: 25px 0;">
    <tr>
      <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <a href="${url}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>`;
}

export function createCheckList(items: string[]): string {
  return `<table cellpadding="0" cellspacing="0" style="margin: 20px 0;">
    ${items.map(item => `
      <tr>
        <td style="padding: 8px 0;">
          <span style="display: inline-block; width: 24px; height: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; text-align: center; line-height: 24px; color: white; font-weight: bold; margin-right: 12px;">✓</span>
          <span style="color: #495057; font-size: 15px;">${item}</span>
        </td>
      </tr>
    `).join('')}
  </table>`;
}

export function createNumberList(items: string[]): string {
  return `<table cellpadding="0" cellspacing="0" style="margin: 20px 0;">
    ${items.map((item, i) => `
      <tr>
        <td style="padding: 10px 0;">
          <span style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; text-align: center; line-height: 28px; color: white; font-size: 14px; font-weight: bold; margin-right: 12px;">${i + 1}</span>
          <span style="color: #495057; font-size: 15px;">${item}</span>
        </td>
      </tr>
    `).join('')}
  </table>`;
}

export function createHighlight(content: string, bgColor = '#f8f9fa', borderColor = '#667eea'): string {
  return `<div style="background: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 20px; margin: 20px 0; border-radius: 8px;">
    <p style="margin: 0; color: #495057; font-size: 14px; line-height: 1.6;">${content}</p>
  </div>`;
}

export function createAlert(content: string, type: 'success' | 'warning' | 'info' = 'info'): string {
  const colors = {
    success: { bg: '#d4edda', border: '#28a745', text: '#155724' },
    warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
    info: { bg: '#d1ecf1', border: '#17a2b8', text: '#0c5460' }
  };
  const c = colors[type];
  return `<div style="background: ${c.bg}; border: 2px dashed ${c.border}; padding: 20px; border-radius: 12px; margin: 25px 0;">
    <p style="margin: 0; color: ${c.text}; font-size: 14px; font-weight: 600; text-align: center;">${content}</p>
  </div>`;
}
