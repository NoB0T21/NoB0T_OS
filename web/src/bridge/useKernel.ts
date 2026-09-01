import type { WasmModule } from '@/utils/os/kernel.js';
import { useCallback, useEffect, useState } from 'react';

export function useKernel() {
  const [wasmModule, setWasmModule] = useState<WasmModule | null>(null);
  const [allocations, setAllocations] = useState([]); 
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    const loadWasm = async () => {
      try {
        // Import the wrapper script from Vite's public directory
        const createModule = (await import(/* @vite-ignore */ '../../build/wasm/os.js')).default;
        
        const instance = await createModule({
          locateFile: (path: string) => `../../build/wasm/${path}`,
        });
        instance?._Kernel_init();
        setWasmModule(instance);
      } catch (err) {
        console.error("Failed to load Wasm module:", err);
      }
    };

    loadWasm();
  }, []);

  const refreshHeap = useCallback(() => {
    if (!wasmModule) return;

    const count = wasmModule?._get_heap_snapshot();
    const bufPtr = wasmModule?._get_snapshot_buffer();
    const heap32 = wasmModule?.HEAP32;
    console.log("count",count,'/n',"bufPtr",bufPtr, '/n',"heap32", heap32)
    const newBlocks = [];
    const baseIdx = bufPtr >> 2;

    for (let i = 0; i < count; i++) {
      const offset = heap32[baseIdx + i * 3];
      const size = heap32[baseIdx + i * 3 + 1];
      const isFree = heap32[baseIdx + i * 3 + 2] === 1;

      newBlocks.push({ offset, size, isFree });
    }
    setBlocks(newBlocks);
  }, [wasmModule]);

  useEffect(() => {
    if (wasmModule) refreshHeap();
  }, [wasmModule, refreshHeap]);

  const alloc = async (size) => {
    if (!wasmModule) return;
    const ptr = await wasmModule?._kalloc(size);
    console.log(size, ptr)
    if (ptr !== 0) {
      setAllocations((prev) => [...prev, { ptr, size, id: Date.now() }]);
    }
    refreshHeap();
  };

  const free = (ptr) => {
    if (!wasmModule) return;
    wasmModule?._kfree(ptr);
    setAllocations((prev) => prev.filter((a) => a.ptr !== ptr));
    refreshHeap();
  };

  return { wasmModule, blocks, allocations, alloc, free };
}