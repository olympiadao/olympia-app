export function SectionDivider({
  variant = "default",
}: {
  variant?: "default" | "strong";
}) {
  return (
    <div
      className={`${variant === "strong" ? "section-divider-strong" : "section-divider"} mx-auto max-w-5xl`}
    />
  );
}
