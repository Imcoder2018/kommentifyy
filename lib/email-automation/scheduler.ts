// Email Scheduler - Manages email queue and scheduling

import { prisma } from '@/lib/prisma';
import { EMAIL_SEQUENCES, replaceVariables, LIFETIME_DEAL_EMAIL, FEATURE_ANNOUNCEMENT_EMAIL } from './templates';
import { sendDirectEmail, upsertGHLContact, addTagToContact, GHL_TAGS } from './ghl-service';

// Schedule onboarding sequence for a new user
export async function scheduleOnboardingSequence(userId: string, userEmail: string, userName: string): Promise<void> {
  try {
    // Check if sequence already started
    const existingState = await prisma.userEmailState.findUnique({
      where: { userId }
    });

    if (existingState?.onboardingStarted) {
      console.log(`Onboarding already started for user ${userId}`);
      return;
    }

    // Create or update email state
    await prisma.userEmailState.upsert({
      where: { userId },
      create: {
        userId,
        onboardingStarted: new Date()
      },
      update: {
        onboardingStarted: new Date()
      }
    });

    // Sync to GHL with trial_user tag
    await upsertGHLContact({
      email: userEmail,
      firstName: userName?.split(' ')[0] || '',
      lastName: userName?.split(' ').slice(1).join(' ') || '',
      tags: [GHL_TAGS.TRIAL_USER]
    });

    // Schedule all onboarding emails
    const sequence = EMAIL_SEQUENCES.onboarding;
    const now = new Date();
    let cumulativeHours = 0;

    for (const email of sequence.emails) {
      cumulativeHours += email.delayHours;
      const scheduledFor = new Date(now.getTime() + cumulativeHours * 60 * 60 * 1000);

      await prisma.emailQueue.create({
        data: {
          userId,
          sequenceType: 'onboarding',
          emailNumber: sequence.emails.indexOf(email) + 1,
          templateId: email.id,
          scheduledFor,
          status: 'pending',
          metadata: JSON.stringify({
            firstName: userName?.split(' ')[0] || 'there',
            email: userEmail
          })
        }
      });
    }

    console.log(`✅ Scheduled ${sequence.emails.length} onboarding emails for user ${userId}`);
  } catch (error) {
    console.error('Error scheduling onboarding sequence:', error);
  }
}

// Schedule expired trial sequence
export async function scheduleExpiredTrialSequence(userId: string, userEmail: string, userName: string): Promise<void> {
  try {
    // Cancel any pending onboarding emails first
    await prisma.emailQueue.updateMany({
      where: {
        userId,
        sequenceType: 'onboarding',
        status: 'pending'
      },
      data: { status: 'cancelled' }
    });

    // Check if expired trial sequence already started
    const existingState = await prisma.userEmailState.findUnique({
      where: { userId }
    });

    if (existingState?.expiredTrialStarted) {
      console.log(`Expired trial sequence already started for user ${userId}`);
      return;
    }

    // Update email state
    await prisma.userEmailState.upsert({
      where: { userId },
      create: {
        userId,
        expiredTrialStarted: new Date(),
        onboardingCompleted: true
      },
      update: {
        expiredTrialStarted: new Date(),
        onboardingCompleted: true
      }
    });

    // Update GHL tags
    await upsertGHLContact({
      email: userEmail,
      firstName: userName?.split(' ')[0] || '',
      tags: [GHL_TAGS.EXPIRED_TRIAL]
    });

    // Schedule expired trial emails
    const sequence = EMAIL_SEQUENCES.expired_trial;
    const now = new Date();
    let cumulativeHours = 0;

    for (const email of sequence.emails) {
      cumulativeHours += email.delayHours;
      const scheduledFor = new Date(now.getTime() + cumulativeHours * 60 * 60 * 1000);

      await prisma.emailQueue.create({
        data: {
          userId,
          sequenceType: 'expired_trial',
          emailNumber: sequence.emails.indexOf(email) + 1,
          templateId: email.id,
          scheduledFor,
          status: 'pending',
          metadata: JSON.stringify({
            firstName: userName?.split(' ')[0] || 'there',
            email: userEmail
          })
        }
      });
    }

    console.log(`✅ Scheduled ${sequence.emails.length} expired trial emails for user ${userId}`);
  } catch (error) {
    console.error('Error scheduling expired trial sequence:', error);
  }
}

// Schedule paid customer sequence
export async function schedulePaidCustomerSequence(
  userId: string, 
  userEmail: string, 
  userName: string,
  planName: string,
  billingType: string
): Promise<void> {
  try {
    // Cancel any pending trial/expired emails
    await prisma.emailQueue.updateMany({
      where: {
        userId,
        status: 'pending',
        sequenceType: { in: ['onboarding', 'expired_trial'] }
      },
      data: { status: 'cancelled' }
    });

    // Check if paid sequence already started
    const existingState = await prisma.userEmailState.findUnique({
      where: { userId }
    });

    if (existingState?.paidSequenceStarted) {
      console.log(`Paid sequence already started for user ${userId}`);
      return;
    }

    // Update email state
    await prisma.userEmailState.upsert({
      where: { userId },
      create: {
        userId,
        paidSequenceStarted: new Date(),
        onboardingCompleted: true,
        expiredTrialCompleted: true
      },
      update: {
        paidSequenceStarted: new Date(),
        onboardingCompleted: true,
        expiredTrialCompleted: true
      }
    });

    // Update GHL tags
    const isLifetime = billingType.toLowerCase().includes('lifetime');
    await upsertGHLContact({
      email: userEmail,
      firstName: userName?.split(' ')[0] || '',
      tags: isLifetime 
        ? [GHL_TAGS.PAID_CUSTOMER, GHL_TAGS.LIFETIME_CUSTOMER, GHL_TAGS.VIP]
        : [GHL_TAGS.PAID_CUSTOMER]
    });

    // Schedule paid customer emails
    const sequence = EMAIL_SEQUENCES.paid_customer;
    const now = new Date();
    let cumulativeHours = 0;

    for (const email of sequence.emails) {
      cumulativeHours += email.delayHours;
      const scheduledFor = new Date(now.getTime() + cumulativeHours * 60 * 60 * 1000);

      await prisma.emailQueue.create({
        data: {
          userId,
          sequenceType: 'paid_customer',
          emailNumber: sequence.emails.indexOf(email) + 1,
          templateId: email.id,
          scheduledFor,
          status: 'pending',
          metadata: JSON.stringify({
            firstName: userName?.split(' ')[0] || 'there',
            email: userEmail,
            planName,
            billingType
          })
        }
      });
    }

    console.log(`✅ Scheduled ${sequence.emails.length} paid customer emails for user ${userId}`);
  } catch (error) {
    console.error('Error scheduling paid customer sequence:', error);
  }
}

// Process pending emails (called by cron)
export async function processEmailQueue(batchSize: number = 10): Promise<{ processed: number; failed: number }> {
  const now = new Date();
  let processed = 0;
  let failed = 0;

  try {
    // Get pending emails that are due
    const pendingEmails = await prisma.emailQueue.findMany({
      where: {
        status: 'pending',
        scheduledFor: { lte: now }
      },
      orderBy: { scheduledFor: 'asc' },
      take: batchSize
    });

    console.log(`📧 Processing ${pendingEmails.length} pending emails...`);

    for (const emailItem of pendingEmails) {
      try {
        // Check if user is unsubscribed
        const emailState = await prisma.userEmailState.findUnique({
          where: { userId: emailItem.userId }
        });

        if (emailState?.unsubscribed) {
          await prisma.emailQueue.update({
            where: { id: emailItem.id },
            data: { status: 'cancelled', error: 'User unsubscribed' }
          });
          continue;
        }

        // Check if user became paid (cancel trial/expired sequences)
        if (emailItem.sequenceType !== 'paid_customer' && emailState?.paidSequenceStarted) {
          await prisma.emailQueue.update({
            where: { id: emailItem.id },
            data: { status: 'cancelled', error: 'User converted to paid' }
          });
          continue;
        }

        // Try to get template from database first
        let subject = '';
        let body = '';
        let isHTML = false;
        
        // First, try database sequence with exact type match
        let dbSequence = await prisma.emailSequence.findFirst({
          where: { type: emailItem.sequenceType, isActive: true },
          include: { emails: { where: { isActive: true }, orderBy: { position: 'asc' } } }
        });
        
        // If not found, try without isActive filter (in case sequence was marked inactive but has valid templates)
        if (!dbSequence || dbSequence.emails.length === 0) {
          dbSequence = await prisma.emailSequence.findFirst({
            where: { type: emailItem.sequenceType },
            include: { emails: { orderBy: { position: 'asc' } } }
          });
        }
        
        // Also try matching by similar types (e.g., 'onboarding' might be stored as 'New User Onboarding')
        if (!dbSequence || dbSequence.emails.length === 0) {
          const allSequences = await prisma.emailSequence.findMany({
            include: { emails: { orderBy: { position: 'asc' } } }
          });
          
          // Try to find a matching sequence by type or name containing the sequence type
          dbSequence = allSequences.find(seq => 
            seq.type === emailItem.sequenceType ||
            seq.type.toLowerCase().includes(emailItem.sequenceType.toLowerCase()) ||
            seq.name.toLowerCase().includes(emailItem.sequenceType.toLowerCase())
          ) || null;
        }
        
        if (dbSequence && dbSequence.emails && dbSequence.emails.length > 0) {
          // Find the email by position (emailNumber is 1-indexed)
          const dbTemplate = dbSequence.emails[emailItem.emailNumber - 1];
          if (dbTemplate) {
            subject = dbTemplate.subject;
            body = dbTemplate.body;
            // Check if body contains HTML - more comprehensive check
            isHTML = body.includes('<!DOCTYPE') || 
                     body.includes('<table') || 
                     body.includes('<html') || 
                     body.includes('<div style') ||
                     body.includes('<td') ||
                     body.includes('background:') ||
                     body.includes('font-family:');
            console.log(`📧 Using database HTML template for ${emailItem.sequenceType} email #${emailItem.emailNumber} (isHTML: ${isHTML})`);
            console.log(`📧 Template subject: ${subject}`);
            console.log(`📧 Template body length: ${body.length} chars, preview: ${body.substring(0, 100)}...`);
          } else {
            console.log(`⚠️ No email found at position ${emailItem.emailNumber - 1} for sequence ${emailItem.sequenceType} (has ${dbSequence.emails.length} emails)`);
          }
        } else {
          console.log(`⚠️ No database sequence found for type: ${emailItem.sequenceType}`);
        }
        
        // Fallback to hardcoded templates if database template not found
        if (!subject || !body) {
          console.log(`📧 Falling back to hardcoded templates for ${emailItem.sequenceType}`);
          const sequence = EMAIL_SEQUENCES[emailItem.sequenceType as keyof typeof EMAIL_SEQUENCES];
          const template = sequence?.emails.find(e => e.id === emailItem.templateId);
          
          if (!template) {
            // Also try finding by email number
            const templateByNumber = sequence?.emails[emailItem.emailNumber - 1];
            if (templateByNumber) {
              subject = templateByNumber.subject;
              body = templateByNumber.body;
              console.log(`📧 Using fallback template by position for ${emailItem.sequenceType} email #${emailItem.emailNumber}`);
            } else {
              await prisma.emailQueue.update({
                where: { id: emailItem.id },
                data: { status: 'failed', error: `Template not found in database or fallback. Sequence: ${emailItem.sequenceType}, EmailNum: ${emailItem.emailNumber}, TemplateId: ${emailItem.templateId}` }
              });
              failed++;
              continue;
            }
          } else {
            subject = template.subject;
            body = template.body;
            console.log(`📧 Using fallback template for ${emailItem.sequenceType} email #${emailItem.emailNumber}`);
          }
        }

        // Parse metadata
        const metadata = emailItem.metadata ? JSON.parse(emailItem.metadata) : {};

        // Replace variables in template
        subject = replaceVariables(subject, metadata);
        body = replaceVariables(body, metadata);

        // Convert to HTML if it's not already HTML
        if (!isHTML && !body.includes('<!DOCTYPE') && !body.includes('<table') && !body.includes('<html')) {
          // Convert plain text to basic HTML
          body = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563eb; }
    a { color: #2563eb; text-decoration: none; }
    .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  ${body.replace(/\n/g, '<br>')}
</body>
</html>`;
          isHTML = true;
        }

        // Send email
        const success = await sendDirectEmail(metadata.email, subject, body);

        if (success) {
          await prisma.emailQueue.update({
            where: { id: emailItem.id },
            data: { status: 'sent', sentAt: new Date() }
          });

          // Update last email sent
          await prisma.userEmailState.update({
            where: { userId: emailItem.userId },
            data: { lastEmailSent: new Date() }
          });

          processed++;
          console.log(`✅ Sent email ${emailItem.templateId} to user ${emailItem.userId}`);
        } else {
          await prisma.emailQueue.update({
            where: { id: emailItem.id },
            data: { status: 'failed', error: 'Send failed' }
          });
          failed++;
        }
      } catch (error) {
        console.error(`Error processing email ${emailItem.id}:`, error);
        await prisma.emailQueue.update({
          where: { id: emailItem.id },
          data: { 
            status: 'failed', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }
        });
        failed++;
      }
    }

    return { processed, failed };
  } catch (error) {
    console.error('Error in processEmailQueue:', error);
    return { processed, failed };
  }
}

// Send special campaign email to all eligible users
export async function sendSpecialCampaign(
  campaignType: 'lifetime_deal' | 'feature_announcement',
  userFilter?: { hasPaid?: boolean; isActive?: boolean }
): Promise<{ scheduled: number }> {
  try {
    // Get template
    const template = campaignType === 'lifetime_deal' 
      ? LIFETIME_DEAL_EMAIL 
      : FEATURE_ANNOUNCEMENT_EMAIL;

    // Get eligible users (basic filter - can be expanded)
    const users = await prisma.user.findMany({
      where: {
        // Add filters based on userFilter
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    // Check which users haven't unsubscribed
    const eligibleUsers = [];
    for (const user of users) {
      const state = await prisma.userEmailState.findUnique({
        where: { userId: user.id }
      });
      if (!state?.unsubscribed) {
        eligibleUsers.push(user);
      }
    }

    // Schedule campaign emails
    const now = new Date();
    for (const user of eligibleUsers) {
      await prisma.emailQueue.create({
        data: {
          userId: user.id,
          sequenceType: 'special',
          emailNumber: 1,
          templateId: template.id,
          scheduledFor: now,
          status: 'pending',
          metadata: JSON.stringify({
            firstName: user.name?.split(' ')[0] || 'there',
            email: user.email
          })
        }
      });
    }

    console.log(`✅ Scheduled ${eligibleUsers.length} campaign emails`);
    return { scheduled: eligibleUsers.length };
  } catch (error) {
    console.error('Error sending special campaign:', error);
    return { scheduled: 0 };
  }
}

// Cancel all pending emails for a user
export async function cancelUserEmails(userId: string): Promise<void> {
  await prisma.emailQueue.updateMany({
    where: {
      userId,
      status: 'pending'
    },
    data: { status: 'cancelled' }
  });
}

// Unsubscribe user from all emails
export async function unsubscribeUser(userId: string): Promise<void> {
  await prisma.userEmailState.upsert({
    where: { userId },
    create: { userId, unsubscribed: true },
    update: { unsubscribed: true }
  });

  await cancelUserEmails(userId);
}
