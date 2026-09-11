import { ApplicationStatus } from '@backend/types/application';

/**
 * Centralized State Transition Table.
 * Maps each current status to an array of valid target statuses.
 */
export const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLICATION_STARTED: ['WAITING'],
  WAITING: ['FORM_IN_PROGRESS'],
  FORM_IN_PROGRESS: ['FORM_SUBMITTED'],
  FORM_SUBMITTED: ['AI_INTERROGATION'],
  AI_INTERROGATION: ['EVALUATION'],
  EVALUATION: ['APPROVED', 'REJECTED'],
  REJECTED: ['APPEAL'],
  APPEAL: ['EVALUATION'],
  APPROVED: ['APOLOGY_SENT'],
  APOLOGY_SENT: [], // Terminal state
};

/**
 * Checks whether a status transition from `currentStatus` to `nextStatus` is permitted.
 */
export function canTransition(
  currentStatus: ApplicationStatus,
  nextStatus: ApplicationStatus
): boolean {
  const allowedNext = VALID_TRANSITIONS[currentStatus];
  return allowedNext ? allowedNext.includes(nextStatus) : false;
}

/**
 * Custom Error thrown when an illegal status transition is attempted.
 */
export class InvalidStatusTransitionError extends Error {
  constructor(public currentStatus: ApplicationStatus, public targetStatus: ApplicationStatus) {
    super(
      `Invalid status transition: Cannot transition application from "${currentStatus}" to "${targetStatus}".`
    );
    this.name = 'InvalidStatusTransitionError';
  }
}

/**
 * Validates a status transition. Throws InvalidStatusTransitionError if invalid.
 */
export function validateTransition(
  currentStatus: ApplicationStatus,
  nextStatus: ApplicationStatus
): void {
  if (!canTransition(currentStatus, nextStatus)) {
    throw new InvalidStatusTransitionError(currentStatus, nextStatus);
  }
}
