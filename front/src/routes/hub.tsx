import { createFileRoute, Outlet } from "@tanstack/react-router";
import FullscreenLayout from "../components/layouts/fullscreen-layout";
import Sidebar from "../components/ui/sidebar";

export const Route = createFileRoute("/hub")({
  component: HubRoute,
});

function HubRoute() {
  return (
    <FullscreenLayout className="relative pl-20">
      <Sidebar />
      <Outlet />
    </FullscreenLayout>
  );
}
