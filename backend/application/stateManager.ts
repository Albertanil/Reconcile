import {
  ApplicationState,
  ApplicationStatus,
  ApologyData,
  UpdateApologyDataPayload,
} from '@backend/types/application';
import { EvaluationResult } from '@backend/types/evaluation';
import { generateNextTicketNumber } from './ticketGenerator';
import { validateTransition } from './stateMachine';

const REQUIRED_APOLOGY_FIELDS: (keyof ApologyData)[] = [
  'recipient',
  'incident',
  'whatHappened',
  'responsibility',
  'impact',
  'regret',
  'prevention',
];

const EDITABLE_STATUSES: ApplicationStatus[] = [
  'APPLICATION_STARTED',
  'WAITING',
  'FORM_IN_PROGRESS',
];

/**
 * In-Memory Application Store.
 * 
 * IMPORTANT ARCHITECTURAL NOTE:
 * This in-memory Map provides simple session/application state tracking for rapid hackathon iteration.
 * Note that state will reset upon server restart or across serverless function re-isolations.
 */
export class ApplicationStateManager {
  private applications: Map<string, ApplicationState> = new Map();

  /**
   * Creates a new apology application session.
   * @param applicantName - Optional name of the applicant
   */
  public createApplication(applicantName?: string): ApplicationState {
    const id = `app_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const ticketNumber = generateNextTicketNumber();
    const now = new Date().toISOString();

    const newApplication: ApplicationState = {
      id,
      ticketNumber,
      applicantName: applicantName?.trim() || 'Anonymous Applicant',
      status: 'APPLICATION_STARTED',
      createdAt: now,
      updatedAt: now,
    };

    this.applications.set(id, newApplication);
    return newApplication;
  }

  /**
   * Retrieves an application state by its unique ID.
   * @param id - Application ID
   */
  public getApplicationById(id: string): ApplicationState | undefined {
    return this.applications.get(id);
  }

  /**
   * Retrieves an application state by its ticket number (e.g., "A-001").
   * @param ticketNumber - Ticket number
   */
  public getApplicationByTicketNumber(ticketNumber: string): ApplicationState | undefined {
    const formatted = ticketNumber.trim().toUpperCase();
    return Array.from(this.applications.values()).find(
      (app) => app.ticketNumber.toUpperCase() === formatted
    );
  }

  /**
   * Updates an application's status after validating state machine transition rules.
   * Throws InvalidStatusTransitionError if the transition is illegal.
   * 
   * @param id - Application ID
   * @param status - Target status
   */
  public updateStatus(id: string, status: ApplicationStatus): ApplicationState | undefined {
    const app = this.applications.get(id);
    if (!app) return undefined;

    // Enforce state transition rules
    validateTransition(app.status, status);

    const updatedApp: ApplicationState = {
      ...app,
      status,
      updatedAt: new Date().toISOString(),
    };

    this.applications.set(id, updatedApp);
    return updatedApp;
  }

  /**
   * Saves or updates apology form data while the application is in progress.
   * Restricts editing to pre-submission states (APPLICATION_STARTED, WAITING, FORM_IN_PROGRESS).
   */
  public updateApologyData(
    id: string,
    payload: UpdateApologyDataPayload
  ): ApplicationState {
    const app = this.applications.get(id);
    if (!app) {
      throw new Error('Application not found.');
    }

    if (!EDITABLE_STATUSES.includes(app.status)) {
      throw new Error(
        `Cannot modify apology data: Application is currently in "${app.status}" status and can no longer be edited.`
      );
    }

    // Progress status to FORM_IN_PROGRESS if currently in APPLICATION_STARTED or WAITING
    let currentStatus = app.status;
    if (currentStatus === 'APPLICATION_STARTED') {
      validateTransition('APPLICATION_STARTED', 'WAITING');
      currentStatus = 'WAITING';
    }
    if (currentStatus === 'WAITING') {
      validateTransition('WAITING', 'FORM_IN_PROGRESS');
      currentStatus = 'FORM_IN_PROGRESS';
    }

    const existingApology = app.apology || {
      recipient: '',
      recipientPhone: '',
      incident: '',
      whatHappened: '',
      responsibility: '',
      impact: '',
      regret: '',
      prevention: '',
    };

    const updatedApology: ApologyData = {
      recipient: payload.recipient !== undefined ? payload.recipient : existingApology.recipient,
      recipientPhone: payload.recipientPhone !== undefined ? payload.recipientPhone : existingApology.recipientPhone,
      incident: payload.incident !== undefined ? payload.incident : existingApology.incident,
      whatHappened: payload.whatHappened !== undefined ? payload.whatHappened : existingApology.whatHappened,
      responsibility: payload.responsibility !== undefined ? payload.responsibility : existingApology.responsibility,
      impact: payload.impact !== undefined ? payload.impact : existingApology.impact,
      regret: payload.regret !== undefined ? payload.regret : existingApology.regret,
      prevention: payload.prevention !== undefined ? payload.prevention : existingApology.prevention,
    };

    const updatedApp: ApplicationState = {
      ...app,
      status: currentStatus,
      apology: updatedApology,
      updatedAt: new Date().toISOString(),
    };

    this.applications.set(id, updatedApp);
    return updatedApp;
  }

  /**
   * Validates required apology fields and submits the application, transitioning status to FORM_SUBMITTED.
   */
  public submitApology(id: string): ApplicationState {
    const app = this.applications.get(id);
    if (!app) {
      throw new Error('Application not found.');
    }

    if (!EDITABLE_STATUSES.includes(app.status)) {
      throw new Error(
        `Cannot submit application: Application has already been submitted or processed (current status: "${app.status}").`
      );
    }

    const apology = app.apology;
    if (!apology) {
      throw new Error('Cannot submit application: Apology form data has not been provided.');
    }

    // Validate required fields are present and non-empty after trimming
    for (const field of REQUIRED_APOLOGY_FIELDS) {
      const val = apology[field];
      if (!val || typeof val !== 'string' || val.trim() === '') {
        throw new Error(
          `Cannot submit application: Required apology field "${field}" is missing or empty.`
        );
      }
    }

    // Advance to FORM_IN_PROGRESS if needed before transitioning to FORM_SUBMITTED
    let currentStatus = app.status;
    if (currentStatus === 'APPLICATION_STARTED') {
      validateTransition('APPLICATION_STARTED', 'WAITING');
      currentStatus = 'WAITING';
    }
    if (currentStatus === 'WAITING') {
      validateTransition('WAITING', 'FORM_IN_PROGRESS');
      currentStatus = 'FORM_IN_PROGRESS';
    }

    // Enforce transition to FORM_SUBMITTED via state machine
    validateTransition(currentStatus, 'FORM_SUBMITTED');

    // Trim all fields for clean submission state
    const trimmedApology: ApologyData = {
      recipient: apology.recipient.trim(),
      recipientPhone: apology.recipientPhone ? apology.recipientPhone.trim() : '',
      incident: apology.incident.trim(),
      whatHappened: apology.whatHappened.trim(),
      responsibility: apology.responsibility.trim(),
      impact: apology.impact.trim(),
      regret: apology.regret.trim(),
      prevention: apology.prevention.trim(),
    };

    const updatedApp: ApplicationState = {
      ...app,
      status: 'FORM_SUBMITTED',
      apology: trimmedApology,
      updatedAt: new Date().toISOString(),
    };

    this.applications.set(id, updatedApp);
    return updatedApp;
  }
  /**
   * Stores an AI evaluation result on an application.
   * @param id - Application ID
   * @param evaluation - Validated AI evaluation result
   */
  public storeEvaluation(id: string, evaluation: EvaluationResult): ApplicationState {
    const app = this.applications.get(id);
    if (!app) {
      throw new Error('Application not found.');
    }

    const updatedApp: ApplicationState = {
      ...app,
      evaluation,
      updatedAt: new Date().toISOString(),
    };

    this.applications.set(id, updatedApp);
    return updatedApp;
  }
}

// Preserve singleton instance across Next.js dev mode hot-reloads
const globalForStateManager = globalThis as unknown as {
  stateManager: ApplicationStateManager | undefined;
};

export const stateManager =
  globalForStateManager.stateManager ?? new ApplicationStateManager();

if (process.env.NODE_ENV !== 'production') {
  globalForStateManager.stateManager = stateManager;
}
