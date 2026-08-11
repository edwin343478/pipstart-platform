interface DecorativeCornerShapesProps {
  variant?: "accent-primary" | "primary-accent";
}

export function DecorativeCornerShapes({
  variant = "accent-primary",
}: DecorativeCornerShapesProps) {
  const topRight =
    variant === "accent-primary"
      ? "bg-brand-accent/10"
      : "bg-brand-primary/20";

  const bottomLeft =
    variant === "accent-primary"
      ? "bg-brand-primary/20"
      : "bg-brand-accent/10";

  return (
    <>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full ${topRight}`}
      />

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full ${bottomLeft}`}
      />
    </>
  );
}