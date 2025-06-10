import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { UsersPage } from "./pages/UsersPage";
import { ClassesPage } from "./pages/ClassesPage";
import { BookingsPage } from "./pages/BookingsPage";
import { TrainersPage } from "./pages/TrainersPage";
import { StorePage } from "./pages/StorePage";
import { FinancePage } from "./pages/FinancePage";
import { AssessmentPage } from "./pages/AssessmentPage";
import { SettingsPage } from "./pages/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient} data-oid="._0d3w7">
    <TooltipProvider data-oid=":mffsbq">
      <Toaster data-oid="o3zenjs" />
      <Sonner data-oid="kagw6qa" />
      <BrowserRouter data-oid="g2xcp9o">
        <Routes data-oid="af.ytdz">
          <Route
            path="/"
            element={<Index data-oid="vvrwa.z" />}
            data-oid="7bppg2:"
          />
          <Route
            path="/users"
            element={<UsersPage />}
          />
          <Route
            path="/classes"
            element={<ClassesPage />}
          />
          <Route
            path="/bookings"
            element={<BookingsPage />}
          />
          <Route
            path="/trainers"
            element={<TrainersPage />}
          />
          <Route
            path="/store"
            element={<StorePage />}
          />
          <Route
            path="/finance"
            element={<FinancePage />}
          />
          <Route
            path="/assessment"
            element={<AssessmentPage />}
          />
          <Route
            path="/settings"
            element={<SettingsPage />}
          />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route
            path="*"
            element={<NotFound data-oid="at5us65" />}
            data-oid="h5u.oap"
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
