import { NextRequest, NextResponse } from 'next/server';
import { applicationService } from '@backend/application/applicationService';
import { InvalidStatusTransitionError } from '@backend/application/stateMachine';
import {
  CreateApplicationRequest,
  CreateApplicationResponse,
  GetApplicationResponse,
  UpdateApplicationStatusRequest,
  UpdateApplicationStatusResponse,
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
 * Thin HTTP adapter for updating application status subject to state transition validation.
 */
export async function PATCH(
  request: NextRequest
): Promise<NextResponse<UpdateApplicationStatusResponse>> {
  try {
    let body: UpdateApplicationStatusRequest;

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

    const { id, ticketNumber, status } = body;

    if (!id && !ticketNumber) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide either an "id" or "ticketNumber" in the request body.',
        },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide a target "status" in the request body.',
        },
        { status: 400 }
      );
    }

    const updatedApplication = applicationService.updateApplicationStatus({ id, ticketNumber }, status);

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
    return NextResponse.json(
      {
        success: false,
        error: `Failed to update application status: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
