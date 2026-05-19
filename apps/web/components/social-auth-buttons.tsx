import { Locale, intlLocale } from '../lib/i18n';
const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function SocialAuthButtons({ locale, mode }: { locale: Locale; mode: 'login' | 'register' }) {
  const fa = locale === 'fa';
  const action = mode === 'login' ? (fa ? 'ورود' : 'Continue') : fa ? 'ثبت‌نام' : 'Sign up';

  return (
    <div className="grid gap-3">
      <SocialButton
        href={`${apiBase}/auth/social/google/start?locale=${locale}`}
        label={`${action} ${fa ? 'با Google' : 'with Google'}`}
        className="border border-black/10 bg-white text-[#101e30] hover:bg-black/[0.02]"
        icon={<GoogleIcon />}
      />
      <SocialButton
        href={`${apiBase}/auth/social/apple/start?locale=${locale}`}
        label={`${action} ${fa ? 'با Apple' : 'with Apple'}`}
        className="bg-black text-white hover:bg-black/90"
        icon={<AppleIcon />}
      />
    </div>
  );
}

function SocialButton({
  href,
  label,
  className,
  icon
}: {
  href: string;
  label: string;
  className: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={`flex items-center justify-center gap-3 rounded-md px-5 py-3 text-center text-sm font-medium transition ${className}`}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.083 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.991 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.991 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c1.649 4.657 6.219 8 11.697 8 3.059 0 5.842-1.154 7.961-3.039l5.657-5.657C33.64 6.053 28.991 4 24 4c-7.682 0-14.344 4.337-17.694 10.691z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 12.86c-.03-3.08 2.51-4.56 2.62-4.63-1.43-2.09-3.65-2.38-4.44-2.41-1.89-.19-3.69 1.11-4.65 1.11-.97 0-2.45-1.09-4.03-.95-2.07.16-3.97 1.2-5.03 3.05-2.15 3.72-.55 9.22 1.54 12.25 1.02 1.47 2.23 3.12 3.82 3.06 1.54-.06 2.12-1 3.98-1 1.86 0 2.38 1 4.01.97 1.66-.03 2.71-1.5 3.71-2.98 1.17-1.71 1.65-3.37 1.68-3.45-.04-.02-3.22-1.23-3.25-4.88zM14.67 4.75c.85-1.03 1.42-2.47 1.26-3.9-1.22.05-2.7.81-3.58 1.84-.79.91-1.48 2.37-1.29 3.77 1.36.1 2.76-.69 3.61-1.71z" />
    </svg>
  );
}

