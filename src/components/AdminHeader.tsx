import { useState, useRef, useEffect } from "react";
import { Bell, Search, User, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { OwnerNotifications } from "./OwnerNotifications";
import { AdminSettingsModal } from "./AdminSettingsModal";
import { GlobalSearchResults } from "./GlobalSearchResults";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { useClickOutside } from "@/hooks/useClickOutside";

export function AdminHeader() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { searchState, handleSearch, clearSearch, navigateToResult } = useGlobalSearch();
  
  // Use custom hook for handling outside clicks and ESC key
  const searchRef = useClickOutside<HTMLDivElement>(showSearchResults, () => {
    setShowSearchResults(false);
    clearSearch();
  });

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Αποσύνδεση",
        description: "Αποσυνδεθήκατε με επιτυχία.",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSearchInput = (value: string) => {
    handleSearch(value);
    setShowSearchResults(value.trim().length > 0);
  };

  const handleSelectResult = (result: any) => {
    navigateToResult(result);
    setShowSearchResults(false);
  };

  const handleClearSearch = () => {
    clearSearch();
    setShowSearchResults(false);
  };

  return (
    <header
      className="flex h-16 items-center justify-between border-b border-border px-6 bg-background"
      data-oid="1kxwj31"
    >
      <div
        className="flex items-center gap-4 flex-1 max-w-lg"
        data-oid=":cn1.a_"
      >
        <div className="relative flex-1" ref={searchRef} data-oid="44qc:66">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            data-oid="lea7yyc"
          />

          <Input
            type="search"
            placeholder="Αναζήτηση πελατών, μαθημάτων, κρατήσεων..."
            className="pl-10 pr-10 bg-card border-border focus:border-primary focus:ring-primary text-foreground"
            value={searchState.query}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => searchState.query && setShowSearchResults(true)}
            data-oid="pw2i8zr"
          />

          {searchState.query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          {showSearchResults && (
            <GlobalSearchResults
              searchState={searchState}
              onSelectResult={handleSelectResult}
              onClose={() => setShowSearchResults(false)}
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-3" data-oid="b7x3koj">
        {/* Ειδοποιήσεις Ιδιοκτήτη */}
        <OwnerNotifications />

        {/* Προφίλ Διαχειριστή */}
        <DropdownMenu data-oid="edud97y">
          <DropdownMenuTrigger asChild data-oid="g6.43hk">
            <Button
              variant="ghost"
              className="flex items-center gap-3 p-2 text-foreground hover:bg-accent hover:text-accent-foreground h-auto"
              data-oid="nucawr5"
            >
              <Avatar className="h-8 w-8" data-oid="cgp1c:2">
                <AvatarImage
                  src="/admin-avatar.jpg"
                  alt="Διαχειριστής"
                  data-oid="_u34kic"
                />

                <AvatarFallback
                  className="bg-primary text-primary-foreground"
                  data-oid="-ezy6hw"
                >
                  <User className="h-4 w-4" data-oid="-m5w9zk" />
                </AvatarFallback>
              </Avatar>
              <div
                className="hidden md:flex flex-col items-start"
                data-oid="fsdk9rr"
              >
                <span
                  className="text-sm font-medium leading-tight"
                  data-oid="4kmseeq"
                >
                  {user?.name || 'Διαχειριστής'}
                </span>
                <span
                  className="text-xs opacity-75 leading-tight"
                  data-oid=".c:bz3m"
                >
                  {user?.email || 'admin@sweat24.com'}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-popover border border-border z-50"
            data-oid="dgstslw"
          >
            <DropdownMenuLabel className="text-popover-foreground" data-oid="lzk:t-d">
              Ο Λογαριασμός Μου
            </DropdownMenuLabel>
            <DropdownMenuSeparator data-oid="ivelhjl" />
            <DropdownMenuItem
              onClick={() => setSettingsOpen(true)}
              className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Ρυθμίσεις Διαχειριστή
            </DropdownMenuItem>
            <DropdownMenuSeparator data-oid="a14:g8e" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              data-oid="kfk04ik"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Αποσύνδεση
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <AdminSettingsModal 
        isOpen={settingsOpen} 
        onOpenChange={setSettingsOpen}
        triggerButton={false}
      />
    </header>
  );
}
