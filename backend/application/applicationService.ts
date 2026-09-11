import { stateManager } from './stateManager';
import { ApplicationState, ApplicationStatus } from '@backend/types/application';

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
};
