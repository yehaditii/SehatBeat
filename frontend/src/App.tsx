import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { AIAssistant } from "@/components/ai/AIAssistant";
import Index from "./pages/Index";
import ClinicalDocs from "./pages/ClinicalDocs";
import Symptomate from "./pages/Symptomate";
import Medicine from "./pages/Medicine";
import Reminders from "./pages/Reminders";
import LabTests from "./pages/LabTests";
import Doctors from "./pages/Doctors";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen w-full bg-background">
          <TopNavigation />
          <main className="w-full">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/clinical-docs" element={<ClinicalDocs />} />
              <Route path="/sehatbeat-ai" element={<Symptomate />} />
              <Route path="/medicine" element={<Medicine />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/lab-tests" element={<LabTests />} />
              <Route path="/doctors" element={<Doctors />} />
              {/* Legacy route redirect */}
              <Route path="/symptomate" element={<Symptomate />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <BottomNavigation />
          <AIAssistant />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
