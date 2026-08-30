import { useEffect, useState } from "react";
import { useKernel } from "@/bridge/useKernel";

const HomeScreen = () => {
  const { wasmModule } = useKernel();

  const [addResult, setAddResult] = useState<number | null>(null);
  const [fibResult, setFibResult] = useState<number | null>(null);
  const [inputVal, setInputVal] = useState<number>(10);
  
  const handleAdd = (a:number, b:number) => {
    const res = wasmModule._add(a, b);
    setAddResult(res);
  };
  
  const handleFib = () => {
    // Alternative: use cwrap
    const fib = wasmModule.cwrap('fibonacci', 'number', ['number']);
    setFibResult(fib(inputVal));
  };
  
  const totalRAM = wasmModule?._get_ram_size()
  const baseRAM = wasmModule?._get_ram_base()
  
  
  if (!wasmModule) return (<p>Loading WebAssembly module...</p>);

  return (
    <div className="p-[2rem]">
      <h2>React + C WebAssembly Demo</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
        <div>
          <h3>1. Addition: add(20, {inputVal})</h3>
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

      <h2>Phase 1: Kernel Memory Visualizer</h2>

      {/* Stats */}
      <div>
        <div>{baseRAM} Bytes</div>
        <div>{totalRAM/1024} KB</div>
        {/* <div>RAM Utilization: {Math.round((usedRAM / totalRAM) * 100)}% ({usedRAM} / {totalRAM} bytes)</div>
        <div>Active Blocks: {blocks.length}</div> */}
      </div>
    </div>
  )
}

export default HomeScreen