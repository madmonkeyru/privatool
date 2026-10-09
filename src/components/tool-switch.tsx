import { Link, useLocation } from "@tanstack/react-router";

const TOOLS = [
  { to: "/", label: "Ninefold" },
  { to: "/shape", label: "Shapes" },
  { to: "/quadrant", label: "Dots" },
] as const;

export function ToolSwitch() {
  const pathname = useLocation({ select: (loc) => loc.pathname });
  return (
    <nav
      aria-label="Tools"
      className="flex items-center gap-0.5 rounded-full border border-line bg-surface p-1"
    >
      {TOOLS.map((tool) => (
        <Link
          key={tool.to}
          to={tool.to}
          aria-current={pathname === tool.to ? "page" : undefined}
          className={
            "rounded-full px-3 py-1.5 text-sm font-medium transition-colors " +
            (pathname === tool.to ? "bg-ink text-surface" : "text-muted hover:text-ink")
          }
        >
          {tool.label}
        </Link>
      ))}
    </nav>
  );
}
