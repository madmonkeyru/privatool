import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/quadrant")({ component: QuadrantPage });

function QuadrantPage() {
  return (
    <main
      aria-label="Quadrant Dots"
      className="w-full overflow-hidden"
      style={{ height: "calc(100dvh - 3rem)" }}
    >
      <iframe
        src="/tools/quadrant-dots.html"
        title="Quadrant Dots"
        className="h-full w-full border-0"
      />
    </main>
  );
}
