import { useKernel } from "@/bridge/useKernel";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

const RamSidebar = () => {
  const { blocks, totalRAM } = useKernel();
  const [showRam, setShowRam] = useState<boolean>(false);

  return (
    <div className={`absolute top-0 right-0.5 items-center justify-start flex h-full py-3 ${showRam ? 'w-20' : 'w-6'} transition-[width] duration-200 ease-in-out z-50`}>
      <button 
        onClick={() => setShowRam(!showRam)}
        className="bg-zinc-200 h-16 text-zinc-900 rounded-l-xl shadow-md flex items-center justify-center cursor-pointer"
        aria-label="Toggle RAM Sidebar"
      >
        <ChevronLeft className={`transition-transform duration-200 ${showRam ? 'rotate-180' : ''}`} />
      </button>
        <div className="flex flex-col-reverse w-full h-full bg-green-500 rounded-lg border-2 overflow-clip border-zinc-200">
          {blocks.map((block, idx) => {
            const widthPct = totalRAM > 0 ? (block.size / totalRAM) * 100 : 0;
            return (
              <div
                key={idx}
                title={`Offset: 0x${block.offset.toString(16)} | Size: ${block.size}B | ${block.isFree ? 'FREE' : 'USED'}`}
                className={`${block.isFree ? 'bg-[#4caf50]' : 'bg-[#f44336]'} border border-zinc-900`}
                style={{
                  height: `${widthPct}%`,
                }}
              />
            );
          })}
        </div>
    </div>
  );
};

export default RamSidebar;