workspace(
    name = "bcr-web-ui",
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "buildifier_prebuilt",
    sha256 = "29a50ea545810dc077c408d520eb83e9de3eecfe6395e89cb07149d903fc31e5",
    strip_prefix = "buildifier-prebuilt-6.1.2",
    urls = [
        "https://github.com/keith/buildifier-prebuilt/archive/6.1.2.tar.gz",
    ],
)

load("@buildifier_prebuilt//:deps.bzl", "buildifier_prebuilt_deps")

buildifier_prebuilt_deps()

load("@bazel_skylib//:workspace.bzl", "bazel_skylib_workspace")

bazel_skylib_workspace()

load("@buildifier_prebuilt//:defs.bzl", "buildifier_prebuilt_register_toolchains")

buildifier_prebuilt_register_toolchains()
