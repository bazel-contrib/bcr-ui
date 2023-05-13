#!/usr/bin/env bash

bazel build @buildifier_prebuilt//:buildozer
cp $(bazel cquery --output=files @buildifier_prebuilt//:buildozer) ./bin/
