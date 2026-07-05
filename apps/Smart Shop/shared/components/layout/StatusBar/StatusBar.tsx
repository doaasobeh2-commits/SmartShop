export function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pb-1 pt-3">
      <span className="text-[11px] font-bold text-foreground-80">13:45</span>
      <div className="absolute left-1/2 top-3 h-6 w-28 -translate-x-1/2 rounded-full bg-black" />
      <div className="flex items-center gap-1">
        {[4, 5, 6, 7].map((height) => (
          <div
            key={height}
            className="w-[3px] rounded-[1px] bg-foreground-70"
            style={{ height }}
          />
        ))}
        <div className="ml-0.5 flex h-[9px] w-4 items-center rounded-[2px] border border-foreground-70 p-[1.5px]">
          <div className="h-full w-[60%] rounded-[1px] bg-foreground-70" />
        </div>
      </div>
    </div>
  );
}
