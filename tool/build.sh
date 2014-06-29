#!/bin/bash

SDK=addon-sdk-1.16
FILE=$SDK.tar.gz

mkdir build
curl https://ftp.mozilla.org/pub/mozilla.org/labs/jetpack/$FILE -o build/$FILE
tar -xf build/$FILE -C build
pushd build/$SDK
source bin/activate
popd

cfx xpi
