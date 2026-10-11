import React, { FormEvent, useState } from 'react';
import { Database, FileJson2, FileSpreadsheet, Loader2, Upload } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface DataOnboardingScreenProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export const DataOnboardingScreen: React.FC<DataOnboardingScreenProps> = ({ onComplete, onCancel }) => {
  const { user, uploadDataset, completeOnboarding } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await uploadDataset(file);
      onComplete?.();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload this file.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const skip = async () => {
    if (isSubmitting) return;
    if (onCancel) {
      onCancel();
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await completeOnboarding();
    } catch (skipError) {
      setError(skipError instanceof Error ? skipError.message : 'Could not continue right now.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-color)] text-[var(--text-primary)] flex items-center justify-center p-5">
      <section className="w-full max-w-xl rounded-2xl border border-[var(--border-color)] bg-card p-6 shadow-xl md:p-9">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Database className="h-6 w-6" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">NexusFlow setup</p>
        <h1 className="mt-2 text-2xl font-bold">Bring your data into your workspace</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          Upload a CSV or JSON file to save a private dataset to your account. You can skip this and start with the prompt page instead.
        </p>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Signed in as {user?.email}. Uploads are private to your account. CSV files need a header row; JSON files must be an array of objects. Maximum file size: 5 MB.
        </p>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          If an AI provider is configured, up to two sample rows per data group are sent to it to identify matching dashboard categories. The full dataset is not sent for classification.
        </p>

        <form className="mt-7 space-y-4" onSubmit={submit}>
          <label className="flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--canvas-color)] px-5 py-8 text-center transition-colors hover:border-primary/60">
            <Upload className="mb-3 h-6 w-6 text-primary" />
            <span className="text-sm font-semibold">{file?.name || 'Choose a data file'}</span>
            <span className="mt-1 text-xs text-[var(--text-muted)]">.csv or .json</span>
            <input
              type="file"
              accept=".csv,.json,text/csv,application/json"
              className="sr-only"
              onChange={event => {
                setFile(event.target.files?.[0] || null);
                setError(null);
              }}
            />
          </label>

          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1"><FileSpreadsheet className="h-4 w-4" /> CSV with headers</span>
            <span className="flex items-center gap-1"><FileJson2 className="h-4 w-4" /> JSON array</span>
          </div>

          {error && <p role="alert" className="text-sm text-coral">{error}</p>}
          <button
            type="submit"
            disabled={!file || isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-teal-400 px-4 py-3 text-sm font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Classifying and saving data…</span> : 'Upload and continue'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => void skip()}
          disabled={isSubmitting}
          className="mt-3 w-full rounded-xl border border-[var(--border-color)] px-4 py-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--canvas-color)] disabled:opacity-60"
        >
          {onCancel ? 'Return to workspace' : 'Skip for now and go to prompts'}
        </button>
      </section>
    </main>
  );
};
