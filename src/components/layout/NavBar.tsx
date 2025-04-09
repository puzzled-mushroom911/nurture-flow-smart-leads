import React from "react";
import { 
  Bell, 
  Settings, 
  User, 
  Lock,
  LogOut
} from "lucide-react";
import {
  Navbar,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useGHL } from "@/hooks/useGHL";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NavBar() {
  const navigate = useNavigate();
  const { connectGHL, installations } = useGHL();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleConnectGHL = () => {
    connectGHL();
    setIsMenuOpen(false);
  };

  const handleSignOut = () => {
    // TODO: Implement sign out logic
    console.log("Sign out clicked");
    setIsMenuOpen(false);
  };

  const handleSettings = () => {
    navigate("/settings");
    setIsMenuOpen(false);
  };

  return (
    <Navbar>
      <NavbarContent>
        <NavbarMenuToggle
          className="sm:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        />
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-2">
        <NavbarItem>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleConnectGHL}
            disabled={installations.isLoading}
          >
            <Lock className="h-5 w-5" />
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </NavbarItem>
        <NavbarItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSettings}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu isOpen={isMenuOpen}>
        <NavbarMenuItem>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={handleConnectGHL}
            disabled={installations.isLoading}
          >
            <Lock className="mr-2 h-5 w-5" />
            {installations.data && installations.data.length > 0 
              ? "Connect Another Location" 
              : "Connect GoHighLevel"}
          </Button>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Button variant="ghost" className="w-full justify-start">
            <Bell className="mr-2 h-5 w-5" />
            Notifications
          </Button>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={handleSettings}
          >
            <Settings className="mr-2 h-5 w-5" />
            Settings
          </Button>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sign Out
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
