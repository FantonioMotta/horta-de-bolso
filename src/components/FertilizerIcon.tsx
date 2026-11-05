import type { FertilizerId } from '../game/data';

interface FertilizerIconProps {
  id: FertilizerId;
  className?: string;
}

/**
 * Ícones desenhados à mão para os adubos, no mesmo traço do resto da horta.
 */
export function FertilizerIcon({ id, className }: FertilizerIconProps) {
  if (id === 'growth') {
    return (
      <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
        <ellipse cx="24" cy="38" rx="15" ry="5" fill="#6b4a30" opacity=".55" />
        <path
          d="M11 34c3-5 8-7 13-7s10 2 13 7c-4 4-9 5-13 5s-9-1-13-5Z"
          fill="#6f4d32"
        />
        <path d="M18 33c0-6 1-10 5-14" stroke="#4f7b3d" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M23 24c-4 0-7-2-8-6 5-1 8 2 8 6Z" fill="#8dbb62" />
        <path d="M23 29c5 0 8-3 9-7-5-1-8 2-9 7Z" fill="#6fa34d" />
        <path d="M30 19V8" stroke="#d9a13f" strokeWidth="2.8" strokeLinecap="round" />
        <path d="m25.5 12 4.5-4 4.5 4" stroke="#d9a13f" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="34" cy="33" r="2" fill="#8dbb62" opacity=".8" />
        <circle cx="14" cy="30" r="1.5" fill="#d9a13f" opacity=".7" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <ellipse cx="24" cy="38" rx="15" ry="5" fill="#6b4a30" opacity=".5" />
      <path d="M10 34c3-4 8-6 14-6s11 2 14 6c-4 3-9 5-14 5s-10-2-14-5Z" fill="#6f4d32" />
      <path d="M11 33c4-4 9-5 13-5s9 1 13 5" stroke="#d9bd7e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M14 30c2-3 5-4 8-4M26 26c4 0 7 2 9 4" stroke="#f0dcae" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M24 25c-4.2-5.4-6.2-8.5-6.2-11.4a6.2 6.2 0 0 1 12.4 0c0 2.9-2 6-6.2 11.4Z" fill="#8fc9dd" />
      <path d="M24 21.5c1.6-2.2 2.4-3.7 2.4-5.1a2.4 2.4 0 0 0-4.8 0c0 1.4.8 2.9 2.4 5.1Z" fill="#d7f0f6" opacity=".85" />
      <path d="M11 36c4 2 8 3 13 3s9-1 13-3" stroke="#b89a63" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}
