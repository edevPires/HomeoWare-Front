import SidebarItem from "./sidebar-item";
import { UserIcon, WarehouseIcon, ShoppingCartIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import LogoFull from "../../assets/logo_full.png";

export default function Sidebar() {
  return (
    <aside
      aria-label="Navegação principal"
      className="fixed top-0 left-0 w-15 sm:20 h-dvh border-r border-light-border bg-light"
    >
      <div className="h-full flex flex-col items-center py-6">
        {/* Logo */}
        <Link
          to="/hub/estoque"
          aria-label="Ir para a página inicial"
          className="mb-4 flex justify-center"
        >
          <img src={LogoFull} alt="HomeoWare" className="h-auto w-4/5" />
        </Link>

        <nav className="flex flex-col items-center gap-4">
          <SidebarItem
            to="/hub/estoque"
            icon={<WarehouseIcon size={20} />}
            label="Estoque"
          />
          <SidebarItem
            to="/hub/cadastros"
            icon={<UserIcon size={20} />}
            label="Cadastro"
          />
          <SidebarItem
            to="/hub/pedidos"
            icon={<ShoppingCartIcon size={20} />}
            label="Pedidos"
          />
        </nav>
        <div className="mt-auto" />
      </div>
    </aside>
  );
}
