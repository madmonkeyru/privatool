import { Link, useLocation } from "@tanstack/react-router";

export function ToolSwitch() {
  const pathname = useLocation({ select: (loc) => loc.pathname });
  return (
    <nav
      aria-label="Tools"
      className="flex items-center gap-0.5 rounded-full border border-line bg-surface p-1"
    >
      <SwitchItem to="/" active={pathname === "/"} label="Ninefold" />
      <SwitchItem to="/shape" active={pathname === "/shape"} label="Shape Solver" />
    </nav>
  );
}

function SwitchItem({ to, active, label }: { to: string; active: boolean; label: string }) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={
        "rounded-full px-3 py-1.5 text-sm font-medium transition-colors " +
        (active ? "bg-ink text-surface" : "text-muted hover:text-ink")
      }
    >
      {label}
    </Link>
  );
}
