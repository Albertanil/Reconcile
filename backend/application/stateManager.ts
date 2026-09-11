import { ApplicationState, ApplicationStatus } from '@backend/types/application';
import { generateNextTicketNumber } from './ticketGenerator';

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
   * Updates an application's status and timestamp.
   * @param id - Application ID
   * @param status - New status
   */
  public updateStatus(id: string, status: ApplicationStatus): ApplicationState | undefined {
    const app = this.applications.get(id);
    if (!app) return undefined;

    const updatedApp: ApplicationState = {
      ...app,
      status,
      updatedAt: new Date().toISOString(),
    };

    this.applications.set(id, updatedApp);
    return updatedApp;
  }
}

// Export singleton instance for service layer
export const stateManager = new ApplicationStateManager();
