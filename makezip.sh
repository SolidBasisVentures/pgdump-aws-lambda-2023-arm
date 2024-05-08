#!/bin/bash
set -e

FILENAME="pgdump-aws-lambda.zip"
BUILD_DIR="./build"

command_exists () {
    type "$1" &> /dev/null ;
}

if ! command_exists zip ; then
  echo "zip command not found, try: sudo apt-get install zip"
  exit 1
fi
if [ ! -f ./package.json ]; then
  echo "command must be run from the project root directory"
  exit 1
fi

# remove build
echo "Preparing..."
if test -d "$BUILD_DIR"; then
  rm -r ./build
fi

# compile typescript
echo "Compiling ts..."
npx tsc

# copy binaries into build
echo "Including binaries..."
cp -r ./bin ./build

# create zip of bundle/
echo "zipping..."
cd ./build && zip -q -r ../$FILENAME . && cd ..

# copy the zip
mkdir -p ./dist
mv $FILENAME ./dist/$FILENAME

# cleanup
echo "Cleaning up.."
rm -r ./build

echo "Successfully created dist/$FILENAME!"

