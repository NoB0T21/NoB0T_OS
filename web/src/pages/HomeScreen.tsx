import { useState } from "react";
import { useKernel, type Allocation } from "@/bridge/useKernel";

const HomeScreen = () => {
  const { wasmModule, blocks, allocations, alloc, free } = useKernel();
  const [reqSize, setReqSize] = useState(64 * 1024);
  
  const totalRAM = wasmModule?._get_ram_size() ?? 0;
  const baseRAM = wasmModule?._get_ram_base() ?? 0;
  const usedRAM = blocks.filter(b => !b.isFree).reduce((acc, b) => acc + b.size, 0);

  if (!wasmModule) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg font-medium text-zinc-600">Loading WebAssembly module...</p>
      </div>
    );
  }

  return (
    <div className="p-[2rem]">
      <h2 className="text-2xl font-bold mb-4">Phase 1: Kernel Memory Visualizer</h2>
      <div>
        <div className="text-sm text-zinc-500">Base RAM: {baseRAM} Bytes</div>
        <div className="text-sm text-zinc-500 mb-2">Total RAM: {totalRAM / 1024} KB</div>
        <div className="mb-4">
          <div className="font-semibold">
            RAM Utilization: {totalRAM > 0 ? Math.round((usedRAM / totalRAM) * 100) : 0}% ({usedRAM} / {totalRAM} bytes)
          </div>
          <div className="text-sm text-zinc-600">Active Blocks: {blocks.length}</div>
        </div>

        {/* Controls */}
        <div style={{ marginBottom: 24 }}>
          <input
            type="number"
            step="1024"
            value={reqSize}
            onChange={(e) => setReqSize(Number(e.target.value))}
            className="border rounded border-zinc-300 mr-2 p-1.5"
          />
          <button
            onClick={() => alloc(reqSize)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded transition"
          >
            kalloc({reqSize} bytes)
          </button>
        </div>

        {/* Allocation Manager */}
        <h3 className="text-lg font-semibold mb-2">Allocated Handles</h3>
        <ul className="space-y-2">
          {allocations.map((a: Allocation) => (
            <li key={a.id} className="flex items-center gap-3">
              <span className="font-mono text-sm">Ptr: 0x{a.ptr.toString(16)} ({a.size} bytes)</span>
              <button
                onClick={() => free(a.ptr)}
                className="py-1 px-3 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition"
              >
                kfree()
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HomeScreen;