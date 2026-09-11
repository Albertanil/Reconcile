'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApplicationState, ApologyData } from '@backend/types/application';
import * as api from '@/lib/apiClient';

interface ApplicationContextType {
  application: ApplicationState | null;
  loading: boolean;
  error: string | null;
  ticketNumber: string;
  draftApology: Partial<ApologyData> & { statement?: string };
  startApplication: (applicantName?: string) => Promise<ApplicationState>;
  updateDraft: (fields: Partial<ApologyData> & { statement?: string }) => void;
  saveDraft: (additionalFields?: Partial<ApologyData> & { statement?: string }) => Promise<ApplicationState | null>;
  submitForm: () => Promise<ApplicationState>;
  submitApology: (statement?: string) => Promise<ApplicationState>;
  triggerEvaluation: () => Promise<ApplicationState>;
  resetError: () => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'reconcile_active_app_id';

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [application, setApplication] = useState<ApplicationState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [draftApology, setDraftApology] = useState<Partial<ApologyData> & { statement?: string }>({
    recipient: '',
    recipientPhone: '',
    incident: '',
    whatHappened: '',
    responsibility: '',
    impact: '',
    regret: '',
    prevention: '',
    statement: '',
  });

  // Session recovery on client mount
  useEffect(() => {
    const savedId = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
    if (savedId) {
      setLoading(true);
      api
        .getApplication(savedId)
        .then((app) => {
          setApplication(app);
          if (app.apology) {
            setDraftApology((prev) => ({ ...prev, ...app.apology }));
          }
        })
        .catch(() => {
          // If server restarted and in-memory session was lost, clear stale ID cleanly
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const resetError = () => setError(null);

  const startApplication = async (applicantName?: string): Promise<ApplicationState> => {
    setLoading(true);
    setError(null);
    setDraftApology({
      recipient: '',
      recipientPhone: '',
      incident: '',
      whatHappened: '',
      responsibility: '',
      impact: '',
      regret: '',
      prevention: '',
      statement: '',
    });
    try {
      const app = await api.createApplication(applicantName);
      setApplication(app);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, app.id);
      }
      return app;
    } catch (err: any) {
      const msg = err.message || 'Failed to start application';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDraft = (fields: Partial<ApologyData> & { statement?: string }) => {
    setDraftApology((prev) => ({ ...prev, ...fields }));
  };

  const saveDraft = async (additionalFields?: Partial<ApologyData> & { statement?: string }): Promise<ApplicationState | null> => {
    const combined = { ...draftApology, ...(additionalFields || {}) };
    setDraftApology(combined);

    if (!application?.id) return null;

    setLoading(true);
    setError(null);
    try {
      const updatedApp = await api.updateApologyDraft(application.id, combined);
      setApplication(updatedApp);
      return updatedApp;
    } catch (err: any) {
      setError(err.message || 'Failed to save draft');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const submitForm = async (): Promise<ApplicationState> => {
    if (!application?.id) {
      throw new Error('No active application session to submit');
    }
    setLoading(true);
    setError(null);
    try {
      // First ensure draft is updated on backend
      await api.updateApologyDraft(application.id, draftApology);
      // Then trigger backend submit action
      const submittedApp = await api.submitApplication(application.id);
      setApplication(submittedApp);
      return submittedApp;
    } catch (err: any) {
      const msg = err.message || 'Validation failed during submission';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitApology = async (statement?: string): Promise<ApplicationState> => {
    if (!application?.id) {
      throw new Error('No active application session to submit');
    }
    setLoading(true);
    setError(null);
    try {
      const existing = (application.apology || {}) as Partial<ApologyData>;
      const fullApology: ApologyData = {
        recipient: existing.recipient || (draftApology as any).recipient || 'Department of Interpersonal Affairs',
        recipientPhone: existing.recipientPhone || (draftApology as any).recipientPhone || '',
        incident: existing.incident || (draftApology as any).incident || 'Unspecified Incident',
        whatHappened: statement || existing.whatHappened || (draftApology as any).whatHappened || 'Statement of remorse filed.',
        responsibility: existing.responsibility || (draftApology as any).responsibility || '50%',
        impact: existing.impact || (draftApology as any).impact || 'Impact acknowledged',
        regret: existing.regret || (draftApology as any).regret || 'Regret expressed',
        prevention: existing.prevention || (draftApology as any).prevention || 'Prevention committed',
      };
      if (statement) {
        setDraftApology((prev) => ({ ...prev, ...fullApology, statement }));
      }
      await api.updateApologyDraft(application.id, fullApology);
      const submittedApp = await api.submitApplication(application.id);
      setApplication(submittedApp);
      return submittedApp;
    } catch (err: any) {
      const msg = err.message || 'Validation failed during submission';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const triggerEvaluation = async (): Promise<ApplicationState> => {
    if (!application?.id) {
      throw new Error('No active application session to evaluate');
    }
    setLoading(true);
    setError(null);
    try {
      const evaluatedApp = await api.evaluateApplication(application.id);
      setApplication(evaluatedApp);
      return evaluatedApp;
    } catch (err: any) {
      const msg = err.message || 'AI Evaluation failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const ticketNumber = application?.ticketNumber || 'A-001';

  return (
    <ApplicationContext.Provider
      value={{
        application,
        loading,
        error,
        ticketNumber,
        draftApology,
        startApplication,
        updateDraft,
        saveDraft,
        submitForm,
        submitApology,
        triggerEvaluation,
        resetError,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplication() {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
}
