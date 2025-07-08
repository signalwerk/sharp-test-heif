# Sharp HEIC Support Docker

A working Dockerfile for Sharp with full HEIC/HEIF support. Compiles libheif and libvips from source to enable HEIC image processing.

## Quick Start

```bash
# Build and test
./run.sh

# Or manually:
docker build -t sharp-test-heif .
docker run --rm -v $(pwd)/TEST:/app/TEST sharp-test-heif npm run scale
```
