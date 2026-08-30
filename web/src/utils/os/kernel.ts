export interface WasmModule {
  _get_ram_base: () => number;
  _get_ram_size: () => any;
  _add: (a: number, b: number) => number;
  _fibonacci: (n: number) => number;
  ccall: (ident: string, returnType: string, argTypes: string[], args: any[]) => any;
  cwrap: (ident: string, returnType: string, argTypes: string[]) => (...args: any[]) => any;
}