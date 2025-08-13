import { Link, useRouterState } from "@tanstack/react-router";

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

export default function SidebarItem({ to, icon, label }: SidebarItemProps) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const isActive = pathname === to || pathname.startsWith(to + "/");
  return (
    <Link
      to={to}
      aria-current={isActive ? "page" : undefined}
      className={`flex flex-col items-center gap-1 px-1 py-1 transition-colors duration-150
        ${isActive ? "text-primary" : "text-font/60 hover:text-primary"}
      `}
    >
      {/* Icon only, no containers for a minimal look */}
      <span className="leading-none">{icon}</span>
      <span
        className={`text-[13px] ${isActive ? "text-primary" : "text-font/60"}`}
      >
        {label}
      </span>
    </Link>
  );
}
