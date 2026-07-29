type SectionHeaderProps = {
  label?: string;
  title: string;
  description?: string;
};

export default function SectionHeader({
  label,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="mb-8 sm:mb-10 max-w-2xl">
      {label ? (
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/35 mb-3">
          {label}
        </p>
      ) : null}
      <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white tracking-wide">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm sm:text-[15px] text-white/40 leading-relaxed font-light">
          {description}
        </p>
      ) : null}
    </div>
  );
}
