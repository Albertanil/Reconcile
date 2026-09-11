import { GoogleGenAI, Type } from '@google/genai';
import { ApologyData } from '@backend/types/application';
import { EvaluationResult, AIClerk } from '@backend/types/evaluation';
import { CLERK_SYSTEM_INSTRUCTION, buildEvaluationPrompt } from './prompts';
import { validateEvaluationResult } from './validation';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

/**
 * JSON schema definition for Gemini structured output.
 */
const EVALUATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    remorseScore: {
      type: Type.NUMBER,
      description: 'AI-estimated remorse score from 0 to 100',
    },
    responsibility: {
      type: Type.STRING,
      description: 'Level of responsibility acceptance: HIGH, MEDIUM, or LOW',
      enum: ['HIGH', 'MEDIUM', 'LOW'],
    },
    impactAcknowledgment: {
      type: Type.STRING,
      description: 'Level of impact acknowledgment: HIGH, MEDIUM, or LOW',
      enum: ['HIGH', 'MEDIUM', 'LOW'],
    },
    regretIndicators: {
      type: Type.STRING,
      description: 'Strength of regret indicators: HIGH, MEDIUM, or LOW',
      enum: ['HIGH', 'MEDIUM', 'LOW'],
    },
    deflection: {
      type: Type.STRING,
      description: 'Degree of blame-shifting or deflection: HIGH, MEDIUM, or LOW',
      enum: ['HIGH', 'MEDIUM', 'LOW'],
    },
    summary: {
      type: Type.STRING,
      description: 'Brief official bureaucratic assessment summary of the apology quality',
    },
  },
  required: [
    'remorseScore',
    'responsibility',
    'impactAcknowledgment',
    'regretIndicators',
    'deflection',
    'summary',
  ],
};

/**
 * Real Gemini-powered AI Clerk implementation.
 * Calls gemini-2.5-flash with structured JSON output and validates the result.
 */
export class GeminiClerk implements AIClerk {
  private client: GoogleGenAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('Gemini API configuration is missing. Set the GEMINI_API_KEY environment variable.');
    }
    this.client = new GoogleGenAI({ apiKey: key });
  }

  async evaluateApology(apology: ApologyData): Promise<EvaluationResult> {
    const userPrompt = buildEvaluationPrompt(apology);

    let responseText: string;

    try {
      const response = await this.client.models.generateContent({
        model: GEMINI_MODEL,
        contents: userPrompt,
        config: {
          systemInstruction: CLERK_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: EVALUATION_SCHEMA,
        },
      });

      responseText = response.text ?? '';
    } catch (sdkError) {
      const message = sdkError instanceof Error ? sdkError.message : 'Unknown Gemini API error';
      // Do not expose raw SDK internals or API keys
      throw new Error(`AI evaluation failed: ${message}`);
    }

    if (!responseText) {
      throw new Error('AI evaluation failed: Gemini returned an empty response.');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      throw new Error('AI evaluation failed: Gemini returned invalid JSON.');
    }

    // Validate schema + semantics
    return validateEvaluationResult(parsed);
  }
}
