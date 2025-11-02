import React from 'react'

interface FooterProps {}

export const REPORT_LINK =
  'https://github.com/bazelbuild/bazel-central-registry/tree/main/docs#requesting-to-take-down-a-module'
export const BCR_UI_REPO_LINK = 'https://github.com/bazel-contrib/bcr-ui'
export const SIG_LINK = 'https://bazel-contrib.github.io/SIG-rules-authors/'

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="flex flex-col bg-bzl-green-dark text-white items-center justify-center gap-2 h-18 p-4 bottom-2">
      <div className="text-center">
        The Bazel Central Registry is maintained by the Bazel team and the{' '}
        <a href={SIG_LINK} className="underline hover:text-gray-200">
          Bazel Rules authors SIG.
        </a>
      </div>
      <div className="text-center">
        To report an issue with one of the modules, see the{' '}
        <a href={REPORT_LINK} className="underline hover:text-gray-200">
          instructions here
        </a>
        .
      </div>
      <div className="text-center">
        The source of this website can be found in{' '}
        <a href={BCR_UI_REPO_LINK} className="underline hover:text-gray-200">
          this repository
        </a>
        .
      </div>
    </footer>
  )
}
