import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { jwtDecode } from "jwt-decode";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Settings, User, LogOut, HelpCircle, Home, Menu, X, Moon, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TohekoJwtPayload {
  sub: string;
  role: string[];
  [key: string]: any;
}

interface LoaneeDashboardHeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const LoaneeDashboardHeader: React.FC<LoaneeDashboardHeaderProps> = ({ toggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode<TohekoJwtPayload>(token) : { sub: "Loanee User", role: ["LOANEE"] };
  const [notificationCount] = useState(2);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('loanee-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('loanee-dark-mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const userInitials = getInitials(decoded.sub || "Loanee User");

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("You have been logged out successfully");
    navigate("/loanee/login");
  };

  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="h-16 px-2 sm:px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden" aria-label="Toggle sidebar">
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
          <h1 className="ml-2 sm:ml-4 text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
            Loanee Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Dark Mode Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="hidden sm:flex">
            {isDarkMode ? <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />}
          </Button>
          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                {notificationCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 sm:w-80" align="end">
              <DropdownMenuLabel className="flex justify-between items-center">
                <span>Notifications</span>
                <Link to="/loanee/notifications" className="text-xs text-primary hover:underline">
                  View All
                </Link>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                <DropdownMenuItem className="py-3 cursor-default">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span className="font-medium">Application Update</span>
                      <span className="text-xs text-muted-foreground">1 day ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Your loan application is under review.</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="py-3 cursor-default">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span className="font-medium">Welcome!</span>
                      <span className="text-xs text-muted-foreground">1 week ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Welcome to TohekoSACCO. Start by applying for a loan.</p>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" alt={decoded.sub} />
                  <AvatarFallback className="text-xs sm:text-sm">{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 sm:w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {decoded.sub}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Loanee
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <Link to="/loanee/profile" className="w-full">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <Link to="/loanee/settings" className="w-full">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Home className="mr-2 h-4 w-4" />
                <Link to="/" className="w-full">Back to Website</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span className="w-full">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default LoaneeDashboardHeader;
