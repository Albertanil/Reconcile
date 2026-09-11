import { ApplicationState, ApologyData } from '@backend/types/application';

/**
 * Frontend API client for Reconcile backend API routes.
 */
export async function createApplication(applicantName?: string): Promise<ApplicationState> {
  const res = await fetch('/api/application', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ applicantName: applicantName || 'Applicant' }),
  });

  const data = await res.json();
  if (!res.ok || !data.success || !data.application) {
    throw new Error(data.error || 'Failed to create application session');
  }
  return data.application;
}

export async function getApplication(idOrTicket: string): Promise<ApplicationState> {
  const param = idOrTicket.startsWith('A-') ? `ticketNumber=${idOrTicket}` : `id=${idOrTicket}`;
  const res = await fetch(`/api/application?${param}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json();
  if (!res.ok || !data.success || !data.application) {
    throw new Error(data.error || 'Application not found');
  }
  return data.application;
}

export async function updateApologyDraft(
  id: string,
  apology: Partial<ApologyData>
): Promise<ApplicationState> {
  const res = await fetch('/api/application', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      action: 'update',
      apology,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success || !data.application) {
    throw new Error(data.error || 'Failed to update apology draft');
  }
  return data.application;
}

export async function submitApplication(id: string): Promise<ApplicationState> {
  const res = await fetch('/api/application', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      action: 'submit',
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success || !data.application) {
    throw new Error(data.error || 'Failed to submit application');
  }
  return data.application;
}

export async function evaluateApplication(id: string): Promise<ApplicationState> {
  const res = await fetch(`/api/application/${id}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json();
  if (!res.ok || !data.success || !data.application) {
    throw new Error(data.error || 'Failed to trigger AI evaluation');
  }
  return data.application;
}

export async function dispatchApology(id: string): Promise<{
  success: boolean;
  status?: string;
  messageId?: string;
  notConfigured?: boolean;
  error?: string;
}> {
  const res = await fetch(`/api/application/${id}/dispatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  return res.json();
}

