import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebarHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          className="data-[slot=sidebar-menu-button]:!p-1.5"
        >
          <Link to="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <ShieldCheck className="size-5 text-primary" />
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-secondary-foreground">
                  Audita
                </span>
              </div>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
