load("@bazel_env.bzl", "bazel_env")
load("@buildozer//:buildozer.bzl", "BUILDOZER_LABEL")

# Setup PATH via direnv
bazel_env(
    name = "bazel_env",
    tools = {
        "buildifier": "@buildifier_prebuilt//:buildifier",
        "buildozer": BUILDOZER_LABEL,
        "pnpm": "@pnpm",
    },
)
