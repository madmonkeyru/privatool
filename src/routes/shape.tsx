import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/shape")({ component: ShapePage });

function ShapePage() {
  return (
    <main
      aria-label="Shape Operator Solver"
      className="w-full overflow-hidden"
      style={{ height: "calc(100dvh - 3rem)" }}
    >
      <iframe
        src="/tools/shape-solver.html"
        title="Shape Operator Solver"
        className="h-full w-full border-0"
      />
    </main>
  );
}
