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
 * Core Apology Form Data structure.
 */
export interface ApologyData {
  recipient: string;
  recipientPhone?: string;
  incident: string;
  whatHappened: string;
  responsibility: string;
  impact: string;
  regret: string;
  prevention: string;
}

/**
 * Partial Apology Form Data for saving in-progress form drafts.
 */
export type UpdateApologyDataPayload = Partial<ApologyData>;

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

import { EvaluationResult } from './evaluation';

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
  apology?: ApologyData;
  evaluation?: EvaluationResult;
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
 * Request payload for PATCH /api/application (Update Status, Save Apology, or Submit)
 */
export interface UpdateApplicationRequest {
  id?: string;
  ticketNumber?: string;
  action?: 'status' | 'update' | 'submit';
  status?: ApplicationStatus;
  apology?: UpdateApologyDataPayload;
}

/**
 * Alias for backward compatibility
 */
export type UpdateApplicationStatusRequest = UpdateApplicationRequest;

/**
 * Response structure for PATCH /api/application
 */
export interface UpdateApplicationResponse {
  success: boolean;
  application?: ApplicationState;
  error?: string;
}

/**
 * Alias for backward compatibility
 */
export type UpdateApplicationStatusResponse = UpdateApplicationResponse;
