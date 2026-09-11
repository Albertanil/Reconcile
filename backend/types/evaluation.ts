import { ApologyData } from './application';

/**
 * Categorical evaluation level for apology quality dimensions.
 */
export type EvaluationCategory = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Structured AI evaluation result for an apology application.
 * This represents an AI-ESTIMATED assessment, not a scientific measurement of emotion.
 */
export interface EvaluationResult {
  /** AI-estimated remorse score (0–100) */
  remorseScore: number;
  /** Level of responsibility acceptance */
  responsibility: EvaluationCategory;
  /** Level of impact acknowledgment */
  impactAcknowledgment: EvaluationCategory;
  /** Strength of regret indicators */
  regretIndicators: EvaluationCategory;
  /** Degree of blame-shifting or deflection */
  deflection: EvaluationCategory;
  /** Brief official bureaucratic assessment summary */
  summary: string;
}

/**
 * AI Clerk Service Interface.
 * The application service depends on this contract, not on Gemini directly.
 */
export interface AIClerk {
  evaluateApology(apology: ApologyData): Promise<EvaluationResult>;
}

/** Approval threshold: applications with score >= this value are APPROVED */
export const APPROVAL_THRESHOLD = 70;
