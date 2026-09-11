import { EvaluationResult, EvaluationCategory } from '@backend/types/evaluation';

const VALID_CATEGORIES: EvaluationCategory[] = ['HIGH', 'MEDIUM', 'LOW'];

/**
 * Validates a raw AI evaluation result object.
 * Ensures score is 0–100, categories are HIGH|MEDIUM|LOW, and summary is non-empty.
 * Throws a descriptive error on invalid data.
 */
export function validateEvaluationResult(raw: unknown): EvaluationResult {
  if (!raw || typeof raw !== 'object') {
    throw new Error('AI evaluation returned invalid data: expected an object.');
  }

  const obj = raw as Record<string, unknown>;

  // Validate remorseScore
  const score = obj.remorseScore;
  if (typeof score !== 'number' || !Number.isFinite(score)) {
    throw new Error('AI evaluation returned invalid data: remorseScore must be a finite number.');
  }
  if (score < 0 || score > 100) {
    throw new Error(
      `AI evaluation returned invalid data: remorseScore ${score} is outside valid range 0–100.`
    );
  }

  // Validate categorical fields
  const categoryFields: (keyof EvaluationResult)[] = [
    'responsibility',
    'impactAcknowledgment',
    'regretIndicators',
    'deflection',
  ];

  for (const field of categoryFields) {
    const value = obj[field];
    if (typeof value !== 'string' || !VALID_CATEGORIES.includes(value as EvaluationCategory)) {
      throw new Error(
        `AI evaluation returned invalid data: "${field}" must be one of HIGH, MEDIUM, LOW. Got: "${String(value)}".`
      );
    }
  }

  // Validate summary
  const summary = obj.summary;
  if (typeof summary !== 'string' || summary.trim() === '') {
    throw new Error('AI evaluation returned invalid data: summary must be a non-empty string.');
  }

  return {
    remorseScore: Math.round(score),
    responsibility: obj.responsibility as EvaluationCategory,
    impactAcknowledgment: obj.impactAcknowledgment as EvaluationCategory,
    regretIndicators: obj.regretIndicators as EvaluationCategory,
    deflection: obj.deflection as EvaluationCategory,
    summary: summary.trim(),
  };
}
