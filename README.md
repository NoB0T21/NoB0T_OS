# NoB0T OS
it is a os simulator project

# PLAN
# Phase 1 Execution Plan: OS Simulator (React + C/WASM)

Concrete, buildable, week-by-week. Each milestone ends with something visibly working — don't move on until it does.

---

## 0. Project setup (Days 1–3)

### Repo structure
```
os-simulator/
├── core/                  # C source, compiled to WASM
│   ├── cpu.c / cpu.h
│   ├── memory.c / memory.h
│   ├── scheduler.c / scheduler.h
│   ├── fs.c / fs.h
│   ├── api.c              # exported functions (the JS↔C boundary)
│   └── build.sh           # emcc build script
├── web/                   # React app
│   ├── src/
│   │   ├── wasm/           # generated .js/.wasm + a loader wrapper
│   │   ├── components/
│   │   │   ├── CpuView.jsx
│   │   │   ├── MemoryView.jsx
│   │   │   ├── SchedulerView.jsx
│   │   │   ├── CodeEditor.jsx
│   │   │   └── Controls.jsx
│   │   ├── assembler/      # your toy-assembly assembler (JS)
│   │   └── App.jsx
│   └── package.json
└── docs/
    └── isa-spec.md         # your instruction set, written down BEFORE coding
```

### Toolchain checklist
- [ ] Install emsdk, run `./emsdk install latest && ./emsdk activate latest`, source `emsdk_env.sh`
- [ ] `emcc --version` works
- [ ] Create React app (Vite recommended over CRA — faster, simpler WASM asset handling)
- [ ] Compile a trivial `int add(int a, int b)` C file to WASM, call it from React, log result to console

**Milestone 0:** React button click → calls into WASM → C function returns a value → displayed on screen. This proves the whole toolchain works before you write any real logic.

---

## 1. Design the ISA first — on paper (Days 4–5)

Don't start coding the CPU until this doc exists in `docs/isa-spec.md`. Ambiguity here causes rewrites later.

Define:
- **Registers**: e.g. R0–R7, SP, PC, FLAGS (8 general purpose is plenty)
- **Word size**: 32-bit is simplest
- **Instruction encoding**: fixed-width (e.g. 4 bytes: opcode byte + operand bytes) is much easier than variable-length for a first build
- **Instruction set** (keep to ~20):
  - Data movement: `MOV`, `LOAD`, `STORE`
  - Arithmetic: `ADD`, `SUB`, `MUL`, `CMP`
  - Control flow: `JMP`, `JZ`, `JNZ`, `CALL`, `RET`
  - Stack: `PUSH`, `POP`
  - System: `HALT`, `NOP`, `SYSCALL` (stub for now)
- **Memory model**: flat array, e.g. 64KB simulated RAM, no segmentation yet
- **Calling convention**: decide now (e.g. args in R0–R3, return in R0, caller-saved vs callee-saved) — you'll need this for CALL/RET

**Milestone 1:** a written spec you could hand to someone else and they could implement it identically.

---

## 2. CPU core in C (Week 2–3)

### Build order (each step independently testable via a C `main()` with printf before touching WASM/React):

1. `cpu.h`: `struct CPU { uint32_t regs[8]; uint32_t pc, sp; uint8_t flags; }`
2. `memory.c`: flat byte array + `read8/16/32`, `write8/16/32` helpers
3. `cpu_step()`: fetch instruction at `mem[pc]`, decode opcode, dispatch via switch statement, execute, increment PC (unless jump/call)
4. Implement instructions one at a time, testing each with a hand-assembled byte sequence in a C unit test (no assembler needed yet — write raw bytes)
5. Flags register: implement CMP setting zero/negative/carry flags, then JZ/JNZ using them

### Now wire to WASM (`api.c`)
Expose a minimal, stable API — this is the contract React will depend on:
```c
EMSCRIPTEN_KEEPALIVE void cpu_reset(void);
EMSCRIPTEN_KEEPALIVE void cpu_load_program(uint8_t* bytes, int len);
EMSCRIPTEN_KEEPALIVE void cpu_step(void);
EMSCRIPTEN_KEEPALIVE void cpu_run(int max_steps);
EMSCRIPTEN_KEEPALIVE uint32_t cpu_get_reg(int index);
EMSCRIPTEN_KEEPALIVE uint32_t cpu_get_pc(void);
EMSCRIPTEN_KEEPALIVE uint8_t cpu_get_flags(void);
EMSCRIPTEN_KEEPALIVE uint8_t cpu_read_mem(uint32_t addr);
```
Use `cwrap`/`ccall` on the JS side, or generate a WASM_EXPORTED_FUNCTIONS list in your emcc build command.

### Build the assembler (JS, in `web/src/assembler/`)
- Two-pass assembler: pass 1 collects label addresses, pass 2 emits bytes, resolving jump/call targets
- Input: text like `MOV R0, 5\nADD R0, R1\nJZ loop`
- Output: `Uint8Array` fed straight into `cpu_load_program`

### React UI for this milestone
- `CodeEditor`: textarea, "Assemble & Load" button
- `CpuView`: table of register values, PC, flags — poll via `cpu_get_reg` after each step
- `Controls`: Step, Run, Reset, speed slider (interval-based auto-stepping)

**Milestone 2:** write a toy-assembly program that computes the 10th Fibonacci number, single-step through it, watch R0 accumulate the right value.

---

## 3. Memory manager simulation (Week 4–6)

### C side
1. Replace the flat "load program at 0" model with a proper memory layout: code segment, heap, stack, each at fixed address ranges (define in `docs/isa-spec.md` too)
2. Implement `heap_alloc(size)` / `heap_free(ptr)` as **simulated allocator logic operating on your fake RAM array**, not real C malloc — this is the whole point, you're modeling what malloc does
   - Start with first-fit using a linked list of block headers stored inside the simulated memory itself (this mirrors real allocator design)
   - Track: block start, size, free/used flag
3. Expose: `mem_alloc(size) -> addr`, `mem_free(addr)`, `mem_get_blocks() -> serialized list` (e.g. write block metadata into a fixed WASM memory region React can read directly via `HEAPU8`)
4. Add `SYSCALL` cases in the CPU for alloc/free so toy-assembly programs can request memory (this connects Milestone 2's CPU to this subsystem)

### Stretch: paging simulation
- Simple page table: divide simulated RAM into fixed pages (e.g. 4KB), map virtual page → physical frame
- Simulate a page fault: access to unmapped page triggers a fault flag React can display
- This is optional for v1 — first-fit heap alone already teaches fragmentation well

### React UI
- `MemoryView`: grid of blocks (color: green=free, red=used, gradient by size), hover shows addr/size
- Live update after each alloc/free triggered by running a program
- A "fragmentation meter" (total free bytes vs largest contiguous free block) is a nice visual payoff

**Milestone 3:** run a toy program that allocs/frees in a pattern that visibly fragments memory; watch it happen in the grid.

---

## 4. Scheduler simulation (Week 7–9)

This is the most conceptually rich part — budget real time for it.

### C side
1. `struct PCB { int pid; uint32_t regs[8], pc, sp; enum {READY,RUNNING,BLOCKED,DONE} state; int priority; }`
2. Support N processes (array or linked list of PCBs), each with **its own memory region or shared with bounds** — simplest: give each process its own small code segment
3. Implement **context switch**: save current CPU regs/PC into the running PCB, load next PCB's regs/PC into CPU — write this function carefully, it's the conceptual core of the whole OS
4. Scheduling algorithms as swappable functions with the same signature `PCB* pick_next(void)`:
   - Round robin (fixed time quantum)
   - Priority scheduling (with aging to avoid starvation — good discussion point)
   - MLFQ (multi-level feedback queue) — implement last, it's the most complex
5. Expose: `sched_add_process(bytes, len, priority)`, `sched_tick()` (advances one time unit, may trigger context switch), `sched_get_state()` (all PCB states for the UI)

### React UI
- `SchedulerView`: Gantt-chart timeline — a horizontal bar per time unit, colored by which PID ran
- Ready queue visualization (list of waiting PCBs, reordering as priorities/algorithm change)
- Dropdown to switch algorithm live, quantum slider for round robin
- Load 3–4 toy programs with different burst patterns to make scheduling differences visible

**Milestone 4:** load 3 processes with different priorities, switch between round-robin and priority scheduling, see the Gantt chart and average waiting time change accordingly.

---

## 5. Toy filesystem (Week 10–11, optional but strong for portfolio)

### C side
1. Simulated block device: another flat byte array, divided into fixed-size blocks (e.g. 512B)
2. Inode-like structure: `struct Inode { char name[32]; uint32_t size; uint32_t blocks[8]; bool is_dir; }`
3. Simple directory = array of inode indices
4. Operations: `fs_create`, `fs_write`, `fs_read`, `fs_delete`, `fs_list`
5. Hook `SYSCALL` for file I/O so toy programs can read/write files

### React UI
- File tree browser (directories/files)
- Block usage grid (like the memory grid, showing which blocks are allocated to which file)

**Milestone 5:** create a file from a toy-assembly program via syscall, see it appear in the file tree, see its blocks highlighted in the block-usage grid.

---

## 6. Integration + polish (Week 12–13)

- Serialize entire simulator state (CPU + memory + scheduler + fs) to JSON → save/load from localStorage or file download
- Build 3–5 preset demo programs (Fibonacci, a fragmentation-inducing alloc pattern, a multi-process scheduling demo) with one-click load
- Write the README: architecture diagram, what each subsystem models, how to build/run
- Deploy (GitHub Pages or Vercel — static WASM+React app, no backend needed)

**Final milestone:** a public link you can put in a portfolio, with a README explaining the OS concepts each visualization teaches.

---

## Suggested weekly time budget
| Weeks | Focus | Hrs/wk (part-time pace) |
|---|---|---|
| 1 | Setup + ISA design | 5–8 |
| 2–3 | CPU core + assembler | 8–10 |
| 4–6 | Memory manager | 8–10 |
| 7–9 | Scheduler | 10–12 |
| 10–11 | Filesystem | 6–8 |
| 12–13 | Integration/polish/deploy | 6–8 |

**Total: ~13 weeks at 8hrs/week ≈ 100–110 hours.** Faster if you already know React well (likely, given your background) — most of the time sink will be the C/WASM debugging loop, which is slower to iterate on than pure JS. Budget extra patience there specifically.

## Debugging tips specific to this stack
- `printf` in C compiled via emcc prints to the browser console by default — use it liberally during CPU/scheduler development
- When state seems wrong in React, check the C side first with a standalone `main()` test before suspecting the JS↔WASM boundary
- Struct layout mismatches between C and JS reads (e.g. reading a `uint32_t` at the wrong byte offset) are the most common bug class — keep a single source of truth for struct offsets, ideally exported as constants from C rather than hand-copied into JS