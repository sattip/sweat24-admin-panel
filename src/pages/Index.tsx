import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { DashboardStats } from "@/components/DashboardStats";
import { RecentActivity } from "@/components/RecentActivity";
import { QuickActions } from "@/components/QuickActions";
import { dashboardApi, classesApi, usersApi } from "@/services/api";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [stats, setStats] = useState({
    activeMembers: 0,
    weeklyClasses: 0,
    satisfactionRate: 94
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWelcomeStats = async () => {
      try {
        setIsLoading(true);
        const [dashboardResponse, classesResponse] = await Promise.all([
          dashboardApi.getStats(),
          classesApi.getAll()
        ]);
        
        // Calculate weekly classes (this week)
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        
        const weeklyClasses = classesResponse.data || classesResponse || [];
        
        setStats({
          activeMembers: dashboardResponse.active_members || 0,
          weeklyClasses: weeklyClasses.length,
          satisfactionRate: 94 // Keep static for now
        });
      } catch (error) {
        console.error('Error fetching welcome stats:', error);
        // Keep default values on error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWelcomeStats();
  }, []);

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
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm opacity-80">Φόρτωση στατιστικών...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-center" data-oid=":0n4sml">
                      <div className="text-2xl font-bold" data-oid="9jnqwkd">
                        {stats.activeMembers.toLocaleString()}
                      </div>
                      <div className="text-sm opacity-80" data-oid="s_jyvfq">
                        Ενεργά Μέλη
                      </div>
                    </div>
                    <div className="text-center" data-oid="ydblz9b">
                      <div className="text-2xl font-bold" data-oid="3m:l09i">
                        {stats.weeklyClasses}
                      </div>
                      <div className="text-sm opacity-80" data-oid="p:jfry.">
                        Μαθήματα Αυτή την Εβδομάδα
                      </div>
                    </div>
                    <div className="text-center" data-oid="7h8egc4">
                      <div className="text-2xl font-bold" data-oid="dyw41x2">
                        {stats.satisfactionRate}%
                      </div>
                      <div className="text-sm opacity-80" data-oid="15svzcx">
                        Ποσοστό Ικανοποίησης
                      </div>
                    </div>
                  </>
                )}
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
