/**
 * Application Lifecycle Statuses according to the state machine architecture.
 */
export type ApplicationStatus =
  | 'APPLICATION_STARTED'
  | 'APPLICATION_SUBMITTED'
  | 'CLERK_INTERVIEW'
  | 'EVALUATION'
  | 'REJECTED'
  | 'APPROVED'
  | 'APPEAL'
  | 'AUTHORIZED'
  | 'DISPATCH'
  | 'COMPLETE';

/**
 * Details of the apology recipient.
 */
export interface RecipientInfo {
  name?: string;
  phoneNumber?: string;
  relationship?: string;
}

/**
 * Basic applicant answers submitted in the apology application form.
 */
export interface ApplicationAnswers {
  offenseDescription?: string;
  perceivedImpact?: string;
  priorApologiesCount?: number;
  [key: string]: unknown;
}

/**
 * Core Application State interface for tracking apology applications.
 */
export interface ApplicationState {
  id: string;
  ticketNumber: string;
  applicantName?: string;
  status: ApplicationStatus;
  answers?: ApplicationAnswers;
  apologyText?: string;
  recipient?: RecipientInfo;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request payload for POST /api/application (Create Application)
 */
export interface CreateApplicationRequest {
  applicantName?: string;
}

/**
 * Response structure for POST /api/application
 */
export interface CreateApplicationResponse {
  success: boolean;
  application?: ApplicationState;
  error?: string;
}

/**
 * Response structure for GET /api/application
 */
export interface GetApplicationResponse {
  success: boolean;
  application?: ApplicationState;
  error?: string;
}
