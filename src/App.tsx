/**
 * Root application component with routing and global providers.
 */

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function isExtensionRuntime() {
  if (import.meta.env.MODE === "extension") return true;
  return typeof window !== "undefined" && window.location.protocol === "chrome-extension:";
}

const App = () => {
  const useHashRouter = isExtensionRuntime() || import.meta.env.VITE_ROUTER_MODE === "hash";
  const Router = useHashRouter ? HashRouter : BrowserRouter;

  const routes = (
    <Routes>
      <Route path="/" element={<Index />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          {routes}
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
