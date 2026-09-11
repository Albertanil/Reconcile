import { NextRequest, NextResponse } from 'next/server';
import { applicationService } from '@backend/application/applicationService';
import { InvalidStatusTransitionError } from '@backend/application/stateMachine';
import {
  CreateApplicationRequest,
  CreateApplicationResponse,
  GetApplicationResponse,
  UpdateApplicationRequest,
  UpdateApplicationResponse,
} from '@backend/types/application';

/**
 * POST /api/application
 * Thin HTTP adapter for creating a new apology application session.
 */
export async function POST(request: NextRequest): Promise<NextResponse<CreateApplicationResponse>> {
  try {
    let body: CreateApplicationRequest = {};

    try {
      body = await request.json();
    } catch {
      // Empty or non-JSON body is accepted for initial application creation
      body = {};
    }

    const application = applicationService.createApplication(body.applicantName);

    return NextResponse.json(
      {
        success: true,
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
      {
        success: false,
        error: `Failed to create application: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/application?id=... OR ?ticketNumber=...
 * Thin HTTP adapter for retrieving application details by ID or Ticket Number.
 */
export async function GET(request: NextRequest): Promise<NextResponse<GetApplicationResponse>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const ticketNumber = searchParams.get('ticketNumber');

    if (!id && !ticketNumber) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide either an "id" or "ticketNumber" query parameter.',
        },
        { status: 400 }
      );
    }

    const application = id
      ? applicationService.getApplicationById(id)
      : applicationService.getApplicationByTicketNumber(ticketNumber!);

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application not found.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch application: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/application
 * Thin HTTP adapter for application status updates, apology data updates, and submission.
 */
export async function PATCH(
  request: NextRequest
): Promise<NextResponse<UpdateApplicationResponse>> {
  try {
    let body: UpdateApplicationRequest;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON request payload.',
        },
        { status: 400 }
      );
    }

    const { id, ticketNumber, action, status, apology } = body;

    if (!id && !ticketNumber) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide either an "id" or "ticketNumber" in the request body.',
        },
        { status: 400 }
      );
    }

    const idOrTicket = { id, ticketNumber };

    // Action 1: Save/Update Apology Form Data
    if (action === 'update' || apology !== undefined) {
      if (!apology) {
        return NextResponse.json(
          {
            success: false,
            error: 'Please provide "apology" data to update.',
          },
          { status: 400 }
        );
      }

      const updatedApp = applicationService.updateApologyData(idOrTicket, apology);
      return NextResponse.json({
        success: true,
        application: updatedApp,
      });
    }

    // Action 2: Submit Apology Application
    if (action === 'submit') {
      const submittedApp = applicationService.submitApology(idOrTicket);
      return NextResponse.json({
        success: true,
        application: submittedApp,
      });
    }

    // Action 3: Status Transition (default if status is provided)
    if (status || action === 'status') {
      if (!status) {
        return NextResponse.json(
          {
            success: false,
            error: 'Please provide a target "status" in the request body.',
          },
          { status: 400 }
        );
      }

      const updatedApplication = applicationService.updateApplicationStatus(idOrTicket, status);

      if (!updatedApplication) {
        return NextResponse.json(
          {
            success: false,
            error: 'Application not found.',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        application: updatedApplication,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action or request payload. Provide "status", "apology", or action="submit".',
      },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof InvalidStatusTransitionError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    const isNotFoundError = errorMessage.includes('not found');
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: isNotFoundError ? 404 : 400 }
    );
  }
}
