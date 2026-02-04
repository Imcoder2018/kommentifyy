// HTML Email Design Templates with Customizable Sections

export interface EmailSection {
  id: string;
  type: 'header' | 'hero' | 'text' | 'button' | 'image' | 'footer' | 'divider' | '2-column' | 'feature-list';
  content: {
    [key: string]: string;
  };
  editable: boolean;
}

export interface HTMLEmailTemplate {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  sections: EmailSection[];
}

export const htmlEmailTemplates: HTMLEmailTemplate[] = [
  {
    id: 'modern_professional',
    name: 'Modern Professional',
    category: 'Business',
    thumbnail: '📊',
    sections: [
      {
        id: 'header_1',
        type: 'header',
        editable: true,
        content: {
          logoText: '{{productName}}',
          backgroundColor: '#ffffff',
          textColor: '#1f2937'
        }
      },
      {
        id: 'hero_1',
        type: 'hero',
        editable: true,
        content: {
          title: 'Welcome to Our Platform',
          subtitle: 'Get started with {{productName}} today',
          backgroundColor: '#3b82f6',
          textColor: '#ffffff'
        }
      },
      {
        id: 'text_1',
        type: 'text',
        editable: true,
        content: {
          text: 'Hi {{firstName}},\n\nWe\'re excited to have you on board! Here\'s everything you need to know to get started.'
        }
      },
      {
        id: 'button_1',
        type: 'button',
        editable: true,
        content: {
          text: 'Get Started',
          url: '{{dashboardUrl}}',
          backgroundColor: '#10b981',
          textColor: '#ffffff'
        }
      },
      {
        id: 'footer_1',
        type: 'footer',
        editable: true,
        content: {
          text: '© 2024 {{productName}}. All rights reserved.',
          backgroundColor: '#f3f4f6',
          textColor: '#6b7280'
        }
      }
    ]
  },

  {
    id: 'minimalist_clean',
    name: 'Minimalist Clean',
    category: 'Simple',
    thumbnail: '⚪',
    sections: [
      {
        id: 'text_1',
        type: 'text',
        editable: true,
        content: {
          text: 'Hi {{firstName}} 👋'
        }
      },
      {
        id: 'divider_1',
        type: 'divider',
        editable: false,
        content: {
          color: '#e5e7eb'
        }
      },
      {
        id: 'text_2',
        type: 'text',
        editable: true,
        content: {
          text: 'Your message goes here. Keep it simple and focused.'
        }
      },
      {
        id: 'button_1',
        type: 'button',
        editable: true,
        content: {
          text: 'Take Action',
          url: '{{actionUrl}}',
          backgroundColor: '#000000',
          textColor: '#ffffff'
        }
      },
      {
        id: 'divider_2',
        type: 'divider',
        editable: false,
        content: {
          color: '#e5e7eb'
        }
      },
      {
        id: 'text_3',
        type: 'text',
        editable: true,
        content: {
          text: 'Questions? Just reply to this email.'
        }
      }
    ]
  },

  {
    id: 'bold_gradient',
    name: 'Bold Gradient',
    category: 'Eye-Catching',
    thumbnail: '🌈',
    sections: [
      {
        id: 'hero_1',
        type: 'hero',
        editable: true,
        content: {
          title: '{{title}}',
          subtitle: '{{subtitle}}',
          backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          textColor: '#ffffff'
        }
      },
      {
        id: 'text_1',
        type: 'text',
        editable: true,
        content: {
          text: 'Hi {{firstName}},\n\n{{message}}'
        }
      },
      {
        id: 'button_1',
        type: 'button',
        editable: true,
        content: {
          text: '{{buttonText}}',
          url: '{{buttonUrl}}',
          backgroundColor: '#667eea',
          textColor: '#ffffff'
        }
      }
    ]
  },

  {
    id: 'feature_showcase',
    name: 'Feature Showcase',
    category: 'Product',
    thumbnail: '✨',
    sections: [
      {
        id: 'header_1',
        type: 'header',
        editable: true,
        content: {
          logoText: '{{productName}}',
          backgroundColor: '#ffffff',
          textColor: '#1f2937'
        }
      },
      {
        id: 'text_1',
        type: 'text',
        editable: true,
        content: {
          text: 'Introducing Our Latest Features'
        }
      },
      {
        id: 'features_1',
        type: 'feature-list',
        editable: true,
        content: {
          feature1Title: 'Feature One',
          feature1Text: 'Description of feature one',
          feature2Title: 'Feature Two',
          feature2Text: 'Description of feature two',
          feature3Title: 'Feature Three',
          feature3Text: 'Description of feature three'
        }
      },
      {
        id: 'button_1',
        type: 'button',
        editable: true,
        content: {
          text: 'Learn More',
          url: '{{learnMoreUrl}}',
          backgroundColor: '#3b82f6',
          textColor: '#ffffff'
        }
      }
    ]
  },

  {
    id: 'newsletter_style',
    name: 'Newsletter Style',
    category: 'Content',
    thumbnail: '📰',
    sections: [
      {
        id: 'header_1',
        type: 'header',
        editable: true,
        content: {
          logoText: '{{newsletterName}}',
          backgroundColor: '#1f2937',
          textColor: '#ffffff'
        }
      },
      {
        id: 'image_1',
        type: 'image',
        editable: true,
        content: {
          url: '{{heroImageUrl}}',
          alt: 'Feature image'
        }
      },
      {
        id: 'text_1',
        type: 'text',
        editable: true,
        content: {
          text: '## This Week\'s Highlights\n\n{{content}}'
        }
      },
      {
        id: 'divider_1',
        type: 'divider',
        editable: false,
        content: {
          color: '#e5e7eb'
        }
      },
      {
        id: '2col_1',
        type: '2-column',
        editable: true,
        content: {
          leftTitle: 'Article One',
          leftText: 'Preview of article one...',
          leftUrl: '{{article1Url}}',
          rightTitle: 'Article Two',
          rightText: 'Preview of article two...',
          rightUrl: '{{article2Url}}'
        }
      }
    ]
  },

  {
    id: 'ecommerce_promo',
    name: 'E-commerce Promo',
    category: 'Sales',
    thumbnail: '🛍️',
    sections: [
      {
        id: 'hero_1',
        type: 'hero',
        editable: true,
        content: {
          title: '{{promoTitle}}',
          subtitle: '{{promoSubtitle}}',
          backgroundColor: '#ef4444',
          textColor: '#ffffff'
        }
      },
      {
        id: 'text_1',
        type: 'text',
        editable: true,
        content: {
          text: 'Use code: **{{promoCode}}** at checkout'
        }
      },
      {
        id: 'button_1',
        type: 'button',
        editable: true,
        content: {
          text: 'Shop Now',
          url: '{{shopUrl}}',
          backgroundColor: '#000000',
          textColor: '#ffffff'
        }
      },
      {
        id: 'text_2',
        type: 'text',
        editable: true,
        content: {
          text: '*Offer valid until {{expiryDate}}'
        }
      }
    ]
  },

  {
    id: 'event_invitation',
    name: 'Event Invitation',
    category: 'Event',
    thumbnail: '📅',
    sections: [
      {
        id: 'hero_1',
        type: 'hero',
        editable: true,
        content: {
          title: 'You\'re Invited!',
          subtitle: '{{eventName}}',
          backgroundColor: '#8b5cf6',
          textColor: '#ffffff'
        }
      },
      {
        id: 'text_1',
        type: 'text',
        editable: true,
        content: {
          text: '📅 **When:** {{eventDate}}\n📍 **Where:** {{eventLocation}}\n🕒 **Time:** {{eventTime}}'
        }
      },
      {
        id: 'button_1',
        type: 'button',
        editable: true,
        content: {
          text: 'RSVP Now',
          url: '{{rsvpUrl}}',
          backgroundColor: '#8b5cf6',
          textColor: '#ffffff'
        }
      },
      {
        id: 'text_2',
        type: 'text',
        editable: true,
        content: {
          text: 'We hope to see you there!\n\n{{additionalDetails}}'
        }
      }
    ]
  },

  {
    id: 'welcome_onboarding',
    name: 'Welcome & Onboarding',
    category: 'Onboarding',
    thumbnail: '👋',
    sections: [
      {
        id: 'header_1',
        type: 'header',
        editable: true,
        content: {
          logoText: '{{productName}}',
          backgroundColor: '#ffffff',
          textColor: '#1f2937'
        }
      },
      {
        id: 'text_1',
        type: 'text',
        editable: true,
        content: {
          text: 'Welcome {{firstName}}! 🎉\n\nLet\'s get you started with {{productName}}.'
        }
      },
      {
        id: 'features_1',
        type: 'feature-list',
        editable: true,
        content: {
          feature1Title: '1. Complete Your Profile',
          feature1Text: 'Add your details to personalize your experience',
          feature2Title: '2. Explore Features',
          feature2Text: 'Discover what you can do with {{productName}}',
          feature3Title: '3. Get Support',
          feature3Text: 'Our team is here to help 24/7'
        }
      },
      {
        id: 'button_1',
        type: 'button',
        editable: true,
        content: {
          text: 'Start Your Journey',
          url: '{{dashboardUrl}}',
          backgroundColor: '#10b981',
          textColor: '#ffffff'
        }
      }
    ]
  },

  {
    id: 'feedback_survey',
    name: 'Feedback & Survey',
    category: 'Engagement',
    thumbnail: '📋',
    sections: [
      {
        id: 'text_1',
        type: 'text',
        editable: true,
        content: {
          text: 'Hi {{firstName}},\n\nWe value your opinion!'
        }
      },
      {
        id: 'text_2',
        type: 'text',
        editable: true,
        content: {
          text: '{{questionText}}'
        }
      },
      {
        id: 'button_1',
        type: 'button',
        editable: true,
        content: {
          text: 'Take Survey (2 min)',
          url: '{{surveyUrl}}',
          backgroundColor: '#3b82f6',
          textColor: '#ffffff'
        }
      },
      {
        id: 'text_3',
        type: 'text',
        editable: true,
        content: {
          text: 'Thank you for helping us improve!\n\nYour feedback means everything to us.'
        }
      }
    ]
  },

  {
    id: 'urgent_alert',
    name: 'Urgent Alert',
    category: 'Transactional',
    thumbnail: '⚠️',
    sections: [
      {
        id: 'hero_1',
        type: 'hero',
        editable: true,
        content: {
          title: '⚠️ {{alertTitle}}',
          subtitle: '{{alertSubtitle}}',
          backgroundColor: '#fef3c7',
          textColor: '#92400e'
        }
      },
      {
        id: 'text_1',
        type: 'text',
        editable: true,
        content: {
          text: '{{alertMessage}}'
        }
      },
      {
        id: 'button_1',
        type: 'button',
        editable: true,
        content: {
          text: '{{actionButtonText}}',
          url: '{{actionUrl}}',
          backgroundColor: '#f59e0b',
          textColor: '#000000'
        }
      },
      {
        id: 'text_2',
        type: 'text',
        editable: true,
        content: {
          text: 'If you have questions, contact us at {{supportEmail}}'
        }
      }
    ]
  }
];

// Function to render section to HTML
export function renderSectionToHTML(section: EmailSection): string {
  const { type, content } = section;

  switch (type) {
    case 'header':
      return `
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${content.backgroundColor};">
          <tr>
            <td align="center" style="padding: 20px;">
              <h1 style="margin: 0; color: ${content.textColor}; font-size: 24px;">${content.logoText}</h1>
            </td>
          </tr>
        </table>`;

    case 'hero':
      return `
        <table width="100%" cellpadding="0" cellspacing="0" style="background: ${content.backgroundColor};">
          <tr>
            <td align="center" style="padding: 60px 20px;">
              <h1 style="margin: 0 0 15px 0; color: ${content.textColor}; font-size: 36px; font-weight: bold;">${content.title}</h1>
              <p style="margin: 0; color: ${content.textColor}; font-size: 18px;">${content.subtitle}</p>
            </td>
          </tr>
        </table>`;

    case 'text':
      return `
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
              ${content.text.replace(/\n/g, '<br>')}
            </td>
          </tr>
        </table>`;

    case 'button':
      return `
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 30px 20px;">
              <a href="${content.url}" style="display: inline-block; padding: 14px 32px; background-color: ${content.backgroundColor}; color: ${content.textColor}; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                ${content.text}
              </a>
            </td>
          </tr>
        </table>`;

    case 'image':
      return `
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 20px;">
              <img src="${content.url}" alt="${content.alt}" style="max-width: 100%; height: auto; display: block;" />
            </td>
          </tr>
        </table>`;

    case 'divider':
      return `
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 20px 0;">
              <div style="border-top: 1px solid ${content.color};"></div>
            </td>
          </tr>
        </table>`;

    case 'footer':
      return `
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${content.backgroundColor};">
          <tr>
            <td align="center" style="padding: 30px 20px; color: ${content.textColor}; font-size: 14px;">
              ${content.text}
            </td>
          </tr>
        </table>`;

    case 'feature-list':
      return `
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 20px;">
              <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">${content.feature1Title}</h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">${content.feature1Text}</p>
              </div>
              <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">${content.feature2Title}</h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">${content.feature2Text}</p>
              </div>
              <div>
                <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">${content.feature3Title}</h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">${content.feature3Text}</p>
              </div>
            </td>
          </tr>
        </table>`;

    case '2-column':
      return `
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%" style="padding: 20px; vertical-align: top;">
              <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">${content.leftTitle}</h3>
              <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">${content.leftText}</p>
              <a href="${content.leftUrl}" style="color: #3b82f6; text-decoration: none; font-size: 14px;">Read more →</a>
            </td>
            <td width="50%" style="padding: 20px; vertical-align: top;">
              <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">${content.rightTitle}</h3>
              <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">${content.rightText}</p>
              <a href="${content.rightUrl}" style="color: #3b82f6; text-decoration: none; font-size: 14px;">Read more →</a>
            </td>
          </tr>
        </table>`;

    default:
      return '';
  }
}

// Function to generate complete email HTML
export function generateCompleteEmail(template: HTMLEmailTemplate): string {
  const sectionsHTML = template.sections.map(section => renderSectionToHTML(section)).join('\n');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          ${sectionsHTML}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
