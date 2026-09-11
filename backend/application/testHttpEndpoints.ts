async function testHttpEndpoints() {
  console.log('=== HTTP REST API END-TO-END VERIFICATION ===\n');

  const PORT = process.env.PORT || '3001';
  const BASE_URL = `http://localhost:${PORT}/api/application`;
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

  try {
    // 1. POST /api/application (Create Application)
    console.log('1. POST /api/application');
    const resCreate = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicantName: 'HTTP Tester Jane' }),
    });

    assert(resCreate.status === 201, `POST /api/application status: ${resCreate.status}`);
    const dataCreate = await resCreate.json();
    assert(dataCreate.success === true, 'Response success: true');
    assert(typeof dataCreate.application.id === 'string', `Application ID: ${dataCreate.application.id}`);
    assert(dataCreate.application.ticketNumber.startsWith('A-'), `Ticket number: ${dataCreate.application.ticketNumber}`);
    assert(dataCreate.application.status === 'APPLICATION_STARTED', `Status: ${dataCreate.application.status}`);

    const appId = dataCreate.application.id;
    const ticketNum = dataCreate.application.ticketNumber;

    // 2. GET /api/application?id=...
    console.log('\n2. GET /api/application?id=...');
    const resGetId = await fetch(`${BASE_URL}?id=${appId}`);
    assert(resGetId.status === 200, `GET ?id=... status: ${resGetId.status}`);
    const dataGetId = await resGetId.json();
    assert(dataGetId.application.id === appId, 'Fetched application matches ID');

    // 3. GET /api/application?ticketNumber=...
    console.log('\n3. GET /api/application?ticketNumber=...');
    const resGetTicket = await fetch(`${BASE_URL}?ticketNumber=${ticketNum}`);
    assert(resGetTicket.status === 200, `GET ?ticketNumber=... status: ${resGetTicket.status}`);
    const dataGetTicket = await resGetTicket.json();
    assert(dataGetTicket.application.ticketNumber === ticketNum, 'Fetched application matches Ticket Number');

    // 4. PATCH /api/application (Update Apology Data)
    console.log('\n4. PATCH /api/application (update apology data)');
    const sampleApology = {
      recipient: 'Project Manager Bob',
      incident: 'Missed client sync call',
      whatHappened: 'I got stuck on a critical deployment and forgot to join the client sync call.',
      responsibility: 'I am entirely at fault for failing to notify Bob before the meeting started.',
      impact: 'Bob had to cover for me unprepared and the client was confused by my absence.',
      regret: 'I deeply regret putting Bob in a stressful position and risking our client relationship.',
      prevention: 'I will delegate deployment tasks prior to scheduled meetings and set double calendar alarms.',
    };

    const resUpdate = await fetch(BASE_URL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: appId,
        action: 'update',
        apology: sampleApology,
      }),
    });

    assert(resUpdate.status === 200, `PATCH (update) status: ${resUpdate.status}`);
    const dataUpdate = await resUpdate.json();
    assert(dataUpdate.application.status === 'FORM_IN_PROGRESS', `Status advanced to FORM_IN_PROGRESS`);
    assert(dataUpdate.application.apology.recipient === 'Project Manager Bob', 'Apology data stored correctly');

    // 5. PATCH /api/application (Submit Apology Application)
    console.log('\n5. PATCH /api/application (action=submit)');
    const resSubmit = await fetch(BASE_URL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: appId,
        action: 'submit',
      }),
    });

    assert(resSubmit.status === 200, `PATCH (submit) status: ${resSubmit.status}`);
    const dataSubmit = await resSubmit.json();
    assert(dataSubmit.application.status === 'FORM_SUBMITTED', `Status advanced to FORM_SUBMITTED`);

    // 6. POST-SUBMISSION PROTECTION CHECK
    console.log('\n6. Post-Submission Protection Test');
    const resEditAfterSubmit = await fetch(BASE_URL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: appId,
        action: 'update',
        apology: { ...sampleApology, recipient: 'Hacked Recipient' },
      }),
    });

    assert(resEditAfterSubmit.status === 400, `Edit after submit blocked with 400 status`);
    const dataEditAfterSubmit = await resEditAfterSubmit.json();
    assert(dataEditAfterSubmit.success === false, 'Blocked response success: false');

    // 7. POST /api/application/[id]/evaluate (Trigger Live Gemini Evaluation over HTTP)
    console.log('\n7. POST /api/application/[id]/evaluate (Live Gemini HTTP trigger)');
    const resEvaluate = await fetch(`http://localhost:${PORT}/api/application/${appId}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const dataEvaluate = await resEvaluate.json();
    if (resEvaluate.status !== 200) {
      console.log('Evaluate API Error Response:', dataEvaluate);
    }
    assert(resEvaluate.status === 200, `POST /evaluate status: ${resEvaluate.status}`);
    assert(dataEvaluate.success === true, 'Evaluate endpoint success: true');
    assert(
      dataEvaluate.application.status === 'APPROVED' || dataEvaluate.application.status === 'REJECTED',
      `Final status after AI evaluation: ${dataEvaluate.application.status}`
    );
    assert(typeof dataEvaluate.application.evaluation?.remorseScore === 'number', 'Evaluation stored on application');

    console.log(`\nHTTP Test Evaluation Output:`);
    console.log(`  - Status: ${dataEvaluate.application.status}`);
    console.log(`  - Remorse Score: ${dataEvaluate.application.evaluation?.remorseScore}`);
    console.log(`  - Responsibility: ${dataEvaluate.application.evaluation?.responsibility}`);
    console.log(`  - Assessment Summary: "${dataEvaluate.application.evaluation?.summary}"`);

    console.log(`\n=== FINAL SUMMARY: ${passed} Passed, ${failed} Failed ===`);
    if (failed > 0) process.exit(1);

  } catch (err) {
    console.error('HTTP test error:', err);
    process.exit(1);
  }
}

testHttpEndpoints();
