#!/usr/bin/env bash
set -e

# Output directory
mkdir -p ./build/wasm

# Find all .c files inside ../core (including subdirectories)
C_FILES=$(find ../core -name "*.c" -not -path "../core/dist/*")

# Include directories (if you have header files inside core/include or core/)
INCLUDE_DIRS="-I../core -I../core/include"

echo "Compiling C sources to WebAssembly..."
emcc $C_FILES \
  $INCLUDE_DIRS \
  -O3 \
  -s WASM=1 \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s ENVIRONMENT=web \
  -s EXPORT_NAME='createMathModule' \
  -s EXPORTED_FUNCTIONS='["_Kernel_init", "_kalloc","_kfree","_get_ram_base","_get_ram_size","_get_heap_snapshot","_get_snapshot_buffer"]' \
  -s EXPORTED_RUNTIME_METHODS='["cwrap","ccall","getValue","HEAP32"]' \
  -o ../web/build/wasm/os.js

echo "Build complete:web/build/wasm"