"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Home, LineChart, Settings, BotMessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/", label: "מעקב יומי", icon: Home },
    { href: "/coach", label: "שיחה עם AI", icon: BotMessageSquare },
    { href: "/reports", label: "דוחות", icon: LineChart },
    { href: "/settings", label: "הגדרות", icon: Settings },
  ];

  return (
    <SidebarProvider>
      <Sidebar side="right" className="border-l">
        <SidebarHeader className="p-4 items-center flex gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-7 w-7 text-primary"
            >
              <path d="M12 2a10 10 0 1 0 10 10" />
              <path d="M12 2a10 10 0 1 0 10 10" />
              <path d="M12 2v2" />
              <path d="M12 22v-2" />
              <path d="m22 12-2 0" />
              <path d="m4 12-2 0" />
              <path d="m19.78 4.22-1.42 1.42" />
              <path d="m5.64 18.36-1.42 1.42" />
              <path d="m19.78 19.78-1.42-1.42" />
              <path d="m5.64 5.64-1.42-1.42" />
              <path d="M12 6.5A5.5 5.5 0 1 0 12 17a5.5 5.5 0 0 0 0-10.5Z" />
            </svg>
          </div>
          <h1 className="text-xl font-headline font-bold">Health Companion</h1>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: "left" }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="p-3 border-b flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <SidebarTrigger className="md:hidden" />
          <h2 className="text-xl font-semibold font-headline flex-grow">
            {menuItems.find((item) => item.href === pathname)?.label ||
              "Health Journey Companion"}
          </h2>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
