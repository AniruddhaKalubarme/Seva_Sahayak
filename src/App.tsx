import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// React Query keeps server-state configuration in one place. The current app
// mostly uses local state, but this provider is ready for future API data.
const queryClient = new QueryClient();

const App = () => (
  // Providers wrap the routes so every screen can access these shared services.
<QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        {/* These components listen for notifications created by useToast/toast. */}
        <Toaster />
        <Sonner />
        {/* basename makes links work when the app is deployed under /Seva_Sahayak/. */}
        <BrowserRouter basename="/Seva_Sahayak/">
          <Routes>
            {/* The root route contains the complete upload-to-export workflow. */}
            <Route path="/" element={<Index />} />
            {/* Unknown URLs are handled by the fallback page. */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;