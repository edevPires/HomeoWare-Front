import { createFileRoute, Outlet } from "@tanstack/react-router";
import FullscreenLayout from "../components/layouts/fullscreen-layout";
import Sidebar from "../components/ui/sidebar";
import FloatingChatbot from "../components/ui/floating-chatbot";

export const Route = createFileRoute("/hub")({
  component: HubRoute,
});

function HubRoute() {
  return (
    <FullscreenLayout className="relative pl-15 sm:pl-20">
      <Sidebar />
      <Outlet />
      <FloatingChatbot />
    </FullscreenLayout>
  );
}
