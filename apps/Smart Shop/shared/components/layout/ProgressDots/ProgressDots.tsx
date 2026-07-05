export type ProgressDotsProps = {
  total?: number;
  activeIndex: number;
};

export function ProgressDots({ total = 3, activeIndex }: ProgressDotsProps) {
  return (
    <div className="flex justify-center gap-1.5 pb-2 pt-4">
      {Array.from({ length: total }, (_, index) => (
        <div
          key={index}
          className="rounded-full transition-all duration-300"
          style={{
            width: index === activeIndex ? 20 : 6,
            height: 6,
            backgroundColor: index === activeIndex ? "#6366F1" : "rgba(255, 255, 255, 0.15)",
          }}
        />
      ))}
    </div>
  );
}
