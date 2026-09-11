let currentTicketCounter = 0;

/**
 * Formats a sequence number into a standard ticket/case number format.
 * Format: A-001, A-002, ..., A-047
 * @param count - Incrementing sequence integer
 */
export function formatTicketNumber(count: number): string {
  const paddedNumber = String(count).padStart(3, '0');
  return `A-${paddedNumber}`;
}

/**
 * Generates the next sequential ticket number for an apology application.
 * Note: Uses in-memory counter for Phase 1.
 */
export function generateNextTicketNumber(): string {
  currentTicketCounter += 1;
  return formatTicketNumber(currentTicketCounter);
}

/**
 * Resets the in-memory ticket counter (mainly for testing/reset purposes).
 */
export function resetTicketCounter(startAt = 0): void {
  currentTicketCounter = startAt;
}
