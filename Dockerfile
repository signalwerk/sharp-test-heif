FROM node:20-bullseye

RUN apt-get update && apt-get install -y \
	build-essential \
	software-properties-common \
	ninja-build \
	python3-pip \
	pkg-config \
	wget \
	cmake 

# we need meson for openslide and libvips build
RUN pip3 install meson

WORKDIR /usr/local/src
ENV LD_LIBRARY_PATH=/usr/local/lib
# ENV PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:/usr/lib/aarch64-linux-gnu/pkgconfig



# openslide dependencies
RUN apt-get install -y \
	glib-2.0-dev \
	libcairo2-dev \
	libgdk-pixbuf-2.0-dev \
	libjpeg-dev \
	libopenjp2-7-dev \
	zlib1g-dev \
	libtiff-dev \
	libxml2-dev \
	libpng-dev \
	libsqlite3-dev 



# Install codec libraries first
RUN apt-get install -y \
	libx265-dev \
	libde265-dev \
	libaom-dev

# Build libheif from source with HEVC support
ARG LIBHEIF_VERSION=1.19.7
RUN wget https://github.com/strukturag/libheif/releases/download/v${LIBHEIF_VERSION}/libheif-${LIBHEIF_VERSION}.tar.gz \
	&& tar xfz libheif-${LIBHEIF_VERSION}.tar.gz \
	&& cd libheif-${LIBHEIF_VERSION} \
	&& mkdir build \
	&& cd build \
	&& cmake .. -DCMAKE_INSTALL_PREFIX=/usr/local -DWITH_X265=ON -DWITH_DE265=ON -DWITH_AOM=ON -DWITH_EXAMPLES=OFF -DWITH_GDK_PIXBUF=OFF \
	&& make -j$(nproc) \
	&& make install \
	&& ldconfig \
	&& echo "Checking libheif codecs:" \
	&& pkg-config --modversion libheif \
	&& ldconfig -p | grep heif

# stuff we need to build our own libvips ... this is a pretty random selection
# of dependencies, you'll want to adjust these
RUN apt-get install -y \
	libexpat-dev \
	librsvg2-dev \
	libarchive-dev \
	libexif-dev \
	liblcms2-dev

# build the head of the stable 8.16 branch (required for sharp 0.34.2+)
ARG VIPS_BRANCH=8.16
ARG VIPS_URL=https://github.com/libvips/libvips/tarball

RUN mkdir libvips-${VIPS_BRANCH} \
        && cd libvips-${VIPS_BRANCH} \
        && wget ${VIPS_URL}/${VIPS_BRANCH} -O - | \
		tar xfz - --strip-components 1

# "--libdir lib" makes it put the library in /usr/local/lib
# we don't need GOI
RUN cd libvips-${VIPS_BRANCH} \
        && rm -rf build \
        && meson setup build --libdir lib -Dintrospection=disabled \
        && cd build \
        && ninja \
        && ninja test \
        && ninja install \
        && ldconfig \
        && echo "Checking libvips HEIF support:" \
        && pkg-config --modversion vips \
        && vips list | grep -i heif || echo "HEIF not found in vips list"


WORKDIR /app

# Set environment variables to force sharp to build from source using our custom libvips
ENV SHARP_FORCE_GLOBAL_LIBVIPS=true
# ENV PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:/usr/lib/aarch64-linux-gnu/pkgconfig
ENV LD_LIBRARY_PATH=/usr/local/lib:/usr/lib

COPY package*.json ./

# Install dependencies and force sharp to rebuild with our custom libvips
RUN npm ci
RUN npm rebuild sharp

# Copy source files
COPY src/ ./src/

# Verify HEIC support is available
RUN node -e "const sharp = require('sharp'); console.log('Sharp version:', sharp.versions); console.log('HEIC support:', sharp.format.heif ? 'Available' : 'Not available'); console.log('Available formats:', Object.keys(sharp.format));"

EXPOSE 3000

CMD ["npm", "run", "scale"]
