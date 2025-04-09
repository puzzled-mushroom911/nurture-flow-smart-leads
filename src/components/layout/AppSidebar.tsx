import React from "react";
import { 
  BarChart3, 
  MessageSquare, 
  Users, 
  BookOpen, 
  Settings, 
  LogOut,
  Lock
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useGHL } from "@/hooks/useGHL";

// Menu items for the sidebar
const navigationItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    url: "/",
  },
  {
    title: "Lead Inbox",
    icon: MessageSquare,
    url: "/leads",
  },
  {
    title: "Contacts",
    icon: Users,
    url: "/contacts",
  },
  {
    title: "Knowledge Base",
    icon: BookOpen,
    url: "/knowledge",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/settings",
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { connectGHL, installations } = useGHL();

  const handleConnectGHL = () => {
    connectGHL();
  };

  const handleSignOut = () => {
    // TODO: Implement sign out logic
    console.log("Sign out clicked");
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">NF</span>
          </div>
          <div className="font-semibold text-lg text-sidebar-foreground">
            Nurture Flow
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="w-full">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={handleConnectGHL}
                    disabled={installations.isLoading}
                  >
                    <Lock className="h-5 w-5 mr-2" />
                    <span>
                      {installations.data && installations.data.length > 0 
                        ? "Connect Another Location" 
                        : "Connect GoHighLevel"}
                    </span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
