import { ApplicationStateManager } from './stateManager';
import { MockClerk } from '../ai/mockClerk';
import { validateEvaluationResult } from '../ai/validation';
import { applicationService } from './applicationService';
import { ApologyData } from '../types/application';
import { EvaluationResult, APPROVAL_THRESHOLD } from '../types/evaluation';

function runTests() {
  console.log('=== Phase 3+4 AI Clerk & Evaluation Verification ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, label: string) {
    if (condition) {
      console.log(`[PASS] ${label}`);
      passed++;
    } else {
      console.error(`[FAIL] ${label}`);
      failed++;
    }
  }

  // ── Test 1: Validation — Valid evaluation result ──
  console.log('\n--- Validation Tests ---');

  const validResult = {
    remorseScore: 85,
    responsibility: 'HIGH',
    impactAcknowledgment: 'HIGH',
    regretIndicators: 'MEDIUM',
    deflection: 'LOW',
    summary: 'The applicant demonstrates satisfactory remorse.',
  };

  try {
    const validated = validateEvaluationResult(validResult);
    assert(validated.remorseScore === 85, 'Valid result: score preserved');
    assert(validated.responsibility === 'HIGH', 'Valid result: responsibility preserved');
    assert(validated.summary.length > 0, 'Valid result: summary preserved');
  } catch (err) {
    assert(false, `Valid result should not throw: ${err}`);
  }

  // ── Test 2: Validation — Score out of range ──
  try {
    validateEvaluationResult({ ...validResult, remorseScore: 150 });
    assert(false, 'Score 150 should be rejected');
  } catch (err) {
    assert(err instanceof Error && err.message.includes('outside valid range'), 'Score 150 rejected correctly');
  }

  try {
    validateEvaluationResult({ ...validResult, remorseScore: -5 });
    assert(false, 'Score -5 should be rejected');
  } catch (err) {
    assert(err instanceof Error && err.message.includes('outside valid range'), 'Score -5 rejected correctly');
  }

  // ── Test 3: Validation — Invalid category ──
  try {
    validateEvaluationResult({ ...validResult, responsibility: 'EXTREME' });
    assert(false, 'Category EXTREME should be rejected');
  } catch (err) {
    assert(err instanceof Error && err.message.includes('must be one of'), 'Category EXTREME rejected correctly');
  }

  // ── Test 4: Validation — Empty summary ──
  try {
    validateEvaluationResult({ ...validResult, summary: '   ' });
    assert(false, 'Whitespace-only summary should be rejected');
  } catch (err) {
    assert(err instanceof Error && err.message.includes('non-empty'), 'Whitespace summary rejected correctly');
  }

  // ── Test 5: Validation — Non-object input ──
  try {
    validateEvaluationResult('not an object');
    assert(false, 'String input should be rejected');
  } catch (err) {
    assert(err instanceof Error && err.message.includes('expected an object'), 'String input rejected correctly');
  }

  // ── Test 6: Validation — NaN score ──
  try {
    validateEvaluationResult({ ...validResult, remorseScore: NaN });
    assert(false, 'NaN score should be rejected');
  } catch (err) {
    assert(err instanceof Error && err.message.includes('finite number'), 'NaN score rejected correctly');
  }

  // ── Test 7: Mock Clerk — Strong apology ──
  console.log('\n--- Mock Clerk Tests ---');

  const mockClerk = new MockClerk();

  const strongApology: ApologyData = {
    recipient: 'My best friend Sarah',
    incident: 'Forgot her birthday party',
    whatHappened: 'I completely forgot about the party she had been planning for weeks. I was wrong to not check my calendar.',
    responsibility: 'I take full responsibility for not paying attention. I should have set a reminder. This is entirely my fault.',
    impact: 'She was deeply hurt that I did not come. It made her feel unappreciated and unimportant to me.',
    regret: 'I deeply regret missing something so meaningful to her. I feel terrible about causing her pain.',
    prevention: 'I have set up recurring calendar reminders for all important dates. I will also check in with her weekly.',
  };

  mockClerk.evaluateApology(strongApology).then((result) => {
    assert(result.remorseScore >= 50, `Strong apology score: ${result.remorseScore} (expected >= 50)`);
    assert(result.responsibility === 'HIGH', `Strong apology responsibility: ${result.responsibility}`);
    assert(result.deflection === 'LOW', `Strong apology deflection: ${result.deflection}`);

    // ── Test 8: Mock Clerk — Weak apology ──
    const weakApology: ApologyData = {
      recipient: 'Someone',
      incident: 'Something',
      whatHappened: 'I mean things got complicated. You know how it is.',
      responsibility: 'I am sorry if you were offended. It was not a big deal.',
      impact: 'I guess maybe.',
      regret: 'Sorry.',
      prevention: 'Ok.',
    };

    return mockClerk.evaluateApology(weakApology);
  }).then((weakResult) => {
    assert(weakResult.remorseScore < 70, `Weak apology score: ${weakResult.remorseScore} (expected < 70)`);
    assert(weakResult.deflection === 'HIGH', `Weak apology deflection: ${weakResult.deflection}`);

    // ── Test 9: Full flow with Mock — evaluateApplication ──
    console.log('\n--- Full Evaluation Flow Tests (Mock) ---');

    return runFlowTests();
  }).then(({ flowPassed, flowFailed }) => {
    passed += flowPassed;
    failed += flowFailed;

    console.log(`\n=== FINAL SUMMARY: ${passed} Passed, ${failed} Failed ===`);
  }).catch((err) => {
    console.error('Test runner error:', err);
  });
}

async function runFlowTests(): Promise<{ flowPassed: number; flowFailed: number }> {
  let flowPassed = 0;
  let flowFailed = 0;

  function assert(condition: boolean, label: string) {
    if (condition) {
      console.log(`[PASS] ${label}`);
      flowPassed++;
    } else {
      console.error(`[FAIL] ${label}`);
      flowFailed++;
    }
  }

  const mockClerk = new MockClerk();

  // Create and submit a strong application
  const app = applicationService.createApplication('Test Subject Alpha');
  assert(app.status === 'APPLICATION_STARTED', `Created application: ${app.ticketNumber}`);

  applicationService.updateApologyData({ id: app.id }, {
    recipient: 'My colleague Maria',
    incident: 'Missed the project deadline',
    whatHappened: 'I failed to complete my part of the project on time because I procrastinated. I was wrong.',
    responsibility: 'I take full responsibility. I should have managed my time better and communicated earlier.',
    impact: 'The entire team had to work overtime to compensate for my failure. Maria had to cancel her weekend plans.',
    regret: 'I deeply regret causing stress and extra work for the team. I feel truly ashamed of my irresponsibility.',
    prevention: 'I have created a detailed project timeline with intermediate checkpoints and will send daily progress updates.',
  });

  applicationService.submitApology({ id: app.id });
  const submitted = applicationService.getApplicationById(app.id)!;
  assert(submitted.status === 'FORM_SUBMITTED', `Application submitted: ${submitted.status}`);

  // Evaluate using mock clerk
  const evaluated = await applicationService.evaluateApplication(app.id, mockClerk);
  assert(
    evaluated.status === 'APPROVED' || evaluated.status === 'REJECTED',
    `Evaluation complete: status=${evaluated.status}`
  );
  assert(evaluated.evaluation !== undefined, 'Evaluation result stored on application');
  assert(
    typeof evaluated.evaluation?.remorseScore === 'number',
    `Remorse score: ${evaluated.evaluation?.remorseScore}`
  );

  console.log(`  Decision: ${evaluated.status} (score: ${evaluated.evaluation?.remorseScore}, threshold: ${APPROVAL_THRESHOLD})`);

  // ── Test: Cannot evaluate non-submitted application ──
  const app2 = applicationService.createApplication('Test Subject Beta');
  try {
    await applicationService.evaluateApplication(app2.id, mockClerk);
    assert(false, 'Should not evaluate non-FORM_SUBMITTED application');
  } catch (err) {
    assert(
      err instanceof Error && err.message.includes('must be in FORM_SUBMITTED'),
      `Blocked evaluation of non-submitted app: ${(err as Error).message}`
    );
  }

  // ── Test: Existing APIs still work ──
  console.log('\n--- Existing API Regression ---');
  const app3 = applicationService.createApplication('Regression Tester');
  assert(app3.ticketNumber.startsWith('A-'), `Ticket generated: ${app3.ticketNumber}`);

  const found = applicationService.getApplicationByTicketNumber(app3.ticketNumber);
  assert(found?.id === app3.id, `GET by ticketNumber works`);

  const foundById = applicationService.getApplicationById(app3.id);
  assert(foundById?.id === app3.id, `GET by id works`);

  const statusUpdated = applicationService.updateApplicationStatus({ id: app3.id }, 'WAITING');
  assert(statusUpdated?.status === 'WAITING', `Status transition works: ${statusUpdated?.status}`);

  return { flowPassed, flowFailed };
}

runTests();
