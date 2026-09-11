import { stateManager } from './stateManager';
import { ApplicationState } from '@backend/types/application';

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
};
