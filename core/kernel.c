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

void* kalloc(size_t size) {
  if (size == 0) return NULL;
  size = ALIGN(size);
  BlockHeader* current = heap_start;

  while (current != NULL){
    if (current->is_free && current->size>=size){
      if (current->size >= size + HEADER_SIZE + ALIGNMENT) {
        BlockHeader* next_block = (BlockHeader*)((uint8_t*)current + HEADER_SIZE + size);
        next_block->size = current->size - size - HEADER_SIZE;
        next_block->is_free = true;
        next_block->next = current->next;

        current->size = size;
        current->next = next_block;
      }
      current->is_free = false;
      return (void*)((uint8_t*)current + HEADER_SIZE);
    }
    current = current->next;
  }
  return NULL;
};

void kfree(void* ptr) {
    if (!ptr) return;

    // Retrieve block header
    BlockHeader* header = (BlockHeader*)((uint8_t*)ptr - HEADER_SIZE);
    header->is_free = true;

    // Coalesce adjacent free blocks
    BlockHeader* current = heap_start;
    while (current != NULL && current->next != NULL) {
        if (current->is_free && current->next->is_free) {
            current->size += HEADER_SIZE + current->next->size;
            current->next = current->next->next;
        } else {
            current = current->next;
        }
    }
}

typedef struct {
    uint32_t offset;
    uint32_t size;
    uint32_t is_free;
} BlockSnapshot;

static BlockSnapshot snapshot_buffer[256];

int get_heap_snapshot(void) {
    BlockHeader* current = heap_start;
    int count = 0;

    while (current != NULL && count < 256) {
        snapshot_buffer[count].offset = (uint32_t)((uint8_t*)current - ram);
        snapshot_buffer[count].size = (uint32_t)(current->size + HEADER_SIZE);
        snapshot_buffer[count].is_free = current->is_free ? 1 : 0;

        current = current->next;
        count++;
    }
    return count;
}

uintptr_t get_snapshot_buffer(void) {
    return (uintptr_t)snapshot_buffer;
}