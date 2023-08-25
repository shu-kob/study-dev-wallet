FROM ubuntu:20.04 as builder

ARG BLOCKCHAIN_NODE_VERSION

RUN rm -rf /var/lib/apt/lists/* && apt-get update && apt-get install -y tzdata

ENV TZ=UTC

RUN apt-get update -y \
    && apt-get install -y \
        build-essential \
        libtool \
        autotools-dev \
        automake \
        pkg-config \
        libssl-dev \
        libevent-dev \
        bsdmainutils \
        libboost-dev \
        libboost-system-dev \
        libboost-filesystem-dev \
        libboost-program-options-dev \
        libboost-thread-dev \
        autotools-dev \
        git \
        libfmt-dev

RUN git clone https://github.com/bitcoin/bitcoin.git /workspace

WORKDIR /workspace

RUN git checkout ${BLOCKCHAIN_NODE_VERSION}

RUN ./autogen.sh

RUN ./configure --disable-wallet --disable-tests --disable-bench --without-gui

RUN V=1 make clean

RUN V=1 make -j2

RUN make install

FROM ubuntu:20.04

RUN apt-get update -y \
    && apt-get install -y \
        libtool \
        libssl-dev \
        libevent-dev \
        libboost-dev \
        libboost-system-dev \
        libboost-filesystem-dev \
        libboost-program-options-dev \
        libboost-thread-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY --from=builder "/usr/local/bin" /usr/local/bin

ENV BITCOIN_DATA=/root/.bitcoin

RUN mkdir -p ${BITCOIN_DATA}

CMD ["bitcoind"]
