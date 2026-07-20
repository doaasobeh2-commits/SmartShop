import { AdminDishImage } from "../components/AdminDishImage";
import type { DishFocalPoint } from "../components/responsiveDishImage";

const PREVIEW_SPECS = [
  { key: "mobile-sm", label: "Small phone", preset: "mobile-sm" as const },
  { key: "mobile-lg", label: "Large phone", preset: "mobile-lg" as const },
  { key: "tablet", label: "Tablet / desktop", preset: "tablet" as const },
];

type AdminImageCropPreviewsProps = DishFocalPoint & {
  imageUrl: string;
  title: string;
};

export function AdminImageCropPreviews({
  imageUrl,
  title,
  focalPointX,
  focalPointY,
}: AdminImageCropPreviewsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium" style={{ color: "var(--warm-gray)" }}>
        Responsive crop preview — confirm dish stays centered and recognizable
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {PREVIEW_SPECS.map(({ key, label, preset }) => (
          <div key={key}>
            <p className="mb-1 text-[0.65rem]" style={{ color: "var(--warm-gray)" }}>
              {label}
            </p>
            <AdminDishImage
              imageUrl={imageUrl}
              alt={`${title} — ${label}`}
              preset={preset}
              layout="preview"
              className="rounded-lg border"
              focalPointX={focalPointX}
              focalPointY={focalPointY}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
