import { NextRequest, NextResponse } from 'next/server';
import { applicationService } from '@backend/application/applicationService';
import {
  CreateApplicationRequest,
  CreateApplicationResponse,
  GetApplicationResponse,
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
