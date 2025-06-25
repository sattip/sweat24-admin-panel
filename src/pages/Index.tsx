import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { DashboardStats } from "@/components/DashboardStats";
import { RecentActivity } from "@/components/RecentActivity";
import { QuickActions } from "@/components/QuickActions";

const Index = () => {
  return (
    <SidebarProvider data-oid="wvh3bab">
      <div className="min-h-screen flex w-full bg-background" data-oid="ejdikrx">
        <AdminSidebar data-oid="bl111xn" />

        <div className="flex-1 flex flex-col" data-oid="fqca_lh">
          <AdminHeader data-oid="bxotw5j" />

          <main className="flex-1 p-6 space-y-6" data-oid="s5miai-">
            {/* Τμήμα Καλωσορίσματος */}
            <div
              className="rounded-lg p-6 text-primary-foreground bg-primary"
              data-oid="dnwjpn:"
            >
              <h1 className="text-2xl font-bold mb-2" data-oid="x_jezxg">
                Καλώς ήρθατε στο Κέντρο Διαχείρισης Sweat24
              </h1>
              <p className="mb-4 opacity-90" data-oid="e08r_tj">
                Διαχειριστείτε το γυμναστήριό σας αποτελεσματικά με ολοκληρωμένα εργαλεία
                για πελάτες, μαθήματα και λειτουργίες.
              </p>
              <div className="flex gap-4" data-oid="cjw0c9x">
                <div className="text-center" data-oid=":0n4sml">
                  <div className="text-2xl font-bold" data-oid="9jnqwkd">
                    2,847
                  </div>
                  <div className="text-sm opacity-80" data-oid="s_jyvfq">
                    Ενεργά Μέλη
                  </div>
                </div>
                <div className="text-center" data-oid="ydblz9b">
                  <div className="text-2xl font-bold" data-oid="3m:l09i">
                    156
                  </div>
                  <div className="text-sm opacity-80" data-oid="p:jfry.">
                    Μαθήματα Αυτή την Εβδομάδα
                  </div>
                </div>
                <div className="text-center" data-oid="7h8egc4">
                  <div className="text-2xl font-bold" data-oid="dyw41x2">
                    94%
                  </div>
                  <div className="text-sm opacity-80" data-oid="15svzcx">
                    Ποσοστό Ικανοποίησης
                  </div>
                </div>
              </div>
            </div>

            {/* Στατιστικά Πίνακα Ελέγχου */}
            <DashboardStats data-oid=":35kw2w" />

            {/* Διάταξη Δύο Στηλών */}
            <div className="grid gap-6 lg:grid-cols-2" data-oid="2_ega4d">
              <RecentActivity data-oid="_ro:owf" />
              <QuickActions data-oid="d7pampn" />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
