import { Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";

interface WasmModule {
  _add: (a: number, b: number) => number;
  _fibonacci: (n: number) => number;
  ccall: (ident: string, returnType: string, argTypes: string[], args: any[]) => any;
  cwrap: (ident: string, returnType: string, argTypes: string[]) => (...args: any[]) => any;
}

// Dashboard placeholder component for learning
const Dashboard = () => {
  const [wasm, setWasm] = useState<WasmModule | null>(null);
  const [addResult, setAddResult] = useState<number | null>(null);
  const [fibResult, setFibResult] = useState<number | null>(null);
  const [inputVal, setInputVal] = useState<number>(10);

  useEffect(() => {
    // Dynamically load the generated wrapper from public/
    const loadWasm = async () => {
      try {
        // Import the wrapper script from Vite's public directory
        // @ts-ignore
        const createModule = (await import(/* @vite-ignore */ '../build/wasm/math.js')).default;
        
        const instance = await createModule({
          locateFile: (path: string) => `../build/wasm/${path}`,
        });

        setWasm(instance);
      } catch (err) {
        console.error("Failed to load Wasm module:", err);
      }
    };

    loadWasm();
  }, []);

  const handleAdd = (a:number, b:number) => {
    if (!wasm) return;
    const res = wasm._add(a, b);
    setAddResult(res);
  };

  const handleFib = () => {
    if (!wasm) return;
    // Alternative: use cwrap
    const fib = wasm.cwrap('fibonacci', 'number', ['number']);
    setFibResult(fib(inputVal));
  };
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>React + C WebAssembly Demo</h2>

      {!wasm ? (
        <p>Loading WebAssembly module...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
          <div>
            <h3>1. Addition: add(20, 17)</h3>
            <button 
            className="bg-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-700 hover:scale-105 transition-[transform, background-color] duration-200 ease-in-out"
            onClick={() => handleAdd(20, inputVal)}>Calculate 20 + {inputVal}</button>
            {addResult !== null && <p>Result: <strong>{addResult}</strong></p>}
          </div>

          <div>
            <h3>2. Fibonacci</h3>
            <input
              type="number"
              value={inputVal}
              onChange={(e) => setInputVal(Number(e.target.value))}
              style={{ marginRight: '8px' }}
            />
            <button onClick={handleFib}>Run Fibonacci</button>
            {fibResult !== null && <p>Result: <strong>{fibResult}</strong></p>}
          </div>
        </div>
      )}
    </div>
  )
}

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
