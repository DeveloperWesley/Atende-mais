import { useId } from "react";

export function Logo({ compact = false }) {
  const gradientId = useId().replaceAll(":", "");
  const verticalId = `atendeLogoVertical-${gradientId}`;
  const horizontalId = `atendeLogoHorizontal-${gradientId}`;

  return (
    <div className={`logo ${compact ? "logo-compact" : ""}`}>
      <span className="logo-mark" aria-hidden="true">
        <svg className="logo-svg" viewBox="0 0 64 64" focusable="false">
          <defs>
            <linearGradient id={verticalId} x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#20C8FF" />
              <stop offset="1" stopColor="#0867FF" />
            </linearGradient>
            <linearGradient id={horizontalId} x1="4" y1="32" x2="60" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#0867FF" />
              <stop offset="1" stopColor="#16D7DF" />
            </linearGradient>
          </defs>
          <rect x="22" y="4" width="20" height="56" rx="10" fill={`url(#${verticalId})`} />
          <rect x="4" y="22" width="56" height="20" rx="10" fill={`url(#${horizontalId})`} />
          <rect x="24" y="24" width="16" height="16" rx="5" fill="#18A9F4" opacity="0.72" />
        </svg>
      </span>
      {!compact && <strong>ATENDE+</strong>}
    </div>
  );
}
