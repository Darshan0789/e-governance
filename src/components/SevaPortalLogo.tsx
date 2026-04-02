/** Brand logo (file: `public/sevaportal-logo.png`) */
interface SevaPortalLogoProps {
  /** nav: main site header · compact: in-app dashboard headers · auth: login/signup hero */
  variant?: 'nav' | 'compact' | 'auth';
  className?: string;
}

export default function SevaPortalLogo({ variant = 'nav', className = '' }: SevaPortalLogoProps) {
  const height =
    variant === 'auth' ? 'h-12 sm:h-14' : variant === 'compact' ? 'h-7 sm:h-8' : 'h-9 sm:h-10';

  return (
    <img
      src="/sevaportal-logo.png"
      alt="Seva Portal — sevaportal.in"
      className={`w-auto max-w-[200px] sm:max-w-[240px] object-contain object-left ${height} ${className}`}
    />
  );
}
