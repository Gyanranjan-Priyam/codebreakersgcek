import nodemailer from "nodemailer";
import { env } from "./env";
import { type JSONContent } from "@tiptap/react";
import { generateInvoicePDF } from "./invoice-generator";

// Create a transporter using Gmail SMTP
export const mailer = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_APP_PASSWORD,
  },
});

// Convert TipTap JSON content to HTML for emails
const convertTipTapJSONToHTML = (content: JSONContent): string => {
  if (!content) return '';

  let html = '';

  switch (content.type) {
    case 'doc':
      html = content.content?.map(node => convertTipTapJSONToHTML(node)).join('') || '';
      break;

    case 'paragraph':
      const paragraphContent = content.content?.map(node => convertTipTapJSONToHTML(node)).join('') || '';
      const textAlign = content.attrs?.textAlign;
      const style = textAlign ? ` style="text-align: ${textAlign}; margin: 12px 0;"` : ' style="margin: 12px 0;"';
      html = paragraphContent ? `<p${style}>${paragraphContent}</p>` : `<p${style}></p>`;
      break;

    case 'heading':
      const headingContent = content.content?.map(node => convertTipTapJSONToHTML(node)).join('') || '';
      const level = content.attrs?.level || 1;
      const headingTextAlign = content.attrs?.textAlign;
      const headingStyle = headingTextAlign
        ? ` style="text-align: ${headingTextAlign}; margin: 20px 0 12px 0; color: #1f2937;"`
        : ' style="margin: 20px 0 12px 0; color: #1f2937;"';
      html = `<h${level}${headingStyle}>${headingContent}</h${level}>`;
      break;

    case 'bulletList':
      const bulletItems = content.content?.map(node => convertTipTapJSONToHTML(node)).join('') || '';
      html = `<ul style="margin: 16px 0; padding-left: 24px;">${bulletItems}</ul>`;
      break;

    case 'orderedList':
      const orderedItems = content.content?.map(node => convertTipTapJSONToHTML(node)).join('') || '';
      html = `<ol style="margin: 16px 0; padding-left: 24px;">${orderedItems}</ol>`;
      break;

    case 'listItem':
      const listItemContent = content.content?.map(node => convertTipTapJSONToHTML(node)).join('') || '';
      html = `<li style="margin: 4px 0;">${listItemContent}</li>`;
      break;

    case 'text':
      let textContent = content.text || '';

      // Apply marks (formatting)
      if (content.marks) {
        content.marks.forEach(mark => {
          switch (mark.type) {
            case 'bold':
              textContent = `<strong>${textContent}</strong>`;
              break;
            case 'italic':
              textContent = `<em>${textContent}</em>`;
              break;
            case 'code':
              textContent = `<code style="background-color: #f3f4f6; padding: 2px 4px; border-radius: 4px; font-family: monospace;">${textContent}</code>`;
              break;
            case 'strike':
              textContent = `<s>${textContent}</s>`;
              break;
            case 'underline':
              textContent = `<u>${textContent}</u>`;
              break;
          }
        });
      }

      html = textContent;
      break;

    case 'hardBreak':
      html = '<br>';
      break;

    case 'codeBlock':
      const codeContent = content.content?.map(node => convertTipTapJSONToHTML(node)).join('') || '';
      html = `<pre style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; overflow-x: auto; font-family: monospace; margin: 16px 0;"><code>${codeContent}</code></pre>`;
      break;

    case 'blockquote':
      const quoteContent = content.content?.map(node => convertTipTapJSONToHTML(node)).join('') || '';
      html = `<blockquote style="border-left: 4px solid #e5e7eb; padding-left: 16px; margin: 16px 0; font-style: italic; color: #6b7280;">${quoteContent}</blockquote>`;
      break;

    default:
      // For unknown types, try to render content if it exists
      if (content.content) {
        html = content.content.map(node => convertTipTapJSONToHTML(node)).join('');
      } else if (content.text) {
        html = content.text;
      }
      break;
  }

  return html;
};

// Generate verification email HTML template
const generateVerificationEmailHTML = (verificationCode: string) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeBreakers Email Verification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
            background-color: #f6f8fa;
            padding: 40px 20px;
            color: #24292f;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #d0d7de;
            border-radius: 6px;
        }
        
        .header {
            text-align: center;
            padding: 40px 20px 20px;
        }
        
        .CodeBreakers-logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 24px;
        }
        
        .header h1 {
            font-size: 20px;
            font-weight: 600;
            color: #24292f;
            line-height: 1.5;
        }
        
        .content {
            padding: 0 40px 40px;
        }
        
        .code-box {
            background-color: #f6f8fa;
            border: 1px solid #d0d7de;
            border-radius: 6px;
            padding: 24px;
            margin: 24px 0;
        }
        
        .code-label {
            font-size: 14px;
            color: #57606a;
            margin-bottom: 16px;
        }
        
        .verification-code {
            font-size: 32px;
            font-weight: 600;
            letter-spacing: 8px;
            color: #24292f;
            text-align: center;
            margin: 16px 0;
            font-family: 'Courier New', monospace;
        }
        
        .info-text {
            font-size: 14px;
            color: #57606a;
            line-height: 1.6;
            margin: 16px 0;
        }
        
        .warning {
            font-weight: 600;
            color: #24292f;
        }
        
        .signature {
            margin-top: 24px;
        }
        
        .signature p {
            font-size: 14px;
            color: #57606a;
            line-height: 1.6;
        }
        
        .disclaimer {
            padding: 24px 40px;
            background-color: #f6f8fa;
            border-top: 1px solid #d0d7de;
            font-size: 12px;
            color: #57606a;
            line-height: 1.6;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #57606a;
        }
        
        .footer-divider {
            margin: 0 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://res.cloudinary.com/dw47ib0sh/image/upload/v1764077429/mydzalimrmzbscn0bmue.png" alt="CodeBreakers Logo" class="CodeBreakers-logo" />
            <h1>Please verify your identity for <strong>CodeBreakers</strong></h1>
        </div>
        
        <div class="content">
            <div class="code-box">
                <p class="code-label">Here is your CodeBreakers verification code:</p>
                <div class="verification-code">${verificationCode}</div>
                <p class="info-text">This code is valid for <strong>10 minutes</strong> and can only be used once.</p>
                <p class="info-text"><span class="warning">Please don't share this code with anyone:</span> we'll never ask for it on the phone or via email.</p>
            </div>
            
            <div class="signature">
                <p>Thanks,</p>
                <p>The CodeBreakers Team</p>
            </div>
        </div>
        
        <div class="disclaimer">
            <p>You're receiving this email because a verification code was requested for your CodeBreakers account. If this wasn't you, please ignore this email.</p>
        </div>
    </div>
    
    <div class="footer">
        <p>CodeBreakers 2025 <span class="footer-divider">·</span> Government College of Engineering Kalahandi <span class="footer-divider">·</span> Bhawanipatna, Odisha</p>
    </div>
</body>
</html>`;
};

// Send verification email function with beautiful template
export const sendVerificationEmail = async ({
  to,
  otp,
}: {
  to: string;
  otp: string;
}) => {
  try {
    const html = generateVerificationEmailHTML(otp);

    const info = await mailer.sendMail({
      from: env.GMAIL_FROM_NAME ? `${env.GMAIL_FROM_NAME} <${env.GMAIL_USER}>` : env.GMAIL_USER,
      to,
      subject: 'Verify your email address',
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

const generateMemberPortalEmailHTML = ({
  memberName,
  title,
  message,
  ctaLabel,
  ctaUrl,
}: {
  memberName: string;
  title: string;
  message: string;
  ctaLabel: string;
  ctaUrl: string;
}) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%);padding:40px 36px;text-align:center;">
              <h1 style="margin:0;font-size:28px;line-height:1.2;color:#ffffff;">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 36px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Hello <strong>${memberName}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#374151;">${message}</p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${ctaUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;font-weight:600;padding:14px 24px;border-radius:10px;">${ctaLabel}</a>
              </div>
              <p style="margin:0;font-size:14px;line-height:1.7;color:#6b7280;">If the button doesn’t work, copy and paste this link into your browser:<br />${ctaUrl}</p>
              <p style="margin:24px 0 0;font-size:15px;line-height:1.8;color:#374151;">Thanks,<br />The CodeBreakers Team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const sendMemberInvitationEmail = async ({
  to,
  memberName,
  loginUrl,
}: {
  to: string;
  memberName: string;
  loginUrl: string;
}) => {
  try {
    const html = generateMemberPortalEmailHTML({
      memberName,
      title: "Congratulation!!! You're invited to CodeBreakers",
      message:
        "Your member profile has been created. Use the link below to sign in to your CodeBreakers dashboard and continue your access setup.",
      ctaLabel: "Sign in to your dashboard",
      ctaUrl: loginUrl,
    });

    const info = await mailer.sendMail({
      from: env.GMAIL_FROM_NAME ? `${env.GMAIL_FROM_NAME} <${env.GMAIL_USER}>` : env.GMAIL_USER,
      to,
      subject: "Congratulation!!! You're invited to join CodeBreakers",
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send member invitation email:', error);
    throw error;
  }
};

export const sendMemberWelcomeEmail = async ({
  to,
  memberName,
  dashboardUrl,
}: {
  to: string;
  memberName: string;
  dashboardUrl: string;
}) => {
  return sendWelcomeEmail({
    to,
    firstName: memberName.split(" ")[0] || memberName,
    getStartedUrl: dashboardUrl,
  });
};

// Generate confirmation email HTML template
const generateConfirmationEmailHTML = ({
  participantName,
  eventTitle,
  eventDate,
  eventVenue,
  participantEmail,
  registrationDetails,
}: {
  participantName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  participantEmail: string;
  registrationDetails: {
    fullName: string;
    mobileNumber: string;
    whatsappNumber?: string;
    collegeName: string;
    state: string;
    district: string;
  };
}) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Registration Confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #333333;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding: 50px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 48px 40px 36px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.4px;">✅ Registration Confirmed!</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 15px;">You're all set for the event</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px 40px;">
              <p style="margin: 0 0 24px; font-size: 16px;">Hello <strong>${participantName}</strong>,</p>
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #444444;">
                Congratulations! Your registration for <strong>${eventTitle}</strong> has been confirmed. Your payment has been verified and you're officially registered for the event.
              </p>

              <!-- Attachment Notice -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #22c55e; text-align: center;">
                <p style="margin: 0; font-size: 16px; color: #166534; font-weight: 600;">📎 Registration Details Attached</p>
                <p style="margin: 8px 0 0; font-size: 14px; color: #166534;">A detailed PDF with your complete registration information is attached to this email for your records.</p>
              </div>

              <!-- Event Details -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #0ea5e9;">
                <h3 style="margin: 0 0 20px; font-size: 20px; font-weight: 600; color: #0c4a6e;">📅 Event Details</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 120px;">Event:</td>
                    <td style="padding: 8px 0; color: #111827;">${eventTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Date:</td>
                    <td style="padding: 8px 0; color: #111827;">${eventDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Venue:</td>
                    <td style="padding: 8px 0; color: #111827;">${eventVenue}</td>
                  </tr>
                </table>
              </div>

              <!-- Registration Details -->
              <div style="background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
                <h3 style="margin: 0 0 20px; font-size: 20px; font-weight: 600; color: #92400e;">👤 Your Registration Details</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 140px;">Name:</td>
                    <td style="padding: 8px 0; color: #111827;">${registrationDetails.fullName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Email:</td>
                    <td style="padding: 8px 0; color: #111827;">${participantEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Mobile:</td>
                    <td style="padding: 8px 0; color: #111827;">${registrationDetails.mobileNumber}</td>
                  </tr>
                  ${registrationDetails.whatsappNumber ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">WhatsApp:</td>
                    <td style="padding: 8px 0; color: #111827;">${registrationDetails.whatsappNumber}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">College:</td>
                    <td style="padding: 8px 0; color: #111827;">${registrationDetails.collegeName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Location:</td>
                    <td style="padding: 8px 0; color: #111827;">${registrationDetails.district}, ${registrationDetails.state}</td>
                  </tr>
                </table>
              </div>

              <!-- Important Instructions -->
              <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #ef4444;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #dc2626;">📋 Important Instructions</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151; line-height: 1.6;">
                  <li style="margin-bottom: 8px;">Please arrive at the venue at least 30 minutes before the event starts</li>
                  <li style="margin-bottom: 8px;">Bring a valid government-issued photo ID for verification</li>
                  <li style="margin-bottom: 8px;">Keep this confirmation email handy for check-in</li>
                  <li style="margin-bottom: 8px;">For any queries, contact our support team using the details below</li>
                </ul>
              </div>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #444444;">
                We're excited to see you at the event! If you have any questions or need assistance, please don't hesitate to reach out to our team.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="mailto:${env.GMAIL_USER}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Contact Support</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">Need help? Contact us at 
                <a href="mailto:${env.GMAIL_USER}" style="color: #10b981; text-decoration: none;">${env.GMAIL_USER}</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">© 2025 ${env.GMAIL_FROM_NAME || 'Event Management Platform'}. All rights reserved.</p>
            </td>
          </tr>
        </table>

        <!-- Disclaimer -->
        <table width="600" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                This confirmation email was sent automatically. Please keep it for your records.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Send confirmation email function with attachment
export const sendConfirmationEmailWithAttachment = async ({
  to,
  participantName,
  eventTitle,
  eventDate,
  eventVenue,
  registrationDetails,
  attachmentBuffer,
  attachmentFilename
}: {
  to: string;
  participantName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  registrationDetails: {
    fullName: string;
    mobileNumber: string;
    whatsappNumber?: string;
    collegeName: string;
    state: string;
    district: string;
  };
  attachmentBuffer?: Buffer;
  attachmentFilename?: string;
}) => {
  try {
    const html = generateConfirmationEmailHTML({
      participantName,
      eventTitle,
      eventDate,
      eventVenue,
      participantEmail: to,
      registrationDetails,
    });

    const mailOptions: any = {
      from: env.GMAIL_FROM_NAME ? `${env.GMAIL_FROM_NAME} <${env.GMAIL_USER}>` : env.GMAIL_USER,
      to,
      subject: `🎉 Registration Confirmed - ${eventTitle}`,
      html,
    };

    // Add attachment if provided
    if (attachmentBuffer && attachmentFilename) {
      mailOptions.attachments = [
        {
          filename: attachmentFilename,
          content: attachmentBuffer,
          contentType: 'application/pdf'
        }
      ];
    }

    const info = await mailer.sendMail(mailOptions);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send confirmation email with attachment:', error);
    throw error;
  }
};

// Send confirmation email function
export const sendConfirmationEmail = async ({
  to,
  participantName,
  eventTitle,
  eventDate,
  eventVenue,
  registrationDetails,
}: {
  to: string;
  participantName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  registrationDetails: {
    fullName: string;
    mobileNumber: string;
    whatsappNumber?: string;
    collegeName: string;
    state: string;
    district: string;
  };
}) => {
  try {
    const html = generateConfirmationEmailHTML({
      participantName,
      eventTitle,
      eventDate,
      eventVenue,
      participantEmail: to,
      registrationDetails,
    });

    const info = await mailer.sendMail({
      from: env.GMAIL_FROM_NAME ? `${env.GMAIL_FROM_NAME} <${env.GMAIL_USER}>` : env.GMAIL_USER,
      to,
      subject: `🎉 Registration Confirmed - ${eventTitle}`,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    throw error;
  }
};

// Generate announcement notification email HTML template
const generateAnnouncementEmailHTML = ({
  title,
  description,
  category,
  priority,
  publishDate,
  expiryDate,
  relatedEvent,
  hasAttachments,
  hasImages,
  isUpdate = false,
}: {
  title: string;
  description: string | JSONContent;
  category: string;
  priority: string;
  publishDate: string;
  expiryDate?: string;
  relatedEvent?: { title: string; date: string; };
  hasAttachments: boolean;
  hasImages: boolean;
  isUpdate?: boolean;
}) => {
  // Convert description to HTML if it's JSON content, otherwise use as string
  const descriptionHTML = typeof description === 'string'
    ? description
    : convertTipTapJSONToHTML(description);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${isUpdate ? 'Updated Announcement' : 'New Announcement'} - ${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
            background-color: #f6f8fa;
            padding: 40px 20px;
            color: #24292f;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #d0d7de;
            border-radius: 6px;
        }
        
        .header {
            text-align: center;
            padding: 40px 20px 20px;
            border-bottom: 1px solid #d0d7de;
        }
        
        .announcement-icon {
            max-width: 200px;
            height: auto;
            margin-bottom: 16px;
        }
        
        .header h1 {
            font-size: 20px;
            font-weight: 600;
            color: #24292f;
            line-height: 1.5;
            margin-bottom: 8px;
        }
        
        .badges {
            display: flex;
            gap: 8px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            background-color: #f6f8fa;
            border: 1px solid #d0d7de;
            color: #57606a;
        }
        
        .badge.urgent {
            background-color: #ffebe9;
            border-color: #fd8c73;
            color: #d1242f;
        }
        
        .badge.important {
            background-color: #fff5b4;
            border-color: #d1cc00;
            color: #644d00;
        }
        
        .content {
            padding: 32px 40px;
        }
        
        .content h2 {
            font-size: 18px;
            font-weight: 600;
            color: #24292f;
            margin-bottom: 16px;
            line-height: 1.4;
        }
        
        .description {
            font-size: 14px;
            line-height: 1.6;
            color: #57606a;
            margin: 16px 0 24px;
            padding: 16px;
            background-color: #f6f8fa;
            border-radius: 6px;
            border: 1px solid #d0d7de;
        }
        
        .info-section {
            margin: 24px 0;
            padding: 20px;
            background-color: #f6f8fa;
            border: 1px solid #d0d7de;
            border-radius: 6px;
        }
        
        .info-section h3 {
            font-size: 16px;
            font-weight: 600;
            color: #24292f;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid #d0d7de;
        }
        
        .info-row {
            display: flex;
            margin-bottom: 12px;
            font-size: 14px;
            align-items: center;
        }
        
        .info-label {
            font-weight: 600;
            color: #57606a;
            min-width: 100px;
            margin-right: 16px;
        }
        
        .info-value {
            color: #24292f;
            flex: 1;
        }
        
        .attachment-notice {
            padding: 16px;
            background-color: #dafbe1;
            border: 1px solid #2da44e;
            border-radius: 6px;
            margin: 24px 0;
            text-align: center;
        }
        
        .attachment-notice p {
            font-size: 14px;
            color: #1a7f37;
            margin: 0;
        }
        
        .update-notice {
            padding: 16px;
            background-color: #fff5b4;
            border: 1px solid #d1cc00;
            border-radius: 6px;
            margin: 0 0 24px;
            text-align: center;
        }
        
        .update-notice p {
            font-size: 14px;
            color: #644d00;
            margin: 0;
            font-weight: 600;
        }
        
        .signature {
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid #d0d7de;
        }
        
        .signature p {
            font-size: 14px;
            color: #57606a;
            line-height: 1.6;
        }
        
        .footer {
            padding: 24px 40px;
            background-color: #f6f8fa;
            border-top: 1px solid #d0d7de;
            font-size: 12px;
            color: #57606a;
            line-height: 1.6;
        }
        
        .footer-info {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #57606a;
        }
        
        .footer-divider {
            margin: 0 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://res.cloudinary.com/dw47ib0sh/image/upload/v1764077429/mydzalimrmzbscn0bmue.png" alt="CodeBreakers Logo" class="announcement-icon" />
            <h1>CodeBreakers ${isUpdate ? '- 🔁 Updated Announcement' : '- 🔈 New Announcement'}</h1>
            <div class="badges">
                <span class="badge ${priority.toLowerCase() === 'urgent' ? 'urgent' : priority.toLowerCase() === 'important' ? 'important' : ''}">${priority} Priority</span>
                <span class="badge">${category.replace('_', ' ')}</span>
            </div>
        </div>
        
        <div class="content">
            ${isUpdate ? `
            <div class="update-notice">
                <p>🔄 This announcement has been updated. Please review the changes below.</p>
            </div>
            ` : ''}
            
            <h2>${title}</h2>
            
            <div class="description">
                ${descriptionHTML}
            </div>
            
            ${hasAttachments || hasImages ? `
            <div class="attachment-notice">
                <p>📎 ${hasAttachments ? 'Files and documents' : ''}${hasAttachments && hasImages ? ' and ' : ''}${hasImages ? 'images' : ''} are attached to this announcement.</p>
            </div>
            ` : ''}
            
            ${relatedEvent ? `
            <div class="info-section">
                <h3>🎯 Related Event</h3>
                <div class="info-row">
                    <span class="info-label">Event:</span>
                    <span class="info-value">${relatedEvent.title}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date:</span>
                    <span class="info-value">${relatedEvent.date}</span>
                </div>
            </div>
            ` : ''}
            
            <div class="info-section" style="margin-top: 32px;">
                <h3>📅 Announcement Details</h3>
                <div class="info-row">
                    <span class="info-label">Published:</span>
                    <span class="info-value">${publishDate}</span>
                </div>
                ${expiryDate ? `
                <div class="info-row">
                    <span class="info-label">Expires:</span>
                    <span class="info-value">${expiryDate}</span>
                </div>
                ` : ''}
                <div class="info-row">
                    <span class="info-label">Category:</span>
                    <span class="info-value">${category.replace('_', ' ')}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Priority:</span>
                    <span class="info-value">${priority}</span>
                </div>
            </div>
            
            <div class="signature">
                <p>Stay updated with all the latest announcements and information. If you have any questions, please contact our support team at <strong>${env.GMAIL_USER}</strong>.</p>
                <p style="margin-top: 16px;">Thanks,<br>The CodeBreakers Team</p>
            </div>
        </div>
        
        <div class="footer">
            <p>You're receiving this email because you're subscribed to CodeBreakers announcements. If this wasn't intended for you, please ignore this email.</p>
        </div>
    </div>
    
    <div class="footer-info">
        <p>CodeBreakers 2025 <span class="footer-divider">·</span> Government College of Engineering Kalahandi <span class="footer-divider">·</span> Bhawanipatna, Odisha</p>
    </div>
</body>
</html>`;
};

// Send announcement notification email to multiple recipients
export const sendAnnouncementNotification = async ({
  recipients,
  title,
  description,
  category,
  priority,
  publishDate,
  expiryDate,
  relatedEvent,
  attachments,
  isUpdate = false,
}: {
  recipients: string[];
  title: string;
  description: string | JSONContent;
  category: string;
  priority: string;
  publishDate: string;
  expiryDate?: string;
  relatedEvent?: { title: string; date: string; };
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
  isUpdate?: boolean;
}) => {
  try {
    const html = generateAnnouncementEmailHTML({
      title,
      description,
      category,
      priority,
      publishDate,
      expiryDate,
      relatedEvent,
      hasAttachments: attachments ? attachments.some(att => !att.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) : false,
      hasImages: attachments ? attachments.some(att => att.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) : false,
      isUpdate,
    });

    const mailOptions: any = {
      from: env.GMAIL_FROM_NAME ? `${env.GMAIL_FROM_NAME} <${env.GMAIL_USER}>` : env.GMAIL_USER,
      bcc: recipients, // Use BCC to protect recipient privacy
      subject: `${isUpdate ? '🔄 UPDATED' : '📢'} ${priority === 'URGENT' ? '🚨 URGENT: ' : priority === 'IMPORTANT' ? '⚠️ IMPORTANT: ' : ''}${title}`,
      html,
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    const info = await mailer.sendMail(mailOptions);

    return { success: true, messageId: info.messageId, recipientCount: recipients.length };
  } catch (error) {
    console.error('Failed to send announcement notification:', error);
    throw error;
  }
};

// Generic send email function with optional attachments
export const sendEmail = async ({
  to,
  subject,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}) => {
  try {
    const mailOptions: any = {
      from: env.GMAIL_FROM_NAME ? `${env.GMAIL_FROM_NAME} <${env.GMAIL_USER}>` : env.GMAIL_USER,
      to,
      subject,
      html,
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    const info = await mailer.sendMail(mailOptions);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

// Generate payment confirmation email HTML template
const generatePaymentConfirmationEmailHTML = ({
  participantName,
  eventTitle,
  eventDate,
  eventVenue,
  participantEmail,
  invoiceNumber,
  paymentAmount,
  registrationDetails,
}: {
  participantName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  participantEmail: string;
  invoiceNumber: string;
  paymentAmount: number;
  registrationDetails: {
    fullName: string;
    mobileNumber: string;
    whatsappNumber?: string;
    collegeName: string;
    state: string;
    district: string;
  };
}) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #333333;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding: 50px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 48px 40px 36px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.4px;">💰 Payment Confirmed!</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 15px;">Your registration is now complete</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px 40px;">
              <p style="margin: 0 0 24px; font-size: 16px;">Dear <strong>${participantName}</strong>,</p>
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #444444;">
                Great news! Your payment for <strong>${eventTitle}</strong> has been verified and confirmed by our team. 
                Your registration is now complete and you're officially enrolled for the event.
              </p>

              <!-- Payment Status -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #10b981; text-align: center;">
                <div style="font-size: 18px; font-weight: 600; color: #047857; margin-bottom: 8px;">✅ Payment Status: VERIFIED</div>
                <div style="font-size: 14px; color: #047857;">Amount Paid: ₹${paymentAmount}</div>
                <div style="font-size: 12px; color: #059669; margin-top: 5px;">Invoice #${invoiceNumber}</div>
              </div>

              <!-- Invoice Notice -->
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 12px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #f59e0b; text-align: center;">
                <p style="margin: 0; font-size: 16px; color: #92400e; font-weight: 600;">📄 Payment Invoice Attached</p>
                <p style="margin: 8px 0 0; font-size: 14px; color: #92400e;">Your official payment invoice is attached to this email for tax and record purposes.</p>
              </div>

              <!-- Event Details -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #0ea5e9;">
                <h3 style="margin: 0 0 20px; font-size: 20px; font-weight: 600; color: #0c4a6e;">📅 Your Event Details</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 120px;">Event:</td>
                    <td style="padding: 8px 0; color: #111827;">${eventTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Date:</td>
                    <td style="padding: 8px 0; color: #111827;">${eventDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Venue:</td>
                    <td style="padding: 8px 0; color: #111827;">${eventVenue}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Amount Paid:</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600;">₹${paymentAmount}</td>
                  </tr>
                </table>
              </div>

              <!-- Next Steps -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #64748b;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #475569;">🎯 What's Next?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151; line-height: 1.6;">
                  <li style="margin-bottom: 8px;">Save the attached invoice for your records</li>
                  <li style="margin-bottom: 8px;">Mark your calendar for ${eventDate}</li>
                  <li style="margin-bottom: 8px;">Bring a valid government-issued photo ID</li>
                  <li style="margin-bottom: 8px;">Arrive at the venue 30 minutes before the event starts</li>
                  <li style="margin-bottom: 8px;">Check your email for any event updates</li>
                </ul>
              </div>

              <!-- Important Notice -->
              <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #ef4444;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #dc2626;">⚠️ Important Reminders</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151; line-height: 1.6;">
                  <li style="margin-bottom: 8px;">This invoice serves as your proof of payment</li>
                  <li style="margin-bottom: 8px;">Registration is non-transferable and non-refundable</li>
                  <li style="margin-bottom: 8px;">Keep this email and invoice accessible on your phone</li>
                  <li style="margin-bottom: 8px;">Contact support if you have any questions</li>
                </ul>
              </div>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #444444;">
                We're thrilled to have you join us for this amazing event! If you have any questions or need assistance, 
                please don't hesitate to reach out to our support team.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="mailto:${env.GMAIL_USER}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Contact Support</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">Need help? Contact us at 
                <a href="mailto:${env.GMAIL_USER}" style="color: #059669; text-decoration: none;">${env.GMAIL_USER}</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">© 2025 ${env.GMAIL_FROM_NAME || 'CodeBreakers 2025, GCEK'}. All rights reserved.</p>
            </td>
          </tr>
        </table>

        <!-- Disclaimer -->
        <table width="600" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                This payment confirmation was sent automatically. Please keep this invoice for tax and accounting purposes.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Send payment confirmation email with invoice attachment
export const sendPaymentConfirmationEmail = async ({
  to,
  participantName,
  eventTitle,
  eventDate,
  eventVenue,
  invoiceNumber,
  paymentAmount,
  registrationDetails,
  invoiceBuffer,
  invoiceFilename
}: {
  to: string;
  participantName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  invoiceNumber: string;
  paymentAmount: number;
  registrationDetails: {
    fullName: string;
    mobileNumber: string;
    whatsappNumber?: string;
    collegeName: string;
    state: string;
    district: string;
  };
  invoiceBuffer: Buffer;
  invoiceFilename: string;
}) => {
  try {
    const html = generatePaymentConfirmationEmailHTML({
      participantName,
      eventTitle,
      eventDate,
      eventVenue,
      participantEmail: to,
      invoiceNumber,
      paymentAmount,
      registrationDetails,
    });

    const mailOptions = {
      from: env.GMAIL_FROM_NAME ? `${env.GMAIL_FROM_NAME} <${env.GMAIL_USER}>` : env.GMAIL_USER,
      to,
      subject: `💰 Payment Confirmed - ${eventTitle} | Invoice #${invoiceNumber}`,
      html,
      attachments: [
        {
          filename: invoiceFilename,
          content: invoiceBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await mailer.sendMail(mailOptions);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error);
    throw error;
  }
};

// Generate Welcome Email HTML Template
export const generateWelcomeEmailHTML = ({
  firstName = "there",
  companyName = "CodeBreakers",
  getStartedUrl = "https://codebreakersgcek.tech",
  supportEmail = "contact.gcekbhawanipatna@gmail.com",
  companyAddress = "GCEK, Bhawanipatna, Odisha",
}: {
  firstName?: string;
  companyName?: string;
  getStartedUrl?: string;
  supportEmail?: string;
  companyAddress?: string;
}) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html dir="ltr" lang="en"><head><meta content="width=device-width" name="viewport"/><meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/><meta name="x-apple-disable-message-reformatting"/><meta content="IE=edge" http-equiv="X-UA-Compatible"/><meta name="x-apple-disable-message-reformatting"/><meta content="telephone=no,address=no,email=no,date=no,url=no" name="format-detection"/><title>Start achieving more with your new account and tools.</title><style>@media (prefers-color-scheme: dark){li::marker{color:#c4c4c4}}</style></head><body dir="ltr" lang="en"><!--$--><!--html--><!--head--><div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0" data-skip-in-text="true">Start achieving more with your new account and tools.<div>                                                                                                                                                  </div></div><!--body--><table border="0" width="100%" cellPadding="0" cellSpacing="0" role="presentation" align="center"><tbody><tr><td dir="ltr" lang="en" style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;font-size:1em;min-height:100%;line-height:155%"><table align="left" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:600px;align:left;width:100%;border-radius:0px;line-height:155%"><tbody><tr style="width:100%"><td style="padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px"><h1 style="margin:0;padding:0;font-size:28px;line-height:1.44em;padding-top:0.389em;font-weight:700;color:#111827;margin-bottom:16px;text-align:left">Welcome to ${companyName}, ${firstName} 👋</h1><p style="margin:0;padding:0;font-size:1em;padding-top:8px;padding-bottom:0.5em">We're thrilled to have you on board. Your account is ready, and you can now access all the tools and features designed to help you get more done.</p><p style="margin:0;padding:0;font-size:1em;padding-top:16px;padding-bottom:0.5em">To help you get started quickly, here are a few things you can do right away:</p><ul style="margin:0;padding:0;padding-left:1.1em;padding-bottom:1em"><li style="margin:0;padding:0;margin-left:1em;padding-bottom:0.3em;padding-top:0.3em"><p style="margin:0;padding:0"><strong>Complete your profile </strong>so we can personalize your experience.</p></li><li style="margin:0;padding:0;margin-left:1em;padding-bottom:0.3em;padding-top:0.3em"><p style="margin:0;padding:0"><strong>Explore the dashboard </strong>to see everything available to you.</p></li><li style="margin:0;padding:0;margin-left:1em;padding-bottom:0.3em;padding-top:0.3em"><p style="margin:0;padding:0"><strong>Invite your team </strong>to collaborate on projects together.</p></li></ul><table width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="box-sizing:border-box"><tbody><tr><td style="padding:10px 20px 10px 20px;padding-top:24px;padding-bottom:24px"><table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation"><tbody style="width:100%"><tr style="width:100%"><td align="left" data-id="__react-email-column"><a class="button" href="${getStartedUrl}" style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;mso-padding-alt:0px;margin:0;padding:0;padding-top:12px;padding-right:28px;padding-bottom:12px;padding-left:28px;background-color:#000000;color:#ffffff;border-radius:4px;font-weight:500;font-size:0.875em;text-align:center" target="_blank"><span><!--[if mso]><i style="mso-font-width:466.6666666666667%;mso-text-raise:18px" hidden>&#8202;&#8202;&#8202;</i><![endif]--></span><span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:9px">Get started</span><span><!--[if mso]><i style="mso-font-width:466.6666666666667%" hidden>&#8202;&#8202;&#8202;&#8203;</i><![endif]--></span></a></td></tr></tbody></table></td></tr></tbody></table><p style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">If you have any questions or need a hand, our support team is always ready to help. Just reply to this email or reach out to us at ${supportEmail}.</p><p style="margin:0;padding:0;font-size:1em;padding-top:16px;padding-bottom:0.5em">Welcome aboard,<br/>The ${companyName} Team</p><table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" class="node-footer" style="font-size:0.8em"><tbody><tr><td style="padding-top:40px"><hr class="divider" style="width:100%;border:none;border-color:transparent;border-top:1px solid #eaeaea;padding-bottom:1em;border-style:solid;border-width:0;border-top-width:2px"/><p style="margin:0;padding:0;font-size:12px;padding-top:16px;padding-bottom:0.5em;color:#9ca3af;text-align:center">${companyName} • ${companyAddress}<br/>© 2026 ${companyName}. All rights reserved.</p></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><!--/$--></body></html>`;
};

// Generate Form Submission Confirmation Email HTML Template
export const generateFormSubmissionEmailHTML = ({
  firstName = "there",
  formName = "Form",
  responseId = "",
  submittedAt = "",
  companyName = "CodeBreakers",
}: {
  firstName?: string;
  formName?: string;
  responseId?: string;
  submittedAt?: string;
  companyName?: string;
}) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html dir="ltr" lang="en"><head><meta content="width=device-width" name="viewport"/><meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/><meta name="x-apple-disable-message-reformatting"/><meta content="IE=edge" http-equiv="X-UA-Compatible"/><meta name="x-apple-disable-message-reformatting"/><meta content="telephone=no,address=no,email=no,date=no,url=no" name="format-detection"/><title>Your submission has been received and is under review.</title><style>@media (prefers-color-scheme: dark){li::marker{color:#c4c4c4}}</style></head><body dir="ltr" lang="en"><!--$--><!--html--><!--head--><div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0" data-skip-in-text="true">Your submission has been received and is under review.<div>                                                                                                                                                  </div></div><!--body--><table border="0" width="100%" cellPadding="0" cellSpacing="0" role="presentation" align="center"><tbody><tr><td dir="ltr" lang="en" style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;font-size:1em;min-height:100%;line-height:155%;text-decoration:none"><table align="left" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:600px;align:left;width:100%;border-radius:0px;line-height:155%"><tbody><tr style="width:100%"><td style="padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px"><h2 style="margin:0;padding:0;font-size:1.8em;line-height:1.44em;padding-top:0.389em;font-weight:600">We received your submission</h2><p style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">Hi ${firstName},</p><p style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">Thanks for submitting the ${formName}. We've received your response.</p><p style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">For your records, here is your response confirmation ID:</p><p style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em"><strong>Response ID: </strong>${responseId}</p><p style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">Submitted on: ${submittedAt}</p><p style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">Please keep this ID handy in case you need to reference your submission in future correspondence. If you have any questions, simply reply to this email and we'll be glad to help.</p><p style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">Best regards,<br/>The ${companyName} Team</p></td></tr></tbody></table></td></tr></tbody></table><!--/$--></body></html>`;
};

// Send Welcome Email
export const sendWelcomeEmail = async ({
  to,
  firstName,
  getStartedUrl,
  supportEmail,
  companyAddress,
}: {
  to: string;
  firstName?: string;
  getStartedUrl?: string;
  supportEmail?: string;
  companyAddress?: string;
}) => {
  try {
    const html = generateWelcomeEmailHTML({
      firstName,
      companyName: "CodeBreakers",
      getStartedUrl,
      supportEmail,
      companyAddress,
    });

    const info = await mailer.sendMail({
      from: env.GMAIL_FROM_NAME ? `${env.GMAIL_FROM_NAME} <${env.GMAIL_USER}>` : env.GMAIL_USER,
      to,
      subject: "Welcome to CodeBreakers 👋",
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error };
  }
};

// Send Form Submission Email
export const sendFormSubmissionEmail = async ({
  to,
  firstName,
  formName,
  responseId,
  submittedAt,
}: {
  to: string;
  firstName?: string;
  formName?: string;
  responseId?: string;
  submittedAt?: string;
}) => {
  try {
    const html = generateFormSubmissionEmailHTML({
      firstName,
      formName,
      responseId,
      submittedAt,
      companyName: "CodeBreakers",
    });

    const info = await mailer.sendMail({
      from: env.GMAIL_FROM_NAME ? `${env.GMAIL_FROM_NAME} <${env.GMAIL_USER}>` : env.GMAIL_USER,
      to,
      subject: `Submission Received: ${formName || "Form"}`,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send form submission email:", error);
    return { success: false, error };
  }
};

// Generate Invoice Design HTML Template based on invoice-design.md
export const generateInvoiceDesignHTML = ({
  recipientName = "Participant",
  recipientEmail = "",
  formTitle = "Form",
  referenceNumber = "CB-INV-001",
  issuedDate = new Date().toLocaleDateString("en-US"),
  transactionId = "",
  paymentAmount = 0,
  collegeName = "",
}: {
  recipientName?: string;
  recipientEmail?: string;
  formTitle?: string;
  referenceNumber?: string;
  issuedDate?: string;
  transactionId?: string;
  paymentAmount?: number;
  collegeName?: string;
}) => {
  const formattedAmount = (paymentAmount || 0).toFixed(2);
  const logoUrl = "https://res.cloudinary.com/dw47ib0sh/image/upload/v1764077429/mydzalimrmzbscn0bmue.png";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice - CodeBreakers</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; color: #0c0a09;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Message Card -->
        <table width="640" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 12px; overflow: hidden; padding: 28px; margin-bottom: 20px; font-family: system-ui, -apple-system, sans-serif; font-size: 14px; color: #1c1917; line-height: 1.6;">
          <tr>
            <td>
              <h2 style="font-size: 20px; font-weight: 700; color: #0c0a09; margin: 0 0 12px 0;">🎉 Registration Approved & Payment Verified</h2>
              <p style="margin: 0 0 12px 0;">Hi <strong>${recipientName}</strong>,</p>
              <p style="margin: 0 0 12px 0;">Great news! Your response and payment for <strong>${formTitle}</strong> have been successfully verified and approved by the CodeBreakers team.</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #fafaf9; border-left: 4px solid #16a34a; padding: 12px 16px; border-radius: 6px; margin: 16px 0; font-size: 13px;">
                <tr>
                  <td>
                    <p style="margin: 0;"><strong>Reference ID:</strong> ${referenceNumber}</p>
                    ${transactionId ? `<p style="margin: 4px 0 0 0;"><strong>Transaction ID:</strong> ${transactionId}</p>` : ''}
                    <p style="margin: 4px 0 0 0;"><strong>Amount Paid:</strong> ₹${formattedAmount}</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px 0;">Below is your verified payment receipt for your records.</p>
              <p style="margin: 0; color: #78716c; font-size: 13px;">Best regards,<br/><strong>The CodeBreakers Team</strong></p>
            </td>
          </tr>
        </table>

        <!-- Main Invoice Container -->
        <table width="640" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; overflow: hidden; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header Row with Logo and INVOICE Title -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="left" valign="top">
                    <img src="${logoUrl}" alt="CodeBreakers Logo" style="width: 48px; height: 48px; display: block; border-radius: 8px;" />
                  </td>
                  <td align="right" valign="top">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #0c0a09;">INVOICE</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Meta Row: Reference & Dates -->
          <tr>
            <td style="padding-top: 32px; padding-bottom: 24px; border-bottom: 1px solid #e7e5e4;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-size: 13px; line-height: 1.6; color: #44403c;">
                <tr>
                  <td width="50%" valign="top">
                    <p style="margin: 0;"><strong>Reference:</strong> ${referenceNumber}</p>
                    <p style="margin: 0;"><strong>Issued:</strong> ${issuedDate}</p>
                    <p style="margin: 0;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: 700;">PAID & APPROVED</span></p>
                  </td>
                  <td width="50%" valign="top" align="right">
                    <p style="margin: 0;"><strong>Payment Method:</strong> UPI</p>
                    <p style="margin: 0;"><strong>Transaction ID:</strong> ${transactionId || "N/A"}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- From and Bill To Row -->
          <tr>
            <td style="padding-top: 24px; padding-bottom: 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-size: 13px; line-height: 1.6; color: #44403c;">
                <tr>
                  <td width="50%" valign="top">
                    <p style="margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; color: #0c0a09; letter-spacing: 0.05em;">FROM</p>
                    <p style="margin: 0; font-weight: 600; color: #0c0a09;">CodeBreakers</p>
                    <p style="margin: 0;">Government College of Engineering Kalahandi</p>
                    <p style="margin: 0;">Bhawanipatna, Odisha 766002</p>
                    <p style="margin: 0;">Tax ID: CB-1029384756</p>
                  </td>
                  <td width="50%" valign="top" align="right">
                    <p style="margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; color: #0c0a09; letter-spacing: 0.05em;">BILL TO</p>
                    <p style="margin: 0; font-weight: 600; color: #0c0a09;">${recipientName}</p>
                    <p style="margin: 0;">${recipientEmail}</p>
                    ${collegeName ? `<p style="margin: 0;">${collegeName}</p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: collapse; font-size: 13px;">
                <thead>
                  <tr style="background-color: #e7e5e4;">
                    <th align="left" style="padding: 10px 12px; font-weight: 700; text-transform: uppercase; color: #0c0a09;">Description</th>
                    <th align="right" style="padding: 10px 12px; font-weight: 700; text-transform: uppercase; color: #0c0a09;">Units</th>
                    <th align="right" style="padding: 10px 12px; font-weight: 700; text-transform: uppercase; color: #0c0a09;">Unit Cost</th>
                    <th align="right" style="padding: 10px 12px; font-weight: 700; text-transform: uppercase; color: #0c0a09;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #e7e5e4;">
                    <td style="padding: 12px; color: #0c0a09;">${formTitle}</td>
                    <td align="right" style="padding: 12px; color: #44403c;">1</td>
                    <td align="right" style="padding: 12px; color: #44403c;">₹${formattedAmount}</td>
                    <td align="right" style="padding: 12px; font-weight: 600; color: #0c0a09;">₹${formattedAmount}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Summary & Balance Due -->
          <tr>
            <td style="padding-top: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td width="40%"></td>
                  <td width="60%">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-size: 13px; line-height: 1.8; color: #44403c;">
                      <tr>
                        <td>Net Amount:</td>
                        <td align="right">₹${formattedAmount}</td>
                      </tr>
                      <tr>
                        <td>Discount:</td>
                        <td align="right">₹0.00</td>
                      </tr>
                      <tr style="border-top: 2px solid #0c0a09; border-bottom: 2px solid #0c0a09; font-weight: 700; color: #0c0a09;">
                        <td style="padding: 8px 0; text-transform: uppercase;">Total Amount Paid:</td>
                        <td align="right" style="padding: 8px 0; font-size: 15px;">₹${formattedAmount} (PAID)</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 48px; font-size: 12px; color: #78716c; border-top: 1px solid #e7e5e4; margin-top: 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="left" valign="top">
                    <p style="margin: 0;">gcek.codebreakers@gmail.com</p>
                    <p style="margin: 0;">CodeBreakers • GCEK Bhawanipatna</p>
                  </td>
                  <td align="right" valign="top">
                    <p style="margin: 0;">Prepared for prompt processing.</p>
                    <p style="margin: 0;">Issued by CodeBreakers Team</p>
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
};

// Send Form Response Invoice Email
export const sendFormResponseInvoiceEmail = async ({
  to,
  recipientName = "Participant",
  formTitle = "Form",
  referenceNumber = "CB-INV-001",
  issuedDate = new Date().toLocaleDateString("en-US"),
  transactionId = "",
  paymentAmount = 0,
  collegeName = "",
}: {
  to: string;
  recipientName?: string;
  formTitle?: string;
  referenceNumber?: string;
  issuedDate?: string;
  transactionId?: string;
  paymentAmount?: number;
  collegeName?: string;
}) => {
  try {
    const html = generateInvoiceDesignHTML({
      recipientName,
      recipientEmail: to,
      formTitle,
      referenceNumber,
      issuedDate,
      transactionId,
      paymentAmount,
      collegeName,
    });

    const mailOptions = {
      from: env.GMAIL_FROM_NAME ? `${env.GMAIL_FROM_NAME} <${env.GMAIL_USER}>` : env.GMAIL_USER,
      to,
      subject: `🎉 Registration Approved & Official Receipt - ${formTitle} | ${referenceNumber}`,
      html,
    };

    const info = await mailer.sendMail(mailOptions);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send form response invoice email:", error);
    return { success: false, error };
  }
};

// Generate Quiz Result Email HTML
const generateQuizResultHTML = ({
  recipientName,
  quizTitle,
  score,
  totalQuestions,
  correctAnswers,
  pointsEarned,
  answersBreakdown,
}: {
  recipientName: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  pointsEarned: number;
  answersBreakdown: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
}) => {
  const percentage = score;
  const isPassed = percentage >= 50;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Quiz Result - ${quizTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:#FFFFFF;font-family:'Inter',Arial,sans-serif;color:#262523;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#FFFFFF;">
    <tr>
      <td align="center" style="padding:0;">
        <table width="640" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #E3DFD6;">

          <!-- Letterhead -->
          <tr>
            <td style="padding:28px 40px 20px 40px;border-bottom:2px solid #262523;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td valign="middle">
                    <img src="https://res.cloudinary.com/dw47ib0sh/image/upload/v1764077429/mydzalimrmzbscn0bmue.png" alt="CodeBreakers" style="max-width:110px;height:auto;display:block;" />
                  </td>
                  <td valign="middle" align="right">
                    <div style="font-size:10px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;color:#867F73;">Government College of Engineering Kalahandi</div>
                    <div style="font-size:10px;color:#A9A296;margin-top:2px;">CodeBreakers Assessment Cell</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Document title -->
          <tr>
            <td style="padding:24px 40px 4px 40px;">
              <div style="font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#867F73;">Result Statement</div>
              <div style="font-size:20px;font-weight:700;color:#262523;margin-top:4px;">${quizTitle}</div>
            </td>
          </tr>

          <!-- Candidate info -->
          <tr>
            <td style="padding:16px 40px 24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid #E3DFD6;border-bottom:1px solid #E3DFD6;">
                <tr>
                  <td style="padding:10px 0;font-size:11px;color:#867F73;width:35%;">Candidate Name</td>
                  <td style="padding:10px 0;font-size:12px;font-weight:600;color:#262523;">${recipientName}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;font-size:11px;color:#867F73;border-top:1px solid #F0EEE9;">Assessment</td>
                  <td style="padding:10px 0;font-size:12px;font-weight:600;color:#262523;border-top:1px solid #F0EEE9;">${quizTitle}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;font-size:11px;color:#867F73;border-top:1px solid #F0EEE9;">Result Status</td>
                  <td style="padding:10px 0;font-size:12px;font-weight:700;color:${isPassed ? '#256D45' : '#B23A2F'};border-top:1px solid #F0EEE9;">${isPassed ? 'PASS' : 'NOT CLEARED'}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Score table -->
          <tr>
            <td style="padding:0 40px 8px 40px;">
              <div style="font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#867F73;margin-bottom:10px;">Score Summary</div>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #E3DFD6;">
                <tr style="background:#FAF9F6;">
                  <td style="padding:9px 14px;font-size:10px;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;color:#4A4742;border-right:1px solid #E3DFD6;">Metric</td>
                  <td align="right" style="padding:9px 14px;font-size:10px;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;color:#4A4742;">Value</td>
                </tr>
                <tr>
                  <td style="padding:11px 14px;font-size:12px;color:#4A4742;border-top:1px solid #E3DFD6;border-right:1px solid #E3DFD6;">Total Questions</td>
                  <td align="right" style="padding:11px 14px;font-size:12px;font-weight:600;color:#262523;border-top:1px solid #E3DFD6;">${totalQuestions}</td>
                </tr>
                <tr>
                  <td style="padding:11px 14px;font-size:12px;color:#4A4742;border-top:1px solid #E3DFD6;border-right:1px solid #E3DFD6;">Correct Answers</td>
                  <td align="right" style="padding:11px 14px;font-size:12px;font-weight:600;color:#262523;border-top:1px solid #E3DFD6;">${correctAnswers}</td>
                </tr>
                <tr>
                  <td style="padding:11px 14px;font-size:12px;color:#4A4742;border-top:1px solid #E3DFD6;border-right:1px solid #E3DFD6;">Points Earned</td>
                  <td align="right" style="padding:11px 14px;font-size:12px;font-weight:600;color:#262523;border-top:1px solid #E3DFD6;">${pointsEarned}</td>
                </tr>
                <tr>
                  <td style="padding:12px 14px;font-size:12px;font-weight:700;color:#262523;border-top:1px solid #262523;border-right:1px solid #E3DFD6;">Final Percentage</td>
                  <td align="right" style="padding:12px 14px;font-size:14px;font-weight:800;color:${isPassed ? '#256D45' : '#B23A2F'};border-top:1px solid #262523;">${percentage.toFixed(1)}%</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Question breakdown -->
          <tr>
            <td style="padding:28px 40px 8px 40px;">
              <div style="font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#867F73;margin-bottom:10px;">Question-wise Breakdown</div>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #E3DFD6;">
                <tr style="background:#FAF9F6;">
                  <td style="padding:9px 12px;font-size:10px;font-weight:700;text-transform:uppercase;color:#4A4742;width:6%;border-right:1px solid #E3DFD6;">#</td>
                  <td style="padding:9px 12px;font-size:10px;font-weight:700;text-transform:uppercase;color:#4A4742;width:44%;border-right:1px solid #E3DFD6;">Question</td>
                  <td style="padding:9px 12px;font-size:10px;font-weight:700;text-transform:uppercase;color:#4A4742;width:25%;border-right:1px solid #E3DFD6;">Your Answer</td>
                  <td style="padding:9px 12px;font-size:10px;font-weight:700;text-transform:uppercase;color:#4A4742;width:25%;">Correct Answer</td>
                </tr>
                ${answersBreakdown.map((item, idx) => `
                <tr>
                  <td style="padding:10px 12px;font-size:11px;color:#4A4742;border-top:1px solid #E3DFD6;border-right:1px solid #E3DFD6;vertical-align:top;">${idx + 1}</td>
                  <td style="padding:10px 12px;font-size:11px;color:#262523;border-top:1px solid #E3DFD6;border-right:1px solid #E3DFD6;vertical-align:top;">${item.question}</td>
                  <td style="padding:10px 12px;font-size:11px;font-weight:600;color:${item.isCorrect ? '#256D45' : '#B23A2F'};border-top:1px solid #E3DFD6;border-right:1px solid #E3DFD6;vertical-align:top;">${item.userAnswer || 'Not answered'}</td>
                  <td style="padding:10px 12px;font-size:11px;font-weight:600;color:#262523;border-top:1px solid #E3DFD6;vertical-align:top;">${item.isCorrect ? '—' : item.correctAnswer}</td>
                </tr>
                `).join('')}
              </table>
            </td>
          </tr>

          <!-- Note -->
          <tr>
            <td style="padding:24px 40px 8px 40px;">
              <p style="margin:0;font-size:11px;color:#867F73;line-height:1.6;">
                This statement is generated automatically by the CodeBreakers Admin Portal and does not require a signature. For discrepancies, please contact the assessment cell within 7 days of receipt.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #E3DFD6;">
              <span style="font-size:10px;color:#A9A296;">&copy; 2026 CodeBreakers &middot; Government College of Engineering Kalahandi</span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Send Quiz Result Email Function
export const sendQuizResultEmail = async ({
  to,
  recipientName = "Participant",
  quizTitle = "Quiz",
  score = 0,
  totalQuestions = 0,
  correctAnswers = 0,
  pointsEarned = 0,
  answersBreakdown = [],
}: {
  to: string;
  recipientName?: string;
  quizTitle?: string;
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  pointsEarned?: number;
  answersBreakdown?: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
}) => {
  try {
    const html = generateQuizResultHTML({
      recipientName,
      quizTitle,
      score,
      totalQuestions,
      correctAnswers,
      pointsEarned,
      answersBreakdown,
    });

    const mailOptions = {
      from: env.GMAIL_FROM_NAME ? `${env.GMAIL_FROM_NAME} <${env.GMAIL_USER}>` : env.GMAIL_USER,
      to,
      subject: `🏆 Your Quiz Results - ${quizTitle} (${score.toFixed(1)}%)`,
      html,
    };

    const info = await mailer.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send quiz result email:", error);
    return { success: false, error };
  }
};