import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/hub/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-4 text-font">
      <h1 className="text-2xl font-bold">Bem-vindo ao Hub</h1>
      <p className="opacity-80 mt-2">Selecione uma opção na barra lateral.</p>
    </div>
  );
}
