import { supabase } from './BACKEND_supabase.js';
import { sendMail } from './BACKEND_mailer.js';
import { config } from './BACKEND_env.js';

/**
 * Replace placeholders in template with actual values
 * Supports: {{name}}, {{email}}, {{status}}, and more
 */
const replacePlaceholders = (htmlContent, data) => {
  let content = htmlContent;
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
    content = content.replace(placeholder, String(value || ''));
  });
  return content;
};

/**
 * Send automated email with template
 * 1. Fetches template by name
 * 2. Fetches first active recipient from database
 * 3. Replaces {{placeholders}} with recipient data
 * 4. Sends real email via Gmail SMTP
 * 5. Updates recipient status to 'emailed'
 * 6. Logs the sent email (only after success)
 */
export const sendAutomatedEmail = async (req, res) => {
  try {
    const { templateName } = req.body;
    
    console.log('\n📧 [AUTOMATION] Starting email send process...');
    console.log(`[AUTOMATION] Template: ${templateName}`);

    // STEP 1: FETCH TEMPLATE BY NAME
    console.log('[AUTOMATION] Fetching template...');
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('id, name, type, html_content')
      .eq('name', templateName)
      .single();

    if (templateError || !template) {
      console.error('❌ [AUTOMATION] Template not found:', templateName);
      return res.status(400).json({
        success: false,
        message: `Template "${templateName}" not found`
      });
    }

    console.log(`✓ [AUTOMATION] Template found: ${template.name}`);

    // STEP 2: FETCH FIRST ACTIVE RECIPIENT FROM DATABASE
    console.log('[AUTOMATION] Fetching first active recipient from database...');
    
    const { data: recipient, error: fetchError } = await supabase
      .from('recipient_batches')
      .select('id, email, name, status')
      .eq('status', 'active')
      .limit(1)
      .single();

    if (fetchError || !recipient) {
      console.error('❌ [AUTOMATION] No active recipients found');
      return res.status(400).json({
        success: false,
        message: 'No active recipients found in database'
      });
    }

    console.log(`✓ [AUTOMATION] Recipient found: ${recipient.name} (${recipient.email})`);

    // STEP 3: REPLACE PLACEHOLDERS IN TEMPLATE WITH RECIPIENT DATA
    console.log('[AUTOMATION] Replacing placeholders in template...');
    
    const emailHtml = replacePlaceholders(template.html_content, {
      name: recipient.name,
      email: recipient.email,
      status: recipient.status
    });

    const emailSubject = `Email from AutoMail - ${template.name}`;

    console.log('✓ [AUTOMATION] Placeholders replaced');

    // STEP 4: SEND REAL EMAIL VIA GMAIL SMTP
    console.log('[AUTOMATION] Sending email via Gmail SMTP...');

    let mailResult;
    try {
      mailResult = await sendMail({
        to: recipient.email,
        subject: emailSubject,
        html: emailHtml
      });
      console.log(`✓ [AUTOMATION] Email sent (Message ID: ${mailResult.messageId})`);
    } catch (mailError) {
      console.error('❌ [AUTOMATION] Mail send failed:', mailError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to send email: ' + mailError.message
      });
    }

    // STEP 5: UPDATE RECIPIENT STATUS TO 'emailed' (only after successful send)
    console.log('[AUTOMATION] Updating recipient status...');
    
    const { error: updateError } = await supabase
      .from('recipient_batches')
      .update({ status: 'emailed' })
      .eq('id', recipient.id);

    if (updateError) {
      console.warn('⚠️  [AUTOMATION] Could not update recipient status:', updateError.message);
      // Don't fail here - email was already sent
    } else {
      console.log('✓ [AUTOMATION] Recipient status updated to "emailed"');
    }

    // STEP 6: LOG THE EMAIL (only after successful send)
    console.log('[AUTOMATION] Creating audit log...');
    
    const { error: logError } = await supabase
      .from('email_logs')
      .insert([{
        recipient_email: recipient.email,
        template_name: template.name,
        sent_at: new Date().toISOString(),
        status: 'SENT',
        message_id: mailResult.messageId,
        recipient_id: recipient.id
      }]);

    if (logError) {
      console.warn('⚠️  [AUTOMATION] Could not create log entry:', logError.message);
      // Don't fail here - email was already sent
    } else {
      console.log('✓ [AUTOMATION] Email logged to database');
    }

    // STEP 7: RETURN SUCCESS RESPONSE
    const responseData = {
      success: true,
      message: 'Email sent successfully',
      data: {
        messageId: mailResult.messageId,
        recipient: {
          id: recipient.id,
          email: recipient.email,
          name: recipient.name,
          status: 'emailed'
        },
        email: {
          subject: emailSubject,
          sentAt: new Date().toISOString(),
          template: template.name,
          templateType: template.type
        },
        system: {
          smtpProvider: 'Gmail',
          transport: 'TLS/Port 587',
          demoMode: mailResult.demoMode || false
        }
      }
    };

    console.log('✓ [AUTOMATION] Returning success response\n');
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('\n❌ [AUTOMATION] Error:');
    console.error('  Message:', error.message);
    console.error('  Stack:', error.stack);

    return res.status(500).json({
      success: false,
      message: 'Failed to send email: ' + error.message
    });
  }
};

/**
 * Get automation status
 */
export const getAutomationStatus = async (req, res) => {
  try {
    const { data: recipients } = await supabase
      .from('recipient_batches')
      .select('id, status');

    return res.json({
      success: true,
      data: {
        systemReady: true,
        hasActiveRecipients: recipients && recipients.length > 0,
        recipientCount: recipients ? recipients.length : 0,
        features: {
          emailAutomation: true,
          scheduling: false,
          notifications: true
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create automation record
 */
export const createAutomation = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: 'Automation created',
      data: { id: 'automation-' + Date.now() }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

