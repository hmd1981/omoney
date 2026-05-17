import { Suspense } from 'react';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-5">
      <div className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
        <p className="text-sm text-black/60">OMoney</p>
        <h1 className="text-2xl font-semibold">Admin sign in</h1>
        <p className="mt-2 text-sm text-black/60">Access to operations console requires authentication.</p>
        <Suspense fallback={<p className="mt-6 text-sm text-black/60">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
