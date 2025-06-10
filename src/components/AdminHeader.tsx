import { Bell, Search, User } from "lucide-react";
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

export function AdminHeader() {
  return (
    <header
      className="flex h-16 items-center justify-between border-b border-border px-6 bg-background"
      data-oid="1kxwj31"
    >
      <div
        className="flex items-center gap-4 flex-1 max-w-lg"
        data-oid=":cn1.a_"
      >
        <div className="relative flex-1" data-oid="44qc:66">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            data-oid="lea7yyc"
          />

          <Input
            type="search"
            placeholder="Αναζήτηση πελατών, μαθημάτων, κρατήσεων..."
            className="pl-10 bg-card border-border focus:border-primary focus:ring-primary text-foreground"
            data-oid="pw2i8zr"
          />
        </div>
      </div>

      <div className="flex items-center gap-3" data-oid="b7x3koj">
        {/* Ειδοποιήσεις */}
        <DropdownMenu data-oid="gs48ov4">
          <DropdownMenuTrigger asChild data-oid="xuphbql">
            <Button
              variant="ghost"
              size="sm"
              className="relative text-foreground hover:bg-accent hover:text-accent-foreground h-10 w-10 p-0"
              data-oid="j-so5g3"
            >
              <Bell className="h-5 w-5" data-oid="81-p1sc" />
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive p-0 text-xs text-destructive-foreground flex items-center justify-center"
                data-oid="x1h_55l"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 bg-popover border border-border z-50"
            data-oid="ain9934"
          >
            <DropdownMenuLabel
              className="font-semibold text-popover-foreground"
              data-oid="jexhy6u"
            >
              Ειδοποιήσεις
            </DropdownMenuLabel>
            <DropdownMenuSeparator data-oid="tgym_zi" />
            <DropdownMenuItem
              className="flex flex-col items-start gap-1 p-3 hover:bg-accent hover:text-accent-foreground"
              data-oid="zr6yxm1"
            >
              <div className="text-sm font-medium" data-oid="icy037g">
                Νέα εγγραφή χρήστη
              </div>
              <div className="text-xs opacity-75" data-oid="j5knuol">
                Ο Γιάννης Παπαδόπουλος εγγράφηκε πριν από 5 λεπτά
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex flex-col items-start gap-1 p-3 hover:bg-accent hover:text-accent-foreground"
              data-oid="78pt6_i"
            >
              <div className="text-sm font-medium" data-oid="fxr.kdj">
                Ακύρωση κράτησης μαθήματος
              </div>
              <div className="text-xs opacity-75" data-oid="6fjbmg-">
                Κράτηση HIIT ακυρώθηκε από τη Σάρα Κωνσταντίνου
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex flex-col items-start gap-1 p-3 hover:bg-accent hover:text-accent-foreground"
              data-oid="e4psi:6"
            >
              <div className="text-sm font-medium" data-oid="6s8k41f">
                Ειδοποίηση χαμηλού αποθέματος
              </div>
              <div className="text-xs opacity-75" data-oid="vw-98dt">
                Το απόθεμα πρωτεϊνούχας σκόνης τελειώνει
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
                  Διαχειριστής
                </span>
                <span
                  className="text-xs opacity-75 leading-tight"
                  data-oid=".c:bz3m"
                >
                  admin@sweat24.gr
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
              className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
              data-oid="zirmsuw"
            >
              Ρυθμίσεις Προφίλ
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
              data-oid="k-::lgt"
            >
              Προτιμήσεις Διαχειριστή
            </DropdownMenuItem>
            <DropdownMenuSeparator data-oid="a14:g8e" />
            <DropdownMenuItem
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              data-oid="kfk04ik"
            >
              Αποσύνδεση
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
