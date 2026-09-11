import { NextRequest, NextResponse } from 'next/server';
import { stateManager } from '@backend/application/stateManager';
import { sendApologyWhatsApp } from '@backend/notifications/twilioService';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const application = stateManager.getApplicationById(id);

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    if (application.status !== 'APPROVED' && application.status !== 'APOLOGY_SENT') {
      return NextResponse.json(
        { success: false, error: 'Cannot dispatch apology: Application is not in APPROVED status' },
        { status: 400 }
      );
    }

    const apology = application.apology;
    const recipientPhone = apology?.recipientPhone || 'Not Provided';
    const recipientName = apology?.recipient || 'Affected Party';
    const applicantName = application.applicantName || 'Anonymous Applicant';
    const statement = apology?.whatHappened || application.apologyText || apology?.incident || 'Statement of remorse filed.';
    const remorseScore = application.evaluation?.remorseScore || 90;

    // Check if real Twilio parameters are configured
    const twilioResult = await sendApologyWhatsApp({
      recipientPhone,
      recipientName,
      statement,
      remorseScore,
      ticketNumber: application.ticketNumber,
    });

    // Advance state machine to APOLOGY_SENT
    stateManager.updateStatus(id, 'APOLOGY_SENT');

    return NextResponse.json({
      success: true,
      status: 'APOLOGY_SENT',
      messageId: twilioResult.messageId || `MSG_${Date.now()}_SIM`,
      notConfigured: twilioResult.notConfigured,
      twilioResult,
      deliveryData: {
        applicantName,
        recipientName,
        recipientPhone,
        remorseScore,
        statement,
        ticketNumber: application.ticketNumber,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to dispatch apology' },
      { status: 500 }
    );
  }
}
