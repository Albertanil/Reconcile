import { NextRequest, NextResponse } from 'next/server';
import { applicationService } from '@backend/application/applicationService';
import { InvalidStatusTransitionError } from '@backend/application/stateMachine';

interface EvaluateResponse {
  success: boolean;
  application?: ReturnType<typeof applicationService.getApplicationById>;
  error?: string;
}

/**
 * POST /api/application/[id]/evaluate
 * Triggers AI evaluation for a submitted apology application.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
): Promise<NextResponse<EvaluateResponse>> {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required.' },
        { status: 400 }
      );
    }

    const application = await applicationService.evaluateApplication(id);

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    if (error instanceof InvalidStatusTransitionError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    const isNotFound = errorMessage.includes('not found');
    const isStateError = errorMessage.includes('must be in') || errorMessage.includes('status');

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: isNotFound ? 404 : isStateError ? 400 : 500 }
    );
  }
}
