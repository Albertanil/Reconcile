import { ApologyData } from '@backend/types/application';
import { EvaluationResult, AIClerk } from '@backend/types/evaluation';

/**
 * Mock AI Clerk implementation for testing without Gemini.
 * Returns deterministic results based on simple heuristics.
 */
export class MockClerk implements AIClerk {
  async evaluateApology(apology: ApologyData): Promise<EvaluationResult> {
    // Simple heuristic: longer, more detailed apology text scores higher
    const totalLength =
      apology.responsibility.length +
      apology.impact.length +
      apology.regret.length +
      apology.prevention.length;

    // Check for deflection patterns
    const fullText = [
      apology.whatHappened,
      apology.responsibility,
      apology.impact,
      apology.regret,
      apology.prevention,
    ].join(' ').toLowerCase();

    const hasDeflection =
      fullText.includes('sorry if') ||
      fullText.includes('not a big deal') ||
      fullText.includes('your fault') ||
      fullText.includes('you should');

    const hasResponsibility =
      fullText.includes('my fault') ||
      fullText.includes('i should have') ||
      fullText.includes('i take responsibility') ||
      fullText.includes('i was wrong');

    // Calculate mock score
    let score = Math.min(100, Math.max(0, Math.round(totalLength / 4)));
    if (hasDeflection) score = Math.max(0, score - 30);
    if (hasResponsibility) score = Math.min(100, score + 15);

    const categoryFromScore = (s: number): 'HIGH' | 'MEDIUM' | 'LOW' =>
      s >= 70 ? 'HIGH' : s >= 40 ? 'MEDIUM' : 'LOW';

    return {
      remorseScore: score,
      responsibility: hasResponsibility ? 'HIGH' : hasDeflection ? 'LOW' : 'MEDIUM',
      impactAcknowledgment: categoryFromScore(apology.impact.length * 2),
      regretIndicators: categoryFromScore(apology.regret.length * 2),
      deflection: hasDeflection ? 'HIGH' : 'LOW',
      summary: `[MOCK EVALUATION] The Department has reviewed case materials. AI-estimated remorse stands at ${score}%. ${hasDeflection ? 'Notable deflection indicators detected.' : 'No significant deflection detected.'}`,
    };
  }
}
