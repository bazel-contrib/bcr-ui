import React from "react";

interface FooterProps { }

export const USER_GUIDE_LINK = "https://bazel.build/docs/bzlmod"
export const CONTRIBUTE_CTA_LINK = "https://github.com/bazelbuild/bazel-central-registry#roles"

export const Footer: React.FC<FooterProps> = () => {
  return (
      <footer className="flex items-center justify-center h-10 bottom-0">
        The Bazel Central Registry is maintained by the Bazel team and the Bazel Rules authors SIG
      </footer>
  )
}
