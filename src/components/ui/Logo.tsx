export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-8 w-8 text-base',
    md: 'h-12 w-12 text-xl',
    lg: 'h-16 w-16 text-2xl',
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-accent text-white shadow-sm shadow-accent/30 ${sizes[size]}`}
    >
      <i className="bi bi-lightning-charge-fill" aria-hidden="true" />
    </div>
  );
}
