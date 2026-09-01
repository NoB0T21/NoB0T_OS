import { useState } from "react";
import { useKernel } from "@/bridge/useKernel";

const HomeScreen = () => {
  const { wasmModule, blocks, allocations, alloc, free } = useKernel();
  const [reqSize, setReqSize] = useState(64 * 1024);
  
  const totalRAM = wasmModule?._get_ram_size()
  const baseRAM = wasmModule?._get_ram_base()
  const usedRAM = blocks.filter(b => !b.isFree).reduce((acc, b) => acc + b.size, 0);

  if (!wasmModule) return (<p>Loading WebAssembly module...</p>);

  return (
    <div className="p-[2rem]">

      <h2>Phase 1: Kernel Memory Visualizer</h2>
      <div>
        <div>{baseRAM} Bytes</div>
        <div>{totalRAM/1024} KB</div>
        <div style={{ marginBottom: 16 }}>
        <div>RAM Utilization: {Math.round((usedRAM / totalRAM) * 100)}% ({usedRAM} / {totalRAM} bytes)</div>
        <div>Active Blocks: {blocks.length}</div>
      </div>

      {/* Memory Bar */}
      <div style={{
        display: 'flex',
        width: '100%',
        height: 48,
        background: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid #999',
        marginBottom: 20
      }}>
        {blocks.map((block, idx) => {
          const widthPct = (block.size / totalRAM) * 100;
          return (
            <div
              key={idx}
              title={`Offset: 0x${block.offset.toString(16)} | Size: ${block.size}B | ${block.isFree ? 'FREE' : 'USED'}`}
              style={{
                width: `${widthPct}%`,
                height: '100%',
                backgroundColor: block.isFree ? '#4caf50' : '#f44336',
                borderRight: '1px solid #333',
                boxSizing: 'border-box'
              }}
            />
          );
        })}
      </div>

      {/* Controls */}
      <div style={{ marginBottom: 24 }}>
        <input
          type="number"
          step="1024"
          value={reqSize}
          onChange={(e) => setReqSize(Number(e.target.value))}
          style={{ marginRight: 8, padding: 6 }}
        />
        <button onClick={() => alloc(reqSize)} className="bg-indigo-600 px-3 py-1">
          kalloc({reqSize} bytes)
        </button>
      </div>

      {/* Allocation Manager */}
      <h3>Allocated Handles</h3>
      <ul>
        {allocations.map((a) => (
          <li key={a.id} style={{ marginBottom: 6 }}>
            <span>Ptr: 0x{a.ptr.toString(16)} ({a.size} bytes)</span>
            <button
              onClick={() => free(a.ptr)}
              className="m-12 py-2 px-88 bg-[#ff7961] rounded-md"
            >
              kfree()
            </button>
          </li>
        ))}
      </ul>
      </div>
    </div>
  )
}

export default HomeScreen