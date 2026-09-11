import { ApplicationStatus } from '../types/application';
import { canTransition, validateTransition, InvalidStatusTransitionError } from './stateMachine';
import { ApplicationStateManager } from './stateManager';

function runTests() {
  console.log('--- Phase 2A State Machine Verification ---');

  // Test valid transitions matrix
  const validSequence: { from: ApplicationStatus; to: ApplicationStatus }[] = [
    { from: 'APPLICATION_STARTED', to: 'WAITING' },
    { from: 'WAITING', to: 'FORM_IN_PROGRESS' },
    { from: 'FORM_IN_PROGRESS', to: 'FORM_SUBMITTED' },
    { from: 'FORM_SUBMITTED', to: 'AI_INTERROGATION' },
    { from: 'AI_INTERROGATION', to: 'EVALUATION' },
    { from: 'EVALUATION', to: 'APPROVED' },
    { from: 'EVALUATION', to: 'REJECTED' },
    { from: 'REJECTED', to: 'APPEAL' },
    { from: 'APPEAL', to: 'EVALUATION' },
    { from: 'APPROVED', to: 'APOLOGY_SENT' },
  ];

  let passed = 0;
  let failed = 0;

  for (const step of validSequence) {
    if (canTransition(step.from, step.to)) {
      console.log(`[PASS] Valid transition: ${step.from} -> ${step.to}`);
      passed++;
    } else {
      console.error(`[FAIL] Expected valid transition failed: ${step.from} -> ${step.to}`);
      failed++;
    }
  }

  // Test invalid transitions
  const invalidSequence: { from: ApplicationStatus; to: ApplicationStatus }[] = [
    { from: 'APPLICATION_STARTED', to: 'APOLOGY_SENT' },
    { from: 'WAITING', to: 'APPROVED' },
    { from: 'FORM_SUBMITTED', to: 'APOLOGY_SENT' },
    { from: 'REJECTED', to: 'APOLOGY_SENT' },
    { from: 'APOLOGY_SENT', to: 'APPLICATION_STARTED' },
  ];

  for (const step of invalidSequence) {
    if (!canTransition(step.from, step.to)) {
      console.log(`[PASS] Correctly blocked invalid transition: ${step.from} -> ${step.to}`);
      passed++;
    } else {
      console.error(`[FAIL] Allowed invalid transition: ${step.from} -> ${step.to}`);
      failed++;
    }
  }

  // Test stateManager enforcement
  const manager = new ApplicationStateManager();
  const app = manager.createApplication('Test User');
  console.log(`Initial status: ${app.status}, Ticket: ${app.ticketNumber}`);

  try {
    manager.updateStatus(app.id, 'WAITING');
    console.log(`[PASS] stateManager transition to WAITING successful.`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] stateManager valid transition failed:`, err);
    failed++;
  }

  try {
    manager.updateStatus(app.id, 'APOLOGY_SENT');
    console.error(`[FAIL] stateManager allowed invalid transition to APOLOGY_SENT.`);
    failed++;
  } catch (err) {
    if (err instanceof InvalidStatusTransitionError) {
      console.log(`[PASS] stateManager caught InvalidStatusTransitionError correctly.`);
      passed++;
    } else {
      console.error(`[FAIL] stateManager threw unexpected error:`, err);
      failed++;
    }
  }

  console.log(`\nTest Summary: ${passed} Passed, ${failed} Failed.`);
}

runTests();
