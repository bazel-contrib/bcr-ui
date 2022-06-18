#!/usr/bin/env bash

bazel build @buildtools//buildozer
cp $(bazel info bazel-bin)/external/buildtools/buildozer/buildozer_/buildozer ./bin/