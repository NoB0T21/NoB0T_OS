export interface WasmModule {
  _Kernel_init: () => void;
  _get_ram_base: () => number;
  _get_ram_size: () => number;
  _kalloc: (size: number) => number | void;
  _kfree: (ptr: number) => void;
  _get_heap_snapshot: () => number;
  _get_snapshot_buffer: () => number;
  HEAP32?: Int32Array;
  ccall: (ident: string, returnType: string, argTypes: string[], args: unknown[]) => unknown;
  cwrap: (ident: string, returnType: string, argTypes: string[]) => (...args: unknown[]) => unknown;
}