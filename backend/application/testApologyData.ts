import { ApplicationStateManager } from './stateManager';
import { ApologyData } from '../types/application';

function runTests() {
  console.log('--- Phase 2B Apology Data & Submission Verification ---');

  const manager = new ApplicationStateManager();
  let passed = 0;
  let failed = 0;

  // 1. Create Application
  const app = manager.createApplication('Albert');
  console.log(`Created Application ID: ${app.id}, Status: ${app.status}, Ticket: ${app.ticketNumber}`);
  if (app.status === 'APPLICATION_STARTED') passed++; else failed++;

  // 2. Save Partial Apology Data -> Status becomes FORM_IN_PROGRESS
  const updatedApp = manager.updateApologyData(app.id, {
    recipient: 'Friend',
    incident: 'Late for lunch meeting',
    whatHappened: 'I slept past my alarm clock.',
  });

  console.log(`Updated Apology Status: ${updatedApp.status}`);
  if (updatedApp.status === 'FORM_IN_PROGRESS' && updatedApp.apology?.recipient === 'Friend') {
    console.log('[PASS] Apology data updated & status advanced to FORM_IN_PROGRESS');
    passed++;
  } else {
    console.error('[FAIL] Apology update failed');
    failed++;
  }

  // 3. Attempt submission with missing/empty fields -> Should Fail
  try {
    manager.submitApology(app.id);
    console.error('[FAIL] Submission succeeded with missing fields');
    failed++;
  } catch (err) {
    if (err instanceof Error && err.message.includes('missing or empty')) {
      console.log(`[PASS] Blocked submission with missing fields: ${err.message}`);
      passed++;
    } else {
      console.error('[FAIL] Unexpected error on incomplete submission:', err);
      failed++;
    }
  }

  // 4. Fill remaining required fields with whitespace test
  try {
    manager.updateApologyData(app.id, {
      responsibility: '   ', // whitespace only test
      impact: 'Made them wait alone',
      regret: 'Deeply sorry for being careless',
      prevention: 'Set 3 alarms next time',
    });
    manager.submitApology(app.id);
    console.error('[FAIL] Submission succeeded with whitespace-only field');
    failed++;
  } catch (err) {
    if (err instanceof Error && err.message.includes('missing or empty')) {
      console.log(`[PASS] Blocked submission with whitespace-only field.`);
      passed++;
    } else {
      console.error('[FAIL] Unexpected error on whitespace submission:', err);
      failed++;
    }
  }

  // 5. Complete all required fields properly & submit
  manager.updateApologyData(app.id, {
    responsibility: 'I take full responsibility for not setting my alarm properly.',
  });

  const submittedApp = manager.submitApology(app.id);
  console.log(`Submitted Application Status: ${submittedApp.status}`);
  if (submittedApp.status === 'FORM_SUBMITTED' && submittedApp.apology?.responsibility) {
    console.log('[PASS] Successful apology submission & transition to FORM_SUBMITTED');
    passed++;
  } else {
    console.error('[FAIL] Submission failed');
    failed++;
  }

  // 6. State Protection: Attempt editing after FORM_SUBMITTED -> Should Fail
  try {
    manager.updateApologyData(app.id, {
      recipient: 'Changed Recipient',
    });
    console.error('[FAIL] Allowed editing apology data after FORM_SUBMITTED');
    failed++;
  } catch (err) {
    if (err instanceof Error && err.message.includes('can no longer be edited')) {
      console.log(`[PASS] Blocked editing apology data after submission: ${err.message}`);
      passed++;
    } else {
      console.error('[FAIL] Unexpected error on post-submission edit:', err);
      failed++;
    }
  }

  console.log(`\nTest Summary: ${passed} Passed, ${failed} Failed.`);
}

runTests();
