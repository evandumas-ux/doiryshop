import React from 'react';

const Badge = ({ children }) => (
  <span className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-background border border-surface-border text-text-muted">
    {children}
  </span>
);

const VisaIcon = ({ className = 'w-10 h-4' }) => (
  <svg viewBox="0 0 60 20" className={className} aria-label="Visa" role="img">
    <rect x="0.75" y="0.75" width="58.5" height="18.5" rx="4" fill="none" stroke="currentColor" opacity="0.35" />
    <text x="30" y="13.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor">
      VISA
    </text>
  </svg>
);

const MastercardIcon = ({ className = 'w-12 h-4' }) => (
  <svg viewBox="0 0 72 20" className={className} aria-label="Mastercard" role="img">
    <rect x="0.75" y="0.75" width="70.5" height="18.5" rx="4" fill="none" stroke="currentColor" opacity="0.35" />
    <circle cx="30" cy="10" r="5.2" fill="currentColor" opacity="0.55" />
    <circle cx="42" cy="10" r="5.2" fill="currentColor" opacity="0.35" />
    <text x="56" y="13.2" textAnchor="middle" fontSize="8.2" fontWeight="700" fill="currentColor">
      MC
    </text>
  </svg>
);

const CBIcon = ({ className = 'w-8 h-4' }) => (
  <svg viewBox="0 0 44 20" className={className} aria-label="Carte Bancaire" role="img">
    <rect x="0.75" y="0.75" width="42.5" height="18.5" rx="4" fill="none" stroke="currentColor" opacity="0.35" />
    <text x="22" y="13.5" textAnchor="middle" fontSize="10" fontWeight="800" fill="currentColor">
      CB
    </text>
  </svg>
);

const LockIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-label="SSL" role="img" fill="none">
    <path
      d="M7.5 11V8.5a4.5 4.5 0 0 1 9 0V11"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M6.5 11h11a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5v-7A1.5 1.5 0 0 1 6.5 11Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M12 15.3v2.2"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

export default function PaymentBadges({ className = '', size = 'md', showText = true }) {
  const rowGap = size === 'sm' ? 'gap-2' : 'gap-2.5';
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs';

  return (
    <div className={`flex flex-wrap items-center ${rowGap} ${className}`}>
      <Badge>
        <VisaIcon />
      </Badge>
      <Badge>
        <MastercardIcon />
      </Badge>
      <Badge>
        <CBIcon />
      </Badge>
      <Badge>
        <span className="inline-flex items-center gap-2">
          <LockIcon />
          {showText && <span className={`${textSize} font-medium`}>SSL sécurisé</span>}
        </span>
      </Badge>
    </div>
  );
}

