import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function MessagesPage() {
  useEffect(() => {
    // Trigger the chat widget to open
    const chatButton = document.querySelector('[class*="fixed bottom-6 right-6"]') as HTMLButtonElement;
    if (chatButton && chatButton.textContent?.includes('MessageCircle')) {
      setTimeout(() => {
        chatButton.click();
      }, 100);
    }
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Μηνύματα Πελατών</h1>
              <p className="text-muted-foreground">
                Διαχείριση συνομιλιών με τους πελάτες σας
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Συνομιλίες
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Το παράθυρο μηνυμάτων άνοιξε
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Μπορείτε να δείτε και να διαχειριστείτε τις συνομιλίες σας στο παράθυρο κάτω δεξιά.
                  </p>
                  <Button
                    onClick={() => {
                      const chatButton = document.querySelector('[class*="fixed bottom-6 right-6"]') as HTMLButtonElement;
                      if (chatButton) {
                        chatButton.click();
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Άνοιγμα Μηνυμάτων
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}