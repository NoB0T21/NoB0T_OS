import { Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

// Dashboard placeholder component for learning
const Dashboard = () => (
  <div className="flex flex-col items-center justify-center min-h-[60svh] text-center p-6 space-y-4">
    <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
    <p className="text-zinc-500 max-w-md">
      This is your root path route. Edit <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono font-bold">src/App.tsx</code> to customize this view.
    </p>
  </div>
);

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
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
