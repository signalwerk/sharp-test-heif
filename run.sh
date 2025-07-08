#!/bin/bash

set -e

rm -rf ./TEST/IMG_8672_scaled_w300.jpg

# Build the image
docker build -t sharp-test-heif .
# docker build -t sharp-test-heif . --no-cache

# Scale HEIC images
docker run --rm -v $(pwd)/TEST:/app/TEST sharp-test-heif npm run scale

# go to bash in the container
# docker run -it --rm -v $(pwd)/TEST:/app/TEST sharp-test-heif bash