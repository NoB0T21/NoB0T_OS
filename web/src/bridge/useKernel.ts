import type { WasmModule } from '@/utils/os/kernel.js';
import { useEffect, useState } from 'react';

export function useKernel() {
  const [wasmModule, setWasmModule] = useState<WasmModule | null>(null);

  useEffect(() => {
    const loadWasm = async () => {
      try {
        // Import the wrapper script from Vite's public directory
        const createModule = (await import(/* @vite-ignore */ '../../build/wasm/os.js')).default;
        
        const instance = await createModule({
          locateFile: (path: string) => `../../build/wasm/${path}`,
        });

        setWasmModule(instance);
      } catch (err) {
        console.error("Failed to load Wasm module:", err);
      }
    };

    loadWasm();
  }, []);

  return { wasmModule };
}