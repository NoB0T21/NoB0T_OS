/* eslint-disable react-refresh/only-export-components */
import type { WasmModule } from '@/utils/os/kernel';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export interface MemoryBlock {
  offset: number;
  size: number;
  isFree: boolean;
}

export interface Allocation {
  ptr: number;
  size: number;
  id: number;
}

interface KernelContextType {
  wasmModule: WasmModule | null;
  blocks: MemoryBlock[];
  allocations: Allocation[];
  alloc: (size: number) => Promise<void> | void;
  free: (ptr: number) => void;
  totalRAM: number;
  baseRAM: number;
}

const KernelContext = createContext<KernelContextType | undefined>(undefined);

export const KernelProvider = ({ children }: { children: ReactNode }) => {
  const [wasmModule, setWasmModule] = useState<WasmModule | null>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [blocks, setBlocks] = useState<MemoryBlock[]>([]);

  const refreshHeap = useCallback((module = wasmModule) => {
    if (!module) return;

    const count = module._get_heap_snapshot();
    const bufPtr = module._get_snapshot_buffer();
    const heap32 = module.HEAP32;

    if (!heap32 || bufPtr === undefined) return;

    const newBlocks: MemoryBlock[] = [];
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
    let isMounted = true;

    const loadWasm = async () => {
      try {
        const createModule = (await import(/* @vite-ignore */ '../../build/wasm/os.js')).default;
        const instance = await createModule({
          locateFile: (path: string) => `../../build/wasm/${path}`,
        });
        
        if (isMounted) {
          instance?._Kernel_init();
          setWasmModule(instance);
          refreshHeap(instance);
        }
      } catch (err) {
        console.error("Failed to load Wasm module:", err);
      }
    };

    loadWasm();

    return () => {
      isMounted = false;
    };
  }, [refreshHeap]);

  const alloc = async (size: number) => {
    if (!wasmModule) return;
    const ptr = await wasmModule?._kalloc(size);
    if (typeof ptr === 'number' && ptr !== 0) {
      setAllocations((prev) => [...prev, { ptr, size, id: Date.now() }]);
    }
    refreshHeap();
  };

  const free = (ptr: number) => {
    if (!wasmModule) return;
    wasmModule?._kfree(ptr);
    setAllocations((prev) => prev.filter((a) => a.ptr !== ptr));
    refreshHeap();
  };

  const totalRAM = wasmModule?._get_ram_size() ?? 0;
  const baseRAM = wasmModule?._get_ram_base() ?? 0;

  return (
    <KernelContext.Provider value={{ wasmModule, blocks, allocations, alloc, free, totalRAM, baseRAM }}>
      {children}
    </KernelContext.Provider>
  );
};

export const useKernel = () => {
  const context = useContext(KernelContext);
  if (!context) {
    throw new Error('useKernel must be used within a KernelProvider');
  }
  return context;
};