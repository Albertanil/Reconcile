import { ApologyData } from '@backend/types/application';

export interface SendApologyOptions {
  recipientPhone: string;
  recipientName: string;
  statement: string;
  remorseScore: number;
  ticketNumber: string;
}

export interface TwilioSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  notConfigured?: boolean;
}

/**
 * Sends an approved apology statement to the recipient via Twilio WhatsApp API.
 * Uses environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
 */
export async function sendApologyWhatsApp(options: SendApologyOptions): Promise<TwilioSendResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !fromNumber) {
    return {
      success: false,
      notConfigured: true,
      error: 'WHATSAPP TRANSMISSION NOT CONFIGURED (Missing Twilio environment variables)',
    };
  }

  let to = options.recipientPhone.trim();
  if (!to.startsWith('whatsapp:')) {
    to = `whatsapp:${to}`;
  }
  let from = fromNumber.trim();
  if (!from.startsWith('whatsapp:')) {
    from = `whatsapp:${from}`;
  }

  const messageBody = `RECONCILE
Department of Interpersonal Affairs

An apology has been officially processed.

Case: ${options.ticketNumber}
Recipient: ${options.recipientName}
AI Remorse Assessment: ${options.remorseScore}%
Status: APPROVED

Official Apology:
"${options.statement}"

This message was processed by the Department of Interpersonal Affairs.`;

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const params = new URLSearchParams();
    params.append('To', to);
    params.append('From', from);
    params.append('Body', messageBody);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await res.json();
    if (res.ok) {
      return { success: true, messageId: data.sid };
    } else {
      return { success: false, error: data.message || 'Twilio API error' };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error contacting Twilio API' };
  }
}
