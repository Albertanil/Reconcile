/**
 * Application Lifecycle Statuses according to the state machine architecture.
 */
export type ApplicationStatus =
  | 'APPLICATION_STARTED'
  | 'WAITING'
  | 'FORM_IN_PROGRESS'
  | 'FORM_SUBMITTED'
  | 'AI_INTERROGATION'
  | 'EVALUATION'
  | 'APPROVED'
  | 'REJECTED'
  | 'APPEAL'
  | 'APOLOGY_SENT';

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

/**
 * Request payload for PATCH /api/application (Update Application Status)
 */
export interface UpdateApplicationStatusRequest {
  id?: string;
  ticketNumber?: string;
  status: ApplicationStatus;
}

/**
 * Response structure for PATCH /api/application
 */
export interface UpdateApplicationStatusResponse {
  success: boolean;
  application?: ApplicationState;
  error?: string;
}
