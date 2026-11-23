/**
 * Maatram Connect - Official Email Template Generator
 * Produces responsive HTML emails, plain text fallbacks, and mail client links
 */

export interface EmailTemplateData {
  recipientName: string;
  recipientEmail: string;
  templateType: 'application_received' | 'application_approved' | 'application_rejected' | 'hours_verified' | 'interview_assigned' | 'custom_test';
  subject: string;
  details?: Record<string, any>;
  customBody?: string;
}

export function generateEmailContent(data: EmailTemplateData): { subject: string; text: string; html: string } {
  const { recipientName, recipientEmail, templateType, details, customBody } = data;

  let title = 'Maatram Foundation Notification';
  let bannerText = 'VOLUNTEER PORTAL NOTIFICATION';
  let messageBodyHtml = '';
  let messageBodyText = '';

  switch (templateType) {
    case 'application_received':
      title = 'Application Received';
      bannerText = 'APPLICATION SUBMITTED';
      messageBodyHtml = `
        <p>Dear <strong>${recipientName}</strong>,</p>
        <p>Thank you for stepping forward to volunteer with <strong>Maatram Foundation</strong>!</p>
        <p>We have successfully received your application for: <strong>${details?.opportunityTitle || 'Upcoming Volunteering Drive'}</strong>.</p>
        <p>Our office coordinators are reviewing applications to ensure ideal placement and event capacity. You will receive an official notification once the review is completed.</p>
        <div style="background-color: #F8FAF8; border-left: 4px solid #2D6A4F; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 13px; color: #1E2922;">
            <strong>Event:</strong> ${details?.opportunityTitle || 'Opportunity'}<br/>
            <strong>Category:</strong> ${details?.category || 'General Support'}<br/>
            <strong>Status:</strong> Under Office Review
          </p>
        </div>
      `;
      messageBodyText = `Dear ${recipientName},\n\nThank you for stepping forward to volunteer with Maatram Foundation!\n\nWe have received your application for: ${details?.opportunityTitle || 'Upcoming Volunteering Drive'}.\n\nOur team is reviewing applications and will notify you soon.\n\nMaatram Foundation Volunteering Team`;
      break;

    case 'application_approved':
      title = 'Application Approved';
      bannerText = 'SELECTION CONFIRMATION';
      messageBodyHtml = `
        <p>Dear <strong>${recipientName}</strong>,</p>
        <p>🎉 <strong>Congratulations!</strong> You have been officially approved and selected for:</p>
        <h3 style="color: #1B4332; margin: 8px 0;">${details?.opportunityTitle || 'Maatram Volunteering Drive'}</h3>
        <p>Your contribution directly empowers first-generation college scholars across Tamil Nadu.</p>
        <div style="background-color: #E8F5E9; border-left: 4px solid #2D6A4F; padding: 14px 16px; margin: 16px 0; border-radius: 6px;">
          <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: bold; color: #1B4332;">Next Steps & Instructions:</p>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #2D3748;">
            <li>Please arrive 15 minutes before the scheduled reporting time.</li>
            <li>Wear comfortable semi-formal attire or your Maatram volunteer t-shirt.</li>
            <li>Review the scholar guidance notes sent by the office coordinator.</li>
          </ul>
        </div>
      `;
      messageBodyText = `Dear ${recipientName},\n\nCongratulations! You have been selected to volunteer for: ${details?.opportunityTitle || 'Maatram Drive'}.\n\nPlease arrive on time and coordinate with our lead staff.\n\nThank you,\nMaatram Foundation`;
      break;

    case 'application_rejected':
      title = 'Application Status Update';
      bannerText = 'APPLICATION UPDATE';
      messageBodyHtml = `
        <p>Dear <strong>${recipientName}</strong>,</p>
        <p>Thank you for expressing interest in volunteering for <strong>${details?.opportunityTitle || 'our recent event'}</strong>.</p>
        <p>On this occasion, due to event capacity limits or specific prerequisites, we are unable to accommodate your application for this specific slot.</p>
        <p><em>Reason: ${details?.reason || 'Event capacity reached'}</em></p>
        <p>We deeply appreciate your willingness to give back. Please check the Maatram Connect portal for upcoming school visits, mock interviews, and admissions support opportunities that match your availability.</p>
      `;
      messageBodyText = `Dear ${recipientName},\n\nThank you for your interest in ${details?.opportunityTitle || 'the opportunity'}.\n\nDue to event capacity limits, we could not accept this specific application (Reason: ${details?.reason || 'Capacity reached'}).\n\nWe encourage you to apply for upcoming drives.\n\nWarm regards,\nMaatram Foundation`;
      break;

    case 'hours_verified':
      title = 'Verified Volunteering Contribution';
      bannerText = 'HOURS OFFICIALLY VERIFIED';
      messageBodyHtml = `
        <p>Dear <strong>${recipientName}</strong>,</p>
        <p>On behalf of Maatram Foundation and our scholars, <strong>thank you for your dedication!</strong></p>
        <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; padding: 18px; margin: 16px 0; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: 800; color: #15803D;">${details?.actualHours || 6.0} Hours</div>
          <div style="font-size: 14px; font-weight: 600; color: #166534; margin-top: 4px;">Verified Contribution Recorded</div>
          <div style="font-size: 12px; color: #4B5563; margin-top: 6px;">Event: ${details?.opportunityTitle || 'Scholar Empowerment Event'}</div>
        </div>
        <p>These hours have been permanently credited to your Maatram profile and contribute toward your milestones and certificates.</p>
      `;
      messageBodyText = `Dear ${recipientName},\n\nThank you for your dedication!\n\nYour contribution of ${details?.actualHours || 6.0} hours for "${details?.opportunityTitle || 'Scholar Empowerment Drive'}" has been officially verified by office staff.\n\nMaatram Foundation`;
      break;

    case 'interview_assigned':
      title = 'Interview Panel Assignment';
      bannerText = 'INTERVIEW PANEL INVITATION';
      messageBodyHtml = `
        <p>Dear <strong>${recipientName}</strong>,</p>
        <p>Based on your registered interview availability preferences and domain expertise, you have been invited to conduct an interview slot for Maatram scholars:</p>
        <div style="background-color: #F8FAF8; border-left: 4px solid #2D6A4F; padding: 14px 16px; margin: 16px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 13px; color: #1E2922;">
            <strong>Type:</strong> ${details?.interviewType || 'Mock Interview'}<br/>
            <strong>Domain:</strong> ${details?.domain || 'General'}<br/>
            <strong>Preferred Mode:</strong> ${details?.mode || 'Virtual Online'}
          </p>
        </div>
        <p>Our office coordinator will share the scholar profile and meeting coordinates shortly.</p>
      `;
      messageBodyText = `Dear ${recipientName},\n\nYou have been invited to conduct an interview panel slot with Maatram scholars based on your availability.\n\nMaatram Foundation Office`;
      break;

    case 'custom_test':
    default:
      title = 'Official Maatram Connect Dispatch Test';
      bannerText = 'INTEGRATION DISPATCH';
      messageBodyHtml = `
        <p>Dear <strong>${recipientName}</strong>,</p>
        <p>${customBody || 'This is an official automated dispatch test from the Maatram Connect portal.'}</p>
        <div style="background-color: #F8FAF8; border-left: 4px solid #2D6A4F; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 12px; color: #4A5568;">
            <strong>Portal:</strong> Maatram Connect (MH26-02)<br/>
            <strong>Recipient:</strong> ${recipientEmail}<br/>
            <strong>Consent Gate:</strong> Verified (Volunteering Communications Active)
          </p>
        </div>
      `;
      messageBodyText = `Dear ${recipientName},\n\n${customBody || 'This is an official automated dispatch test from Maatram Connect portal.'}\n\nRecipient: ${recipientEmail}\nMaatram Foundation`;
      break;
  }

  const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F7F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2D3748;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F4F7F5; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1B4332; padding: 24px 28px; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: #2D6A4F; color: #D8F3DC; font-size: 10px; font-weight: 700; letter-spacing: 1px; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">
                      ${bannerText}
                    </span>
                    <h1 style="color: #FFFFFF; font-size: 20px; font-weight: 700; margin: 8px 0 0 0; letter-spacing: -0.5px;">
                      Maatram Connect
                    </h1>
                    <p style="color: #D8F3DC; font-size: 12px; margin: 2px 0 0 0;">
                      Maatram Foundation • Transforming Lives Through Education
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 28px; font-size: 14px; line-height: 1.6; color: #2D3748;">
              <h2 style="font-size: 17px; font-weight: 700; color: #1E2922; margin-top: 0; margin-bottom: 16px;">
                ${title}
              </h2>

              ${messageBodyHtml}

              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #EDF2F7; font-size: 12px; color: #718096;">
                <p style="margin: 0 0 4px 0;">Warm regards,</p>
                <p style="margin: 0; font-weight: 600; color: #1E2922;">Volunteer Coordination Office</p>
                <p style="margin: 0; color: #2D6A4F;">Maatram Foundation</p>
              </div>
            </td>
          </tr>

          <!-- Footer & Privacy Notice -->
          <tr>
            <td style="background-color: #F8FAF8; padding: 18px 28px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #718096; line-height: 1.5;">
              <p style="margin: 0 0 6px 0;">
                You are receiving this communication because you registered with Maatram Connect and granted consent for volunteering-related communications.
              </p>
              <p style="margin: 0;">
                To update your communication preferences, visit the Privacy & Consent settings in your volunteer portal.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return {
    subject: data.subject,
    text: messageBodyText,
    html: fullHtml,
  };
}

export function generateGmailUrl(to: string, subject: string, bodyText: string): string {
  const base = 'https://mail.google.com/mail/?view=cm&fs=1';
  return `${base}&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
}

export function generateMailtoUrl(to: string, subject: string, bodyText: string): string {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
}
