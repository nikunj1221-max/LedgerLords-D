import React, { FormEvent, useState } from 'react';
import { LockKeyhole, Mail, Moon, Sun, UserRound } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';

interface AuthScreenProps {
  unavailable?: boolean;
  onRetry?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ unavailable = false, onRetry }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error, signIn, signUp } = useAuthStore();
  const { theme, toggleTheme } = useWorkspaceStore();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (isSignUp) await signUp(name, email, password);
      else await signIn(email, password);
    } catch {
      // The store retains the server message for display.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-color)] text-[var(--text-primary)] flex items-center justify-center p-5">
      <section className="w-full max-w-md">
        

        <div className="text-center mb-8 flex flex-col items-center">
          <div className="inline-flex items-center justify-center px-4 py-2.5 rounded-2xl bg-white shadow-lg shadow-black/5 dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.6)] transition-all hover:scale-[1.02]">
            <img
              src="/saarthai-logo.jpg"
              alt="SaarthAI"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] sm:text-[11px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black border border-primary/30 shadow-sm shrink-0">
              v2.0
            </span>
            <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
              Adaptive AI Workspace
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-color)] bg-card p-6 md:p-8 shadow-xl">
          {unavailable ? (
            <div className="text-center">
              <h2 className="text-lg font-semibold">Can’t reach the server</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Start the backend, then try checking your session again.
              </p>
              {error && <p role="alert" className="mt-4 text-sm text-coral">{error}</p>}
              <button
                type="button"
                onClick={onRetry}
                style={{ background: 'linear-gradient(135deg, #fc5602 0%, #ffb703 100%)' }}
                className="mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md shadow-[#fc5602]/25"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {isSignUp ? 'Sign up to access your workspace.' : 'Sign in to continue to your workspace.'}
              </p>

              <div className="mt-4 flex h-40 w-full items-center justify-center sm:h-44">
                <img
                  src={isSignUp ? '/loaders/signup.svg' : '/loaders/login.svg'}
                  alt=""
                  aria-hidden="true"
                  className="h-full max-h-full w-full max-w-full object-contain"
                />
              </div>

              <form className="mt-6 space-y-4" onSubmit={submit}>
                {isSignUp && (
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">Full name</span>
                    <span className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--canvas-color)] px-3">
                      <UserRound className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                      <input
                        autoComplete="name"
                        required
                        maxLength={80}
                        value={name}
                        onChange={event => setName(event.target.value)}
                        placeholder="Your name"
                        className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-[var(--text-muted)]"
                      />
                    </span>
                  </label>
                )}

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">Email</span>
                  <span className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--canvas-color)] px-3">
                    <Mail className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                    <input
                      autoComplete="email"
                      required
                      type="email"
                      maxLength={254}
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-[var(--text-muted)]"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">Password</span>
                  <span className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--canvas-color)] px-3">
                    <LockKeyhole className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                    <input
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                      required
                      type="password"
                      minLength={isSignUp ? 12 : undefined}
                      maxLength={128}
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      placeholder={isSignUp ? 'At least 12 characters' : 'Your password'}
                      className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-[var(--text-muted)]"
                    />
                  </span>
                </label>

                {error && <p role="alert" className="text-sm text-coral">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ background: 'linear-gradient(135deg, #fc5602 0%, #ffb703 100%)' }}
                  className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md shadow-[#fc5602]/25 transition-opacity hover:opacity-95 disabled:cursor-wait disabled:opacity-60"
                >
                  {isSubmitting ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
                {isSignUp ? 'Already have an account?' : 'New to SaarthAI?'}{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="font-semibold text-primary hover:underline"
                >
                  {isSignUp ? 'Sign in' : 'Create an account'}
                </button>
              </p>
              {isSignUp && (
                <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
                  Passwords must be at least 12 characters. Email verification and password reset will be added after email delivery is configured.
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
};
