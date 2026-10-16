
interface Props {
  className?: string;
}

/** Antique Designs star / lotus brand mark — inline SVG, no external assets */
export function BrandLogo({ className = 'w-8 h-8' }: Props) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none" aria-hidden="true">
      <path
        d="M40 6L48 28H72L53 42L61 64L40 52L19 64L27 42L8 28H32Z"
        stroke="#c98d1a"
        strokeWidth="3.5"
        fill="none"
      />
      <circle cx="40" cy="40" r="10" fill="#c98d1a" />
    </svg>
  );
}
