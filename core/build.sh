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
  -s EXPORTED_FUNCTIONS='["_add","_fibonacci","_get_ram_base","_get_ram_size"]' \
  -s EXPORTED_RUNTIME_METHODS='["cwrap","ccall"]' \
  -o ../web/build/wasm/os.js

echo "Build complete:web/build/wasm"