import { GeminiClerk } from '../ai/geminiClerk';
import { applicationService } from './applicationService';
import { ApologyData } from '../types/application';

async function runLiveTest() {
  console.log('=== LIVE GEMINI API & END-TO-END VERIFICATION ===\n');

  // Verify GEMINI_API_KEY is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[FAIL] GEMINI_API_KEY environment variable is not defined!');
    process.exit(1);
  }

  console.log('[PASS] GEMINI_API_KEY detected in environment (value hidden for security).');

  // 1. Test direct GeminiClerk call
  console.log('\n--- 1. Direct GeminiClerk Test ---');
  const clerk = new GeminiClerk(apiKey);

  const sampleApology: ApologyData = {
    recipient: 'My supervisor, Mr. Henderson',
    incident: 'Submitted quarterly report 2 hours late',
    whatHappened: 'I miscalculated the time required for data validation and missed the 5:00 PM deadline.',
    responsibility: 'I take full responsibility for poor time management and failing to alert you early.',
    impact: 'The team could not finalize the executive summary before the end-of-day briefing.',
    regret: 'I sincerely regret causing inconvenience and disrupting the department schedule.',
    prevention: 'I will implement a 4-hour buffer for all future reporting milestones.',
  };

  try {
    console.log('Sending apology to Gemini API...');
    let result;
    try {
      result = await clerk.evaluateApology(sampleApology);
    } catch (err) {
      if (err instanceof Error && err.message.includes('503')) {
        console.log('Gemini API returned temporary 503 (high demand). Retrying in 2 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
        result = await clerk.evaluateApology(sampleApology);
      } else {
        throw err;
      }
    }

    console.log('[PASS] Gemini response received & validated successfully!');
    console.log(`  - Remorse Score: ${result.remorseScore}/100`);
    console.log(`  - Responsibility: ${result.responsibility}`);
    console.log(`  - Impact Acknowledgment: ${result.impactAcknowledgment}`);
    console.log(`  - Regret Indicators: ${result.regretIndicators}`);
    console.log(`  - Deflection: ${result.deflection}`);
    console.log(`  - Official Assessment Summary: "${result.summary}"`);
  } catch (err) {
    console.error('[FAIL] Direct GeminiClerk evaluation failed:', err);
    process.exit(1);
  }

  // 2. Full End-to-End Orchestration Test
  console.log('\n--- 2. End-to-End Service Orchestration Test (Live Gemini) ---');
  try {
    // Step A: Create Application
    const app = applicationService.createApplication('Live Tester');
    console.log(`[PASS] Created application: ${app.id} (Ticket: ${app.ticketNumber})`);

    // Step B: Save Apology Data
    applicationService.updateApologyData({ id: app.id }, sampleApology);
    console.log('[PASS] Saved apology data -> Status: FORM_IN_PROGRESS');

    // Step C: Submit Application
    applicationService.submitApology({ id: app.id });
    console.log('[PASS] Submitted application -> Status: FORM_SUBMITTED');

    // Step D: Evaluate with Real Gemini
    console.log('Orchestrating live evaluation (FORM_SUBMITTED -> AI_INTERROGATION -> EVALUATION -> APPROVED/REJECTED)...');
    const evaluatedApp = await applicationService.evaluateApplication(app.id);

    console.log(`[PASS] End-to-End Flow Complete!`);
    console.log(`  - Final Application Status: ${evaluatedApp.status}`);
    console.log(`  - Stored Remorse Score: ${evaluatedApp.evaluation?.remorseScore}`);
    console.log(`  - Decision Rule Applied: score ${evaluatedApp.evaluation?.remorseScore} >= 70 → ${evaluatedApp.status}`);
  } catch (err) {
    console.error('[FAIL] End-to-End Live Evaluation Flow failed:', err);
    process.exit(1);
  }

  console.log('\n=== ALL LIVE GEMINI TESTS PASSED SUCCESSFULLY ===');
}

runLiveTest();
