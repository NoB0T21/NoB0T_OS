#include <stdio.h>
#include <stddef.h>
#include <stdbool.h>
#include <stdint.h>
#include <emscripten.h>

#define RAM_SIZE (1024 * 1024) //1MB simulation RAM
#define ALIGNMENT 8
#define ALIGN(size) (((size) + (ALIGNMENT - 1)) & ~(ALIGNMENT - 1))

typedef  struct BlockHeader {
  size_t size;
  bool is_free;
  struct BlockHeader* next;
} BlockHeader;

#define HEADER_SIZE sizeof(BlockHeader)

static uint8_t ram[RAM_SIZE];
static BlockHeader* heap_start = NULL;

void Kernel_init(void) {
  heap_start = (BlockHeader*)ram;
  heap_start->size = RAM_SIZE - HEADER_SIZE;
  heap_start->is_free = true;
  heap_start->next = NULL;
}

uintptr_t get_ram_base(void) {
  return (uintptr_t)ram;
}

EMSCRIPTEN_KEEPALIVE
size_t get_ram_size(void) {
  return  RAM_SIZE;
}