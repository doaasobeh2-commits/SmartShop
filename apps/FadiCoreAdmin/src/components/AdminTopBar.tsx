import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Bell, Search, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminUi } from "../context/AdminUiContext";
import { searchIndex } from "../data/searchIndex";

type AdminTopBarProps = {
  crumb: string;
  crumbHref?: string;
  section: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchMode?: "navigate" | "filter";
};

export function AdminTopBar({
  crumb,
  crumbHref = "/platform-overview",
  section,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search signals, households...",
  searchMode = "navigate",
}: AdminTopBarProps) {
  const navigate = useNavigate();
  const { showNotice } = useAdminUi();
  const [internalQuery, setInternalQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const isControlled = typeof onSearchChange === "function";
  const query = isControlled ? (searchValue ?? "") : internalQuery;

  const results = useMemo(() => {
    if (searchMode === "filter") return [];
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchIndex.filter(
      (hit) =>
        hit.label.toLowerCase().includes(q) ||
        hit.meta.toLowerCase().includes(q),
    );
  }, [query, searchMode]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function setQuery(next: string) {
    if (isControlled) {
      onSearchChange?.(next);
    } else {
      setInternalQuery(next);
    }
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    if (searchMode === "filter") {
      showNotice(
        query.trim()
          ? `Filtering endpoints for “${query.trim()}”`
          : "Showing all endpoints",
      );
      setOpen(false);
      return;
    }

    const first = results[0];
    if (first) {
      navigate(first.href);
      setOpen(false);
      setQuery("");
      showNotice(`Opened ${first.label}`);
      return;
    }
    if (query.trim()) {
      showNotice(`No results for “${query.trim()}”`);
    }
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <nav aria-label="Breadcrumb" className="text-[12.5px] text-slate-label">
        <Link to={crumbHref} className="transition-colors hover:text-navy">
          {crumb}
        </Link>
        <span className="mx-1.5 text-slate-icon">›</span>
        <span className="text-slate-body">{section}</span>
      </nav>

      <div className="flex items-center gap-2.5">
        <div ref={rootRef} className="relative w-[280px] max-w-full">
          <form onSubmit={submitSearch}>
            <label className="relative block">
              <span className="sr-only">Search</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-icon"
                size={15}
                strokeWidth={1.75}
              />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setOpen(searchMode === "navigate");
                }}
                onFocus={() => {
                  if (searchMode === "navigate") setOpen(true);
                }}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-full border border-transparent bg-[#EBEEF5] py-2 pl-9 pr-3 text-[12.5px] text-navy-ink outline-none placeholder:text-slate-label focus:border-navy/20 focus:bg-white"
              />
            </label>
          </form>

          {searchMode === "navigate" && open && query.trim() && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-full overflow-hidden rounded-xl border border-slate-line bg-white shadow-card">
              {results.length === 0 ? (
                <div className="px-3 py-3 text-[12px] text-slate-label">
                  No matches
                </div>
              ) : (
                <ul>
                  {results.map((hit) => (
                    <li key={hit.id}>
                      <button
                        type="button"
                        className="flex w-full flex-col gap-0.5 px-3 py-2.5 text-left hover:bg-canvas"
                        onClick={() => {
                          navigate(hit.href);
                          setQuery("");
                          setOpen(false);
                        }}
                      >
                        <span className="text-[12.5px] font-medium text-navy-ink">
                          {hit.label}
                        </span>
                        <span className="text-[11px] text-slate-label">
                          {hit.meta}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label="Notifications"
          onClick={() =>
            showNotice(
              "3 unread alerts — see Recent Alerts on Platform Overview.",
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-icon transition-colors hover:bg-white hover:text-navy"
        >
          <Bell size={17} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          aria-label="Settings"
          onClick={() => showNotice("Admin settings panel coming soon.")}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-icon transition-colors hover:bg-white hover:text-navy"
        >
          <Settings size={17} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
