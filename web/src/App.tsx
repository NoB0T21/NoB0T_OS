import { Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import HomeScreen from "./pages/HomeScreen";


function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
    </Routes>
  );
}

const App = () => (
  <TooltipProvider>
    <HelmetProvider>
      <AppContent />
      <Toaster position="top-right" closeButton richColors />
    </HelmetProvider>
  </TooltipProvider>
);

export default App;
