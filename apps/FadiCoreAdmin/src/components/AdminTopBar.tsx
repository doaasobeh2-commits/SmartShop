type AdminTopBarProps = {
  title?: string;
  subtitle?: string;
  /** @deprecated legacy mock pages */
  crumb?: string;
  /** @deprecated legacy mock pages */
  section?: string;
  crumbHref?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchMode?: "navigate" | "filter";
};

/** Live admin header. Legacy mock pages may still pass crumb/section. */
export function AdminTopBar({
  title,
  subtitle,
  crumb,
  section,
}: AdminTopBarProps) {
  const heading = title ?? section ?? "Admin";
  const sub = subtitle ?? crumb;

  return (
    <header className="border-b border-slate-line bg-white px-4 py-5 lg:px-8">
      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-label">
        Fadi Core Admin
      </div>
      <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-navy-ink">
        {heading}
      </h1>
      {sub ? <p className="mt-1 text-[13px] text-slate-label">{sub}</p> : null}
    </header>
  );
}
