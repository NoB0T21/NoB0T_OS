import { Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { KernelProvider } from "@/bridge/useKernel";
import HomeScreen from "./pages/HomeScreen";
import HomeLayout from "./components/Home/HomeLayout";


function AppContent() {
  return (
    <Routes>
      <Route element={<HomeLayout/>}>
        <Route path="/" element={<HomeScreen />} />
      </Route>
    </Routes>
  );
}

const App = () => (
  <KernelProvider>
    <TooltipProvider>
      <HelmetProvider>
        <AppContent />
        <Toaster position="top-right" closeButton richColors />
      </HelmetProvider>
    </TooltipProvider>
  </KernelProvider>
);

export default App;
