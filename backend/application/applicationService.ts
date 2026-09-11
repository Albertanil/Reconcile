import { stateManager } from './stateManager';
import {
  ApplicationState,
  ApplicationStatus,
  UpdateApologyDataPayload,
} from '@backend/types/application';
import { AIClerk, EvaluationResult, APPROVAL_THRESHOLD } from '@backend/types/evaluation';
import { GeminiClerk } from '@backend/ai/geminiClerk';

/**
 * Resolves the AI Clerk implementation to use.
 * Returns GeminiClerk when GEMINI_API_KEY is configured.
 * Throws if no API key is available.
 */
function getAIClerk(): AIClerk {
  return new GeminiClerk();
}

/**
 * Service handling high-level application operations.
 */
export const applicationService = {
  /**
   * Start/Create a new apology application session.
   */
  createApplication(applicantName?: string): ApplicationState {
    return stateManager.createApplication(applicantName);
  },

  /**
   * Find an application by its unique ID.
   */
  getApplicationById(id: string): ApplicationState | undefined {
    return stateManager.getApplicationById(id);
  },

  /**
   * Find an application by its ticket number (e.g., "A-001").
   */
  getApplicationByTicketNumber(ticketNumber: string): ApplicationState | undefined {
    return stateManager.getApplicationByTicketNumber(ticketNumber);
  },

  /**
   * Update the status of an application by ID or Ticket Number.
   * Validates transition via the state machine rules.
   */
  updateApplicationStatus(
    idOrTicket: { id?: string; ticketNumber?: string },
    newStatus: ApplicationStatus
  ): ApplicationState | undefined {
    const app = idOrTicket.id
      ? stateManager.getApplicationById(idOrTicket.id)
      : idOrTicket.ticketNumber
      ? stateManager.getApplicationByTicketNumber(idOrTicket.ticketNumber)
      : undefined;

    if (!app) return undefined;

    return stateManager.updateStatus(app.id, newStatus);
  },

  /**
   * Save/Update apology form data for an application.
   */
  updateApologyData(
    idOrTicket: { id?: string; ticketNumber?: string },
    apologyData: UpdateApologyDataPayload
  ): ApplicationState {
    const app = idOrTicket.id
      ? stateManager.getApplicationById(idOrTicket.id)
      : idOrTicket.ticketNumber
      ? stateManager.getApplicationByTicketNumber(idOrTicket.ticketNumber)
      : undefined;

    if (!app) {
      throw new Error('Application not found.');
    }

    return stateManager.updateApologyData(app.id, apologyData);
  },

  /**
   * Submit an application, validating required fields and transitioning status to FORM_SUBMITTED.
   */
  submitApology(idOrTicket: { id?: string; ticketNumber?: string }): ApplicationState {
    const app = idOrTicket.id
      ? stateManager.getApplicationById(idOrTicket.id)
      : idOrTicket.ticketNumber
      ? stateManager.getApplicationByTicketNumber(idOrTicket.ticketNumber)
      : undefined;

    if (!app) {
      throw new Error('Application not found.');
    }

    return stateManager.submitApology(app.id);
  },

  /**
   * Evaluate a submitted apology application using the AI Clerk.
   *
   * Full orchestration:
   * 1. Verify application is FORM_SUBMITTED
   * 2. Transition to AI_INTERROGATION
   * 3. Call AI Clerk for structured evaluation
   * 4. Store evaluation result
   * 5. Transition to EVALUATION
   * 6. Apply deterministic decision rule (score >= threshold → APPROVED, else REJECTED)
   * 7. Transition to APPROVED or REJECTED
   *
   * If the AI call fails, the application remains in AI_INTERROGATION (recoverable).
   */
  async evaluateApplication(
    applicationId: string,
    clerkOverride?: AIClerk
  ): Promise<ApplicationState> {
    const app = stateManager.getApplicationById(applicationId);
    if (!app) {
      throw new Error('Application not found.');
    }

    if (app.status !== 'FORM_SUBMITTED') {
      throw new Error(
        `Application must be in FORM_SUBMITTED status before evaluation. Current status: "${app.status}".`
      );
    }

    if (!app.apology) {
      throw new Error('Application has no apology data to evaluate.');
    }

    // Step 1: Transition to AI_INTERROGATION
    stateManager.updateStatus(applicationId, 'AI_INTERROGATION');

    // Step 2: Call AI Clerk
    const clerk = clerkOverride || getAIClerk();
    let evaluation: EvaluationResult;

    try {
      evaluation = await clerk.evaluateApology(app.apology);
    } catch (aiError) {
      // Application remains in AI_INTERROGATION (recoverable — can retry)
      const message = aiError instanceof Error ? aiError.message : 'Unknown AI error';
      throw new Error(`AI evaluation failed: ${message}`);
    }

    // Step 3: Store evaluation result
    stateManager.storeEvaluation(applicationId, evaluation);

    // Step 4: Transition to EVALUATION
    stateManager.updateStatus(applicationId, 'EVALUATION');

    // Step 5: Apply deterministic backend decision
    const decision: ApplicationStatus =
      evaluation.remorseScore >= APPROVAL_THRESHOLD ? 'APPROVED' : 'REJECTED';

    // Step 6: Transition to final decision status
    stateManager.updateStatus(applicationId, decision);

    // Return the final application state
    return stateManager.getApplicationById(applicationId)!;
  },
};
