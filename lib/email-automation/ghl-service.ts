// GoHighLevel Email Service

const GHL_API_KEY = process.env.GHL_API_KEY || '';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || '';
const GHL_BASE_URL = 'https://services.leadconnectorhq.com';

interface GHLContact {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tags?: string[];
}

interface SendEmailParams {
  contactId: string;
  subject: string;
  body: string;
  fromEmail?: string;
  fromName?: string;
}

// Create or update contact in GHL
export async function upsertGHLContact(contact: GHLContact): Promise<string | null> {
  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    console.warn('GHL API not configured, skipping contact upsert');
    return null;
  }

  try {
    // First, try to find existing contact by email
    const searchResponse = await fetch(
      `${GHL_BASE_URL}/contacts/search/duplicate?locationId=${GHL_LOCATION_ID}&email=${encodeURIComponent(contact.email)}`,
      {
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Version': '2021-07-28'
        }
      }
    );

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.contact?.id) {
        // Update existing contact
        const updateResponse = await fetch(
          `${GHL_BASE_URL}/contacts/${searchData.contact.id}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${GHL_API_KEY}`,
              'Content-Type': 'application/json',
              'Version': '2021-07-28'
            },
            body: JSON.stringify({
              firstName: contact.firstName,
              lastName: contact.lastName,
              phone: contact.phone,
              tags: contact.tags
            })
          }
        );
        
        if (updateResponse.ok) {
          console.log(`✅ Updated GHL contact: ${contact.email}`);
          return searchData.contact.id;
        }
      }
    }

    // Create new contact
    const createResponse = await fetch(
      `${GHL_BASE_URL}/contacts/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          locationId: GHL_LOCATION_ID,
          email: contact.email,
          firstName: contact.firstName || '',
          lastName: contact.lastName || '',
          phone: contact.phone || '',
          tags: contact.tags || []
        })
      }
    );

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log(`✅ Created GHL contact: ${contact.email}`);
      return createData.contact?.id || null;
    }

    console.error('Failed to create GHL contact:', await createResponse.text());
    return null;
  } catch (error) {
    console.error('GHL contact upsert error:', error);
    return null;
  }
}

// Add tag to contact
export async function addTagToContact(contactId: string, tag: string): Promise<boolean> {
  if (!GHL_API_KEY) {
    console.warn('GHL API not configured');
    return false;
  }

  try {
    const response = await fetch(
      `${GHL_BASE_URL}/contacts/${contactId}/tags`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({ tags: [tag] })
      }
    );

    return response.ok;
  } catch (error) {
    console.error('GHL add tag error:', error);
    return false;
  }
}

// Remove tag from contact
export async function removeTagFromContact(contactId: string, tag: string): Promise<boolean> {
  if (!GHL_API_KEY) {
    console.warn('GHL API not configured');
    return false;
  }

  try {
    const response = await fetch(
      `${GHL_BASE_URL}/contacts/${contactId}/tags`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({ tags: [tag] })
      }
    );

    return response.ok;
  } catch (error) {
    console.error('GHL remove tag error:', error);
    return false;
  }
}

// Send email via GHL
export async function sendEmailViaGHL(params: SendEmailParams): Promise<boolean> {
  if (!GHL_API_KEY) {
    console.warn('GHL API not configured, skipping email send');
    return false;
  }

  const fromEmail = params.fromEmail || process.env.GHL_EMAIL_FROM || 'kommentify@arwebcraftszone.com';
  const fromName = params.fromName || 'Kommentify';

  try {
    const response = await fetch(
      `${GHL_BASE_URL}/conversations/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          type: 'Email',
          contactId: params.contactId,
          subject: params.subject,
          // Only replace newlines with <br> if body is plain text (not HTML)
          html: params.body.includes('<!DOCTYPE') || params.body.includes('<table') || params.body.includes('<html') 
            ? params.body 
            : params.body.replace(/\n/g, '<br>'),
          emailFrom: fromEmail,
          emailFromName: fromName
        })
      }
    );

    if (response.ok) {
      console.log(`✅ Email sent to contact ${params.contactId}`);
      return true;
    }

    console.error('Failed to send email:', await response.text());
    return false;
  } catch (error) {
    console.error('GHL email send error:', error);
    return false;
  }
}

// Alternative: Send email directly without GHL contact (using SMTP-like endpoint)
export async function sendDirectEmail(
  toEmail: string,
  subject: string,
  body: string
): Promise<boolean> {
  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    console.warn('GHL API not configured');
    // For development/testing, just log the email
    console.log('📧 [DEV] Would send email:');
    console.log(`   To: ${toEmail}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body preview: ${body.substring(0, 100)}...`);
    return true; // Return true for dev testing
  }

  try {
    // First ensure contact exists
    const contactId = await upsertGHLContact({ email: toEmail });
    
    if (!contactId) {
      console.error('Could not create/find contact for email');
      return false;
    }

    return await sendEmailViaGHL({
      contactId,
      subject,
      body
    });
  } catch (error) {
    console.error('Direct email send error:', error);
    return false;
  }
}

// GHL Tags for sequences
export const GHL_TAGS = {
  TRIAL_USER: 'trial_user',
  PAID_CUSTOMER: 'paid_customer',
  EXPIRED_TRIAL: 'expired_trial',
  LIFETIME_CUSTOMER: 'lifetime_customer',
  ENGAGED_USER: 'engaged_user',
  INACTIVE_USER: 'inactive_user',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  VIP: 'vip'
};
