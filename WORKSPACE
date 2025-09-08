workspace(
    name = "bcr-web-ui",
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "buildifier_prebuilt",
    sha256 = "67c6c12f364df863b306b8f0a3b07cba949a964cce6116aeab1ca22980c7d6e4",
    strip_prefix = "buildifier-prebuilt-8.2.0",
    urls = [
        "https://github.com/keith/buildifier-prebuilt/archive/8.2.0.tar.gz",
    ],
)

load("@buildifier_prebuilt//:deps.bzl", "buildifier_prebuilt_deps")

buildifier_prebuilt_deps()

load("@bazel_skylib//:workspace.bzl", "bazel_skylib_workspace")

bazel_skylib_workspace()

load("@buildifier_prebuilt//:defs.bzl", "buildifier_prebuilt_register_toolchains")

buildifier_prebuilt_register_toolchains()
