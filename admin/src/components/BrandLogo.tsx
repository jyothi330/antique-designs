import logoSrc from '../assets/logo.jpeg';

interface Props {
  className?: string;
  /** px height for the img tag (used when className alone isn't enough) */
  style?: React.CSSProperties;
}

/** Antique Designs brand logo — actual logo image */
export function BrandLogo({ className = 'h-8 w-auto', style }: Props) {
  return (
    <img
      src={logoSrc}
      alt="Antique Designs logo"
      className={className}
      style={style}
      draggable={false}
    />
  );
}
