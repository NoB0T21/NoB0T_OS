#include <emscripten.h>

EMSCRIPTEN_KEEPALIVE
int add(int a, int b) {
	return a + b;
}

EMSCRIPTEN_KEEPALIVE
int fibonacci(int n) {
	if (n <= 1) return n;
	return fibonacci(n - 1) + fibonacci(n - 2);
}